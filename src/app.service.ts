import {Injectable, Logger} from '@nestjs/common';
import BigNumber from "bignumber.js";

import {TaskDao} from "./task/task.dao";
import {WalletDao} from "./wallet/wallet.dao";
import {TransactionSwapDao} from "./transaction/dao/transaction-swap.dao";
import {TransactionApproveDao} from "./transaction/dao/transaction-approve.dao";
import {TransactionCollectDao} from "./transaction/dao/transaction-collect.dao";
import {TransactionPrepareDao} from "./transaction/dao/transaction-prepare.dao";

import {WalletService} from "./wallet/wallet.service";
import {clusters, generate_approve_order, TransactionSubsidyService} from "./transaction/transaction-subsidy.service";
import {TransactionCollectService} from "./transaction/transaction-collect.service";
import {TransactionApproveService} from "./transaction/transaction-approve.service";
import {TransactionPrepareService} from "./transaction/transaction-prepare.service";

import {GetWalletDto} from "./wallet/dto/get-wallet.dto";

import {StatusEnum, SwitchEnum, TaskStatus, TradeType, WalletSource} from "./common/enum";
import {get_balance, get_nonce, to_wei} from "./web3";
import {env, update_env} from "./config";
import {random, timestamp, uint256_max} from "./common/util";
import {TransferBatchDto} from "./web3/dto/transfer-batch.dto";
import {TransactionDto} from "./web3/dto/transaction.dto";
import {ApproveDto} from "./web3/dto/approve.dto";
import {SwapCreateDto} from "./transaction/dto/swap/swap-create.dto";
import {CollectBatchDto} from "./transaction/dto/collect/collect-batch.dto";
import {CreateWalletBatchDto} from "./wallet/dto/create-wallet-batch.dto";
import {TransactionApproveAdminDao} from "./transaction/dao/transaction-approve-admin.dao";
import {TransactionSwapService} from "./transaction/transaction-swap.service";
import {TradePairDao} from "./trade-pair/trade-pair.dao";

@Injectable()
export class AppService {

    constructor(
        private readonly walletDao: WalletDao,
        private readonly transactionApproveDao: TransactionApproveDao,
        private readonly transactionApproveAdminDao: TransactionApproveAdminDao,
        private readonly transactionCollectDao: TransactionCollectDao,
        private readonly transactionSwapDao: TransactionSwapDao,
        private readonly taskDao: TaskDao,
        private readonly tradePairDao: TradePairDao,
        private readonly walletService: WalletService,
        private readonly transactionPrepareDao: TransactionPrepareDao,
        private readonly transactionSubsidyService: TransactionSubsidyService,
        private readonly transactionApproveService: TransactionApproveService,
        private readonly transactionCollectService: TransactionCollectService,
        private readonly transactionSwapService: TransactionSwapService,
        private readonly transactionPrepareService: TransactionPrepareService,
    ) {
    }

    private readonly create_approve_admin_logger = new Logger("定时任务：创建管理员授权");
    private readonly execute_approve_admin_logger = new Logger("定时任务：执行管理员授权");
    private readonly create_subsidy_approve_logger = new Logger("定时任务：创建打款和授权");
    private readonly execute_subsidy_logger = new Logger("定时任务：执行打款");
    private readonly execute_approve_logger = new Logger("定时任务：执行授权");
    private readonly create_swap_logger = new Logger("定时任务：创建swap");
    private readonly execute_swap_never_logger = new Logger("定时任务：执行swap_never");
    private readonly execute_swap_failed_logger = new Logger("定时任务：执行swap_filed");
    private readonly check_swap_process_logger = new Logger("定时任务：检查swap进度");
    private readonly create_collect_logger = new Logger("定时任务：创建归集");
    private readonly execute_collect_logger = new Logger("定时任务：执行归集");
    private readonly check_collect_process_logger = new Logger("定时任务：检查归集进度");
    private readonly update_env_logger = new Logger("定时任务：更新配置");


