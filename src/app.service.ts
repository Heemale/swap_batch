import {Injectable, Logger} from '@nestjs/common';
import {Cron, CronExpression} from "@nestjs/schedule";
import BigNumber from "bignumber.js";

import {TaskDao} from "./transaction/dao/task.dao";
import {WalletDao} from "./wallet/dao/wallet.dao";
import {TransactionSwapDao} from "./transaction/dao/transaction-swap.dao";
import {TransactionApproveDao} from "./transaction/dao/transaction-approve.dao";
import {TransactionCollectDao} from "./transaction/dao/transaction-collect.dao";
import {TransactionSubsidyDao} from "./transaction/dao/transaction-subsidy.dao";
import {TransactionPrepareDao} from "./transaction/dao/transaction-prepare.dao";

import {WalletService} from "./wallet/wallet.service";
import {clusters, generate_approve_order, TransactionSubsidyService} from "./transaction/transaction-subsidy.service";
import {TransactionCollectService} from "./transaction/transaction-collect.service";
import {TransactionApproveService} from "./transaction/transaction-approve.service";
import {TransactionService} from "./transaction/transaction.service";
import {TransactionPrepareService} from "./transaction/transaction-prepare.service";

import {CreateWalletBatchDto} from "./wallet/dto/create-wallet-batch.dto";
import {GetWalletDto} from "./wallet/dto/get-wallet.dto";

import {StatusEnum, TaskStatus, TradeType, WalletSource} from "./common/enum";
import {get_balance, get_nonce, to_wei} from "./web3";
import {env, update_env} from "./config";
import {get_random, random, timestamp, uint256_max} from "./common/util";
import {TransferBatchDto} from "./web3/dto/transfer-batch.dto";
import {TransactionDto} from "./web3/dto/transaction.dto";
import {ApproveDto} from "./web3/dto/approve.dto";
import {SwapCreateDto} from "./transaction/dto/swap/swap-create.dto";
import {CollectBatchDto} from "./transaction/dto/collect/batch/collect-batch.dto";

@Injectable()
export class AppService {

    constructor(
        private readonly walletDao: WalletDao,
        private readonly transactionSubsidyDao: TransactionSubsidyDao,
        private readonly transactionApproveDao: TransactionApproveDao,
        private readonly transactionCollectDao: TransactionCollectDao,
        private readonly transactionSwapDao: TransactionSwapDao,
        private readonly taskDao: TaskDao,
        private readonly walletService: WalletService,
        private readonly transactionPrepareDao: TransactionPrepareDao,
        private readonly transactionSubsidyService: TransactionSubsidyService,
        private readonly transactionApproveService: TransactionApproveService,
        private readonly transactionCollectService: TransactionCollectService,
        private readonly transactionService: TransactionService,
        private readonly transactionPrepareService: TransactionPrepareService,
    ) {
    }

    private readonly create_subsidy_approve_logger = new Logger("定时任务：创建打款和授权");
    private readonly execute_subsidy_logger = new Logger("定时任务：执行打款");
    private readonly execute_approve_logger = new Logger("定时任务：执行授权");
    private readonly approve_process_logger = new Logger("定时任务：更新task授权进度");
    private readonly execute_swap_never_logger = new Logger("定时任务：执行swap_never");
    private readonly execute_swap_failed_logger = new Logger("定时任务：执行swap_filed");
    private readonly create_collect_logger = new Logger("定时任务：创建归集");
    private readonly execute_collect_logger = new Logger("定时任务：执行归集");
    private readonly update_env_logger = new Logger("定时任务：更新配置");