    // @Cron(CronExpression.EVERY_MINUTE)
    async create_approve_admin() {

        this.create_approve_admin_logger.log("√");

        // 获取tasks
        const tasks = await this.taskDao.get(TaskStatus.NEVER);

        // 遍历tasks
        for (let i = 0; i < tasks.length; i++) {

            const task = tasks[i];
            const {id: task_id} = task;
            const {id: admin_id} = task.admin;

            let token_address = "";
            const spender = env.ROUTER_ADDRESS;

            // 交易类型
            if (task.trade_type === TradeType.BUY) {
                token_address = task.trade_pair.token1_address;
            } else if (task.trade_type === TradeType.SELL) {
                token_address = task.trade_pair.token0_address;
            } else {
                continue;
            }
            if (token_address === "") continue;
            if (spender === "") continue;

            // 是否已授权
            const approve_data = await this.transactionApproveAdminDao.get(admin_id, token_address, spender);

            if (approve_data === null) {

                // 创建授权记录
                const order_list = [{
                    admin: admin_id,
                    token_address,
                    spender,
                    createtime: timestamp(),
                }];
                await this.transactionApproveAdminDao.create(order_list);

            } else {
                if (approve_data.status === StatusEnum.CHECK_SUCCESS) {
                    await this.taskDao.update_status(task_id, TaskStatus.ADMIN_APPROVE_DONE);
                }
            }

        }

    }


    // @Cron(CronExpression.EVERY_MINUTE)
    async execute_approve_admin() {

        this.execute_approve_admin_logger.log("√");

        const list = await this.transactionApproveAdminDao.group_by_admin_id();

        // nonce_mapping
        const nonce_mapping: { [key: string]: bigint } = {};

        for (let i = 0; i < list.length; i++) {

            const data = list[i];
            const {id: order_id, token_address, spender} = data;
            const {admin_address, admin_private_key} = data.admin;

            // 如果未查询过nonce
            if (!(admin_address.toLowerCase() in nonce_mapping)) {
                nonce_mapping[admin_address.toLowerCase()] = await get_nonce(admin_address);
            }

            let approveDto = new ApproveDto(spender, uint256_max, token_address);
            let transactionDto = new TransactionDto(admin_address, token_address, new BigNumber(0).valueOf(), '', admin_private_key, nonce_mapping[admin_address.toLowerCase()]++);

            // 提交交易
            await this.transactionApproveService.approve_admin(approveDto, transactionDto, order_id);
        }

    }