    @Cron(CronExpression.EVERY_MINUTE)
    async create_subsidy_approve() {

        this.create_subsidy_approve_logger.log("√");

        // 获取未执行的task
        const tasks = await this.taskDao.get(TaskStatus.NEVER);

        // 遍历tasks
        for (let i = 0; i < tasks.length; i++) {

            const task = tasks[i];
            const {
                id: task_id,
                wallet_source,
                wallet_create_counts,
                wallet_begin_num,
                wallet_limit_num
            } = task;
            const {id: admin_id} = task.admin;

            let token_address = "";
            const spender = env.ROUTER_CONTRACT_ADDRESS;

            // 交易类型
            if (task.trade_type === TradeType.BUY) {
                token_address = task.trade_pair.token1_address;
            } else if (task.trade_type === TradeType.SELL) {
                token_address = task.trade_pair.token0_address;
            } else {
                continue;
            }
            if (token_address === "") continue;

            // 钱包来源
            let begin_num, limit_num;
            if (wallet_source === WalletSource.CREATE) {
                // 创建钱包
                const createWalletBatchDto = new CreateWalletBatchDto(admin_id, task_id, wallet_create_counts);
                const result = await this.walletService.create(createWalletBatchDto);
                begin_num = result.begin_num;
                limit_num = result.limit_num;
            } else if (wallet_source === WalletSource.PICK) {
                // 选择钱包
                const getWalletDto = new GetWalletDto(wallet_begin_num, wallet_limit_num);
                const result = await this.walletDao.get_address(getWalletDto);
                if (result.length === 0) continue;
                begin_num = result[0].id;
                limit_num = result.length;
            } else {
                continue;
            }
            if (begin_num === undefined || limit_num === undefined) continue;

            // 分组
            const times_arr = clusters(begin_num, limit_num);

            // 更改task为准备中
            await this.taskDao.update_status(task_id, TaskStatus.PREPARE_ING);

            // 创建订单（准备）
            await this.transactionPrepareService.create(task_id, times_arr, token_address);

            // 获取所有记录（授权）
            const approve_list = await this.transactionApproveDao.get_all();

            // 生成订单（授权）
            const approve_order_list = generate_approve_order(approve_list, begin_num, limit_num, spender, [token_address], task_id);
            console.log({approve_order_list});

            // 创建订单（授权）
            await this.transactionApproveDao.create(approve_order_list);

        }

    };


    // @Cron(CronExpression.EVERY_MINUTE)
    async execute_subsidy() {

        this.execute_subsidy_logger.log("√");

        // 读取任务列表
        const result = await this.taskDao.get(TaskStatus.PREPARE_ING);

        // nonce_mapping
        const nonce_mapping: { [key: string]: bigint } = {};

        // 遍历tasks
        for (let i = 0; i < result.length; i++) {

            const task = result[i];
            const {
                id: task_id,
                subsidy_gas_max,
                subsidy_gas_min,
                subsidy_token_max,
                subsidy_token_min,
            } = task;
            const {
                id: admin_id,
                admin_address,
                admin_private_key
            } = task.admin;

            // 获取打款列表
            const prepare_list = await this.transactionPrepareDao.get(task_id);

            // 如果prepare_list长度为0，更改task为打款完成，进入下一次循环
            if (prepare_list.length === 0) {
                await this.taskDao.update_status(task_id, TaskStatus.PREPARE_DONE);
                continue;
            }

            // 如果未查询过nonce
            if (!(admin_address.toLowerCase() in nonce_mapping)) {
                nonce_mapping[admin_address.toLowerCase()] = await get_nonce(admin_address);
            }

            for (let j = 0; j < prepare_list.length; j++) {

                const {id, begin_num, limit_num, gas_status, token_status, token_address} = prepare_list[j];
                const getWalletDto = new GetWalletDto(begin_num, limit_num);

                // 空投转账参数组装
                const accounts: Array<string> = await this.walletDao.get_address(getWalletDto).then((list) => list.map((item) => item.address));
                const amounts: Array<string> = [];
                let msg_value = new BigNumber(0);
                let contract_address = "";
                let transferBatchDto;

                if (gas_status === StatusEnum.NEVER || gas_status === StatusEnum.FAILURE) {

                    for (let i = 0; i < accounts.length; i++) {
                        const amount = await to_wei(random(subsidy_gas_max.toString(), subsidy_gas_min.toString()));
                        amounts.push(amount);
                        msg_value = msg_value.plus(amount);
                    }

                    contract_address = env.TRANSFER_ETH_HELPER_ADDRESS;
                    transferBatchDto = new TransferBatchDto(accounts, amounts, "");

                } else if (token_status === StatusEnum.NEVER || token_status === StatusEnum.FAILURE) {

                    for (let i = 0; i < accounts.length; i++) {
                        const amount = await to_wei(random(subsidy_token_max.toString(), subsidy_token_min.toString()));
                        amounts.push(amount);
                    }

                    contract_address = env.TRANSFER_HELPER_ADDRESS;
                    transferBatchDto = new TransferBatchDto(accounts, amounts, token_address);

                }

                const transactionDto = new TransactionDto(admin_address, contract_address, msg_value.valueOf(), '', admin_private_key, nonce_mapping[admin_address.toLowerCase()]++);
                console.log(transferBatchDto, transactionDto, id);
                // 提交交易
                this.transactionSubsidyService.subsidy(transferBatchDto, transactionDto, id);
            }

        }
    }


    // @Cron(CronExpression.EVERY_5_MINUTES)
    async execute_approve() {

        this.execute_approve_logger.log("√");

        // 获取订单
        const orders = await this.transactionApproveDao.get_wrong();

        // 批量提交
        for (let i = 0; i < orders.length; i++) {

            const order = orders[i];
            const {id: order_id, token_address, spender} = order;
            const {address, private_key} = order.wallet;

            // 如果余额不大于0，跳过提交交易部分
            const balance = await get_balance(address);
            if (balance <= 0) continue;

            const nonce = await get_nonce(address);
            const approveDto = new ApproveDto(spender, uint256_max, token_address);
            const transactionDto = new TransactionDto(address, token_address, new BigNumber(0).valueOf(), '', private_key, nonce);

            // 提交交易
            this.transactionApproveService.approve(approveDto, transactionDto, order_id);
        }

    }


    // @Cron(CronExpression.EVERY_5_MINUTES)
    async approve_process() {

        // 获取打款完成的task
        const tasks = await this.taskDao.get(TaskStatus.PREPARE_DONE);

        // 遍历tasks
        for (let i = 0; i < tasks.length; i++) {

            const task = tasks[i];
            const {id: task_id, wallet_begin_num, wallet_limit_num} = task;
            const {id: admin_id} = task.admin;

            let token_address = "";
            const spender = env.ROUTER_CONTRACT_ADDRESS;

            // 交易类型
            if (task.trade_type === TradeType.BUY) {
                token_address = task.trade_pair.token1_address;
            } else if (task.trade_type === TradeType.SELL) {
                token_address = task.trade_pair.token0_address;
            } else {
                continue;
            }

            // 获取【钱包】是否授权了【使用者】【指定token】使用权
            const getWalletDto = new GetWalletDto(wallet_begin_num, wallet_limit_num);
            // TODO 有问题
            const success_counts = await this.transactionApproveDao.get_success_counts(getWalletDto);

            // 如果 交易成功的数量 和 limit_num 一样，更改task为授权完成
            if (success_counts === wallet_limit_num) await this.taskDao.update_status(task_id, TaskStatus.APPROVE_DONE);

        }

    }


    async create_swap() {

        // 获取授权完成的task
        const tasks = await this.taskDao.get(TaskStatus.APPROVE_DONE);

        // 遍历task
        for (let i = 0; i < tasks.length; i++) {

            const task = tasks[i];

            const {
                id: task_id,
                disposable_switch,
                dense_switch,
                range_switch,
                rangestarttime,
                rangeendtime,
                wallet_begin_num,
                wallet_limit_num,
                swap_max,
                swap_min,
                times,
            } = task;

            const {
                id: admin_id
            } = task.admin;

            let token_in = "";
            let token_out = "";

            // 交易类型
            if (task.trade_type === TradeType.BUY) {
                token_in = task.trade_pair.token1_address;
                token_out = task.trade_pair.token0_address;
            } else if (task.trade_type === TradeType.SELL) {
                token_in = task.trade_pair.token0_address;
                token_out = task.trade_pair.token1_address;
            } else {
                continue;
            }
            if (token_in === "" || token_out === "") continue;

            if (env.SWAP_SWITCH !== "1") continue;

            // 获取用户
            const getWalletDto = new GetWalletDto(wallet_begin_num, wallet_limit_num);
            const users = await this.walletDao.get_address(getWalletDto);

            // 生成订单（swap）
            let order_list = [];

            // 如果是区间交易
            if (range_switch === 1) {

                // 获取随机时间、排序
                const random_times = [];
                for (let i = 0; i < users.length * times; i++) {
                    random_times.push(get_random(rangestarttime, rangeendtime));
                }
                random_times.sort((a, b) => a - b);

                for (let i = 0; i < times; i++) {
                    for (let j = 0; j < users.length; j++) {
                        const wallet = users[j];
                        order_list.push(new SwapCreateDto(wallet.id, task_id, i + 1, 0, random_times[users.length * i + j], rangestarttime, rangeendtime, get_random(swap_max, swap_min), token_in, token_out, timestamp()));
                    }
                }

            } else {
                // 设置interval的对象
                let interval_map = {};

                // 获取swap记录中最大的时间戳
                const last_record = await this.transactionSwapDao.get_last_time();
                let total_interval = parseInt(String(last_record?.executetime));
                if (isNaN(total_interval)) total_interval = timestamp();

                for (let i = 0; i < times; i++) {

                    for (let j = 0; j < users.length; j++) {

                        const wallet = users[j];
                        const {id: wallet_id, interval_min, interval_max} = wallet;

                        if (interval_map[wallet_id] === undefined) {
                            interval_map[wallet_id] = get_random(interval_min, interval_max);
                        } else {
                            interval_map[wallet_id] += get_random(interval_min, interval_max);
                        }

                        let executetime = 0;
                        if (dense_switch === 0) {
                            total_interval = total_interval + interval_map[wallet_id] * 60;
                            executetime = total_interval;
                        } else if (dense_switch === 1) {
                            executetime = timestamp() + interval_map[wallet_id] * 60;
                        } else {
                            continue;
                        }

                        order_list.push(new SwapCreateDto(wallet_id, task_id, i + 1, interval_map[wallet_id], executetime, null, null, get_random(swap_max, swap_min), token_in, token_out, timestamp()));
                    }
                }
            }

            // 创建订单（swap）
            await this.transactionSwapDao.create(order_list);

            // 如果是一次性任务 且 task_id 不为 null，提交后修改一次性交易执行时间
            if (disposable_switch === 1 && task_id) {
                await this.taskDao.update_disposabletime(task_id);
            }

        }

    }