    // @Cron(CronExpression.EVERY_MINUTE)
    async create_subsidy_approve() {

        this.create_subsidy_approve_logger.log("√");

        // 获取tasks
        const tasks = await this.taskDao.get(TaskStatus.ADMIN_APPROVE_DONE);

        // 遍历tasks
        for (let i = 0; i < tasks.length; i++) {

            const task = tasks[i];
            const {
                id: task_id,
                wallet_source,
                wallet_create_counts,
                wallet_begin_num, // 移除
                wallet_limit_num // 移除
                // wallet_from_task_id
            } = task;
            const {id: admin_id} = task.admin;

            let token_address = "";
            const spender = env.ROUTER_ADDRESS;

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
                const getWalletDto = new GetWalletDto(admin_id, wallet_begin_num, wallet_limit_num); // 移除
                const result = await this.walletDao.get_address_special(getWalletDto); // 移除
                // 改为根据来源task_id获取钱包
                // const result = await this.walletDao.get_address_by_task_id(wallet_from_task_id);
                if (result.length === 0) continue;
                begin_num = result[0].id;
                limit_num = result.length;
            } else {
                continue;
            }
            if (begin_num === undefined || limit_num === undefined) continue;

            // 分组（钱包ids）
            const times_arr = clusters(begin_num, limit_num);

            // 更改task为准备中
            await this.taskDao.update_status(task_id, TaskStatus.SUBSIDY_ING);

            // 创建订单（准备）
            await this.transactionPrepareService.create(task_id, times_arr, token_address);

            // 获取所有记录（授权）
            const approve_list = await this.transactionApproveDao.get_all();

            // 生成订单（授权）
            const approve_order_list = generate_approve_order(approve_list, begin_num, limit_num, spender, [token_address], task_id);

            // 创建订单（授权）
            await this.transactionApproveDao.create(approve_order_list);

        }

    };


    // @Cron(CronExpression.EVERY_MINUTE)
    async execute_subsidy() {

        this.execute_subsidy_logger.log("√");

        // 获取tasks
        const tasks = await this.taskDao.get(TaskStatus.SUBSIDY_ING);

        // nonce_mapping
        const nonce_mapping: { [key: string]: bigint } = {};

        // 遍历tasks
        for (let i = 0; i < tasks.length; i++) {

            const task = tasks[i];
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
                await this.taskDao.update_status(task_id, TaskStatus.SUBSIDY_DONE);
                continue;
            }

            // 如果未查询过nonce
            if (!(admin_address.toLowerCase() in nonce_mapping)) {
                nonce_mapping[admin_address.toLowerCase()] = await get_nonce(admin_address);
            }

            for (let j = 0; j < prepare_list.length; j++) {

                const {id, begin_num, limit_num, gas_status, token_status, token_address} = prepare_list[j];

                // 空投转账参数组装
                const accounts: Array<string> = await this.walletDao.get_address(begin_num, limit_num).then((list) => list.map((item) => item.address));
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

                // 提交交易
                this.transactionSubsidyService.subsidy(transferBatchDto, transactionDto, id);
            }

        }
    }


    // @Cron(CronExpression.EVERY_MINUTE)
    async execute_approve() {

        this.execute_approve_logger.log("√");

        // 获取订单
        const orders = await this.transactionApproveDao.get_wrong();

        // 批量提交
        for (let i = 0; i < orders.length; i++) {

            const order = orders[i];
            const {id: order_id, token_address, spender} = order;
            const {address, private_key} = order.wallet;

            // 如果余额不大于0，不提交授权
            const balance = await get_balance(address);
            if (balance <= 0) continue;

            const nonce = await get_nonce(address);
            const approveDto = new ApproveDto(spender, uint256_max, token_address);
            const transactionDto = new TransactionDto(address, token_address, new BigNumber(0).valueOf(), '', private_key, nonce);

            // 提交交易
            this.transactionApproveService.approve(approveDto, transactionDto, order_id);
        }

    }


    // @Cron(CronExpression.EVERY_MINUTE)
    async create_swap() {

        this.create_swap_logger.log("√");

        // 获取tasks
        const tasks = await this.taskDao.get(TaskStatus.SUBSIDY_DONE);

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
                wallet_begin_num, // 移除
                wallet_limit_num, // 移除
                // wallet_from_task_id,
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

            if (env.SWAP_SWITCH !== SwitchEnum.OPEN) continue;

            // 获取用户
            const getWalletDto = new GetWalletDto(admin_id, wallet_begin_num, wallet_limit_num); // 移除
            const wallets = await this.walletDao.get_address_special(getWalletDto); // 移除
            // const wallets = await this.walletDao.get_address_by_task_id(wallet_from_task_id);

            // 生成订单（swap）
            let order_list = [];

            // 如果是区间交易
            if (range_switch === 1) {

                // 获取随机时间、排序
                const random_times = [];
                for (let i = 0; i < wallets.length * times; i++) {
                    random_times.push(random(rangestarttime.toString(), rangeendtime.toString()));
                }
                random_times.sort((a, b) => a - b);

                for (let i = 0; i < times; i++) {
                    for (let j = 0; j < wallets.length; j++) {
                        const wallet = wallets[j];
                        order_list.push(new SwapCreateDto(wallet.id, task_id, i + 1, 0, random_times[wallets.length * i + j], rangestarttime, rangeendtime, random(swap_max.toString(), swap_min.toString()), token_in, token_out, timestamp()));
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

                    for (let j = 0; j < wallets.length; j++) {

                        const wallet = wallets[j];
                        const {id: wallet_id, interval_min, interval_max} = wallet;

                        if (interval_map[wallet_id] === undefined) {
                            interval_map[wallet_id] = random(interval_min.toString(), interval_max.toString());
                        } else {
                            interval_map[wallet_id] += random(interval_min.toString(), interval_max.toString());
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

                        order_list.push(new SwapCreateDto(wallet_id, task_id, i + 1, interval_map[wallet_id], executetime, null, null, random(swap_max.toString(), swap_min.toString()), token_in, token_out, timestamp()));
                    }
                }
            }

            // 创建订单（swap）
            await this.transactionSwapDao.create(order_list);

            // 更改task状态
            await this.taskDao.update_status(task_id, TaskStatus.SWAP_ING);

            // 如果是一次性任务 且 task_id 不为 null，提交后修改一次性交易执行时间
            // if (disposable_switch === 1 && task_id) {
            //     await this.taskDao.update_disposabletime(task_id);
            // }

        }

    }


    // @Cron(CronExpression.EVERY_MINUTE)
    async execute_swap_never() {

        this.execute_swap_never_logger.log("√");

        // 获取trade-pairs
        const trade_pairs = await this.tradePairDao.get_all();

        // 遍历trade-pairs
        for (let i = 0; i < trade_pairs.length; i++) {

            const trade_pair = trade_pairs[i];

            const {id: trade_pair_id, open_switch, limits} = trade_pair;

            if (open_switch !== SwitchEnum.OPEN) continue;

            this.transactionSwapService.execute_swap_order("never", trade_pair_id, limits);
        }

    }


    // @Cron(CronExpression.EVERY_MINUTE)
    async execute_swap_failed() {

        this.execute_swap_failed_logger.log("√");

        // 获取trade-pairs
        const trade_pairs = await this.tradePairDao.get_all();

        // 遍历trade-pairs
        for (let i = 0; i < trade_pairs.length; i++) {

            const trade_pair = trade_pairs[i];

            const {id: trade_pair_id, open_switch, limits} = trade_pair;

            if (open_switch !== SwitchEnum.OPEN) continue;

            this.transactionSwapService.execute_swap_order("failed", trade_pair_id, limits);
        }

    }


    // @Cron(CronExpression.EVERY_3_HOURS)
    async check_swap_process() {

        this.check_swap_process_logger.log("√")

        // 获取tasks
        const tasks = await this.taskDao.get(TaskStatus.SWAP_ING);

        // 遍历task
        for (let i = 0; i < tasks.length; i++) {

            const task = tasks[i];
            const {id: task_id, wallet_source, wallet_create_counts, wallet_limit_num} = task;

            // 根据task_id获取swap成功次数
            const success_counts = await this.transactionSwapDao.get_success_counts(task_id);
            let total_counts;

            if (wallet_source === WalletSource.CREATE) {
                total_counts = wallet_create_counts;
            } else if (wallet_source === WalletSource.PICK) {
                total_counts = wallet_limit_num;
            } else {
                continue;
            }

            // 如果成功次数等于参与的账户数，更新状态
            if (success_counts === wallet_limit_num) await this.taskDao.update_status(task_id, TaskStatus.SWAP_DONE);
        }
    }


    // @Cron(CronExpression.EVERY_MINUTE)
    async create_collect() {

        this.create_collect_logger.log("√");

        // 获取tasks
        const tasks = await this.taskDao.get_collect();

        // 遍历tasks
        for (let i = 0; i < tasks.length; i++) {

            const task = tasks[i];

            const {
                id: task_id,
                wallet_begin_num, // 移除
                wallet_limit_num, // 移除
                // wallet_from_task_id,
                collecttime
            } = task;

            const {id: admin_id} = task.admin;

            // 更改task状态
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

            const getWalletDto = new GetWalletDto(admin_id, wallet_begin_num, wallet_limit_num); // 移除
            const result = await this.walletDao.get_address_special(getWalletDto); // 移除
            // const result = await this.walletDao.get_address_by_task_id(wallet_from_task_id);
            if (result.length === 0) continue;
            const begin_num = result[0].id;
            const limit_num = result.length;

            // 创建归集记录
            const collectBatchDto = new CollectBatchDto(task_id, begin_num, limit_num, [token_address])
            await this.transactionCollectService.create_collect_order(collectBatchDto);
        }
    }


    // @Cron(CronExpression.EVERY_MINUTE)
    async execute_collect() {

        this.execute_collect_logger.log("√");

        // 获取订单
        const orders = await this.transactionCollectDao.get_wrong();

        // 批量提交
        this.transactionCollectService.collect(orders);
    }


    // @Cron(CronExpression.EVERY_3_HOURS)
    async check_collect_process() {

        this.check_collect_process_logger.log("√");

        // 获取tasks
        const tasks = await this.taskDao.get(TaskStatus.COLLECT_ING);

        // 遍历tasks
        for (let i = 0; i < tasks.length; i++) {

            const task = tasks[i];
            const {
                id: task_id,
                wallet_source,
                wallet_create_counts,
                wallet_limit_num
            } = task;

            // 根据task_id获取collect成功次数
            const success_counts = await this.transactionCollectDao.get_success_counts(task_id);

            let total_counts;

            if (wallet_source === WalletSource.CREATE) {
                total_counts = wallet_create_counts;
            } else if (wallet_source === WalletSource.PICK) {
                total_counts = wallet_limit_num;
            } else {
                continue;
            }

            // 如果成功次数等于参与的账户数，更新状态
            if (success_counts === total_counts) await this.taskDao.update_status(task_id, TaskStatus.COLLECT_DONE);

        }
    }


    // @Cron(CronExpression.EVERY_MINUTE)
    async update_env() {

        this.update_env_logger.log("√");

        await update_env();

        // 配置变更
        // if (env.CREATE_TIME !== env.CREATE_TIME_LAST) {
        //
        //     // clearInterval(this.create_swap);
        //     //
        //     // this.create_swap = setInterval(() => {
        //     //     this.monitor_task_swap_logger.log("√");
        //     //     this.transactionService.create_swap_from_task();
        //     // }, 1000 * env.CREATE_TIME);
        //
        //     env.CREATE_TIME_LAST = env.CREATE_TIME;
        // }

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