    // @Cron(CronExpression.EVERY_MINUTE)
    async execute_swap_never() {
        this.execute_swap_never_logger.log("√");
        this.transactionService.execute_swap_order("never");
    }


    // @Cron(CronExpression.EVERY_MINUTE)
    async execute_swap_failed() {
        this.execute_swap_failed_logger.log("√");
        this.transactionService.execute_swap_order("failed");
    }


    async create_collect() {

        // 获取到达归集时间的task
        const tasks = await this.taskDao.get(TaskStatus.PREPARE_DONE);

        // 遍历tasks
        for (let i = 0; i < tasks.length; i++) {

            const task = tasks[i];

            const {id: task_id, wallet_begin_num, wallet_limit_num, collecttime} = task;

            const {id: admin_id} = task.admin;

            // 更改task为归集中
            if (collecttime <= timestamp()) await this.taskDao.update_status(task_id, TaskStatus.COLLECT_ING);

            let token_address = "";

            // 交易类型
            if (task.trade_type === TradeType.BUY) {
                token_address = task.trade_pair.token1_address;
            } else if (task.trade_type === TradeType.SELL) {
                token_address = task.trade_pair.token0_address;
            } else {
                continue;
            }
            if (token_address === "") continue;

            // 创建归集记录
            const collectBatchDto = new CollectBatchDto(task_id, wallet_begin_num, wallet_limit_num, [token_address])
            this.transactionCollectService.create_collect_order(collectBatchDto);

        }
    }


    // @Cron(CronExpression.EVERY_5_MINUTES)
    async execute_collect() {

        this.execute_collect_logger.log("√");

        // 获取订单
        const orders = await this.transactionCollectDao.get_wrong();

        // 批量提交
        this.transactionCollectService.collect(orders);
    }

    // TODO 更改归集状态 根据task_id获取collect_orders，如果都是已完成，那就更改
    async collect_process() {

        // 获取归集中的task
        const tasks = await this.taskDao.get(TaskStatus.COLLECT_ING);

        // 遍历tasks
        for (let i = 0; i < tasks.length; i++) {

            // const task = tasks[i];
            // const {id: task_id, wallet_begin_num, wallet_limit_num} = task;
            // const {id: admin_id} = task.admin;
            //
            // let token_address = "";
            // const spender = env.ROUTER_CONTRACT_ADDRESS;
            //
            // // 交易类型
            // if (task.trade_type === TradeType.BUY) {
            //     token_address = task.trade_pair.token1_address;
            // } else if (task.trade_type === TradeType.SELL) {
            //     token_address = task.trade_pair.token0_address;
            // } else {
            //     continue;
            // }
            //
            // // 获取【钱包】是否授权了【使用者】【指定token】使用权
            // const getWalletDto = new GetWalletDto(admin_id, wallet_begin_num, wallet_limit_num);
            // const success_counts = await this.transactionApproveDao.get_success_counts(getWalletDto);
            //
            // // 如果 交易成功的数量 和 limit_num 一样，更改task为归集完成
            // if (success_counts === wallet_limit_num) await this.taskDao.update_status(task_id, TaskStatus.COLLECT_DONE);

        }
    }

    // @Cron(CronExpression.EVERY_MINUTE)
    async update_env() {

        await update_env();

        // 配置变更
        if (env.CREATE_TIME !== env.CREATE_TIME_LAST) {

            this.update_env_logger.log("更新扫描task时间");

            // clearInterval(this.create_swap);
            //
            // this.create_swap = setInterval(() => {
            //     this.monitor_task_swap_logger.log("√");
            //     this.transactionService.create_swap_from_task();
            // }, 1000 * env.CREATE_TIME);

            env.CREATE_TIME_LAST = env.CREATE_TIME;
        }

    }


    // create_swap: NodeJS.Timeout = setInterval(() => {
    //     this.monitor_task_swap_logger.log("√");
    //     this.transactionService.create_swap_from_task();
    // }, 1000 * env.CREATE_TIME);


    // @Cron(CronExpression.EVERY_5_SECONDS)
    // async test() {
    //
    // }

}