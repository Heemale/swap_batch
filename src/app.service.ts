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
import {get_nonce, to_wei} from "./web3";
import {env} from "./config";
import {random, timestamp, uint256_max} from "./common/util";
import {TransferBatchDto} from "./web3/dto/transfer-batch.dto";
import {TransactionDto} from "./web3/dto/transaction.dto";
import {ApproveDto} from "./web3/dto/approve.dto";

@Injectable()
export class AppService {

    constructor(
        private readonly walletDao: WalletDao,
        private readonly subsidyTransactionDao: TransactionSubsidyDao,
        private readonly transactionApproveDao: TransactionApproveDao,
        private readonly collectTransactionDao: TransactionCollectDao,
        private readonly transactionSwapDao: TransactionSwapDao,
        private readonly taskDao: TaskDao,
        private readonly walletService: WalletService,
        private readonly transactionPrepareDao: TransactionPrepareDao,
        private readonly subsidyTransactionService: TransactionSubsidyService,
        private readonly approveTransactionService: TransactionApproveService,
        private readonly collectTransactionService: TransactionCollectService,
        private readonly transactionService: TransactionService,
        private readonly transactionPrepareService: TransactionPrepareService,
    ) {
    }

    private readonly monitor_subsidy_orders_logger = new Logger("定时任务：打款");
    private readonly monitor_approve_orders_logger = new Logger("定时任务：授权");
    private readonly monitor_collect_orders_logger = new Logger("定时任务：归集");
    private readonly monitor_swap_orders_never_logger = new Logger("定时任务：swap_never");
    private readonly monitor_swap_orders_filed_logger = new Logger("定时任务：swap_filed");
    private readonly update_env_logger = new Logger("定时任务：更新配置");
    private readonly monitor_task_swap_logger = new Logger("定时任务：根据task创建swap订单");


    @Cron(CronExpression.EVERY_MINUTE)
    async create_subsidy_approve() {

        // 读取任务列表
        const result = await this.taskDao.get(TaskStatus.NEVER);

        // 遍历任务列表，调用create
        for (let i = 0; i < result.length; i++) {

            const task = result[i];
            const {
                id: task_id,
                admin_id,
                wallet_source,
                wallet_create_counts,
                wallet_begin_num,
                wallet_limit_num
            } = task;

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
                const wallet_data = await this.walletService.create(createWalletBatchDto);
                begin_num = wallet_data.begin_num;
                limit_num = wallet_data.limit_num;
            } else if (wallet_source === WalletSource.PICK) {
                // 选择钱包
                begin_num = wallet_begin_num;
                limit_num = wallet_limit_num;
            } else {
                continue;
            }
            if (begin_num === undefined || limit_num === undefined) continue;

            // 分组
            const times_arr = clusters(begin_num, limit_num);

            // 更改状态（任务）
            await this.taskDao.update_status(task_id, TaskStatus.PREPARE_ING);

            // 获取admin_special_num_max
            const admin_special_num_max = await this.transactionPrepareDao.get_admin_special_num_max(admin_id);

            // 创建订单（准备）
            await this.transactionPrepareService.create(task_id, admin_id, admin_special_num_max, times_arr, token_address);

            // 获取所有记录（授权）
            const approve_list = await this.transactionApproveDao.get_all();

            // 生成订单（授权）
            const approve_order_list = generate_approve_order(approve_list, wallet_begin_num, wallet_limit_num, spender, [token_address], task_id, admin_id);

            // 创建订单（授权）
            await this.transactionApproveDao.create(approve_order_list);

        }

    };


    // @Cron(CronExpression.EVERY_30_SECONDS)
    async execute_subsidy() {

        // 读取任务列表
        const result = await this.taskDao.get(TaskStatus.PREPARE_ING);
        // console.log("PREPARE_ING => ", result);

        for (let i = 0; i < result.length; i++) {
            const task = result[i];
            const {
                id: task_id,
                admin_id,
                subsidy_gas_max,
                subsidy_gas_min,
                subsidy_token_max,
                subsidy_token_min,
            } = task;

            // 获取打款列表
            const prepare_list = await this.transactionPrepareDao.get(task_id);

            // 如果prepare_list长度为0 ...
            if (prepare_list.length === 0) {
                await this.taskDao.update_status(task_id, TaskStatus.PREPARE_DONE);
                continue;
            }

            // TODO nonce prepare_list每次循环，admin对应的nonce++

            for (let j = 0; j < prepare_list.length; j++) {

                const {id, begin_num, limit_num, gas_status, token_status, token_address} = prepare_list[j];
                const getWalletDto = new GetWalletDto(admin_id, begin_num, limit_num);

                // 空投转账参数组装
                const accounts: Array<string> = await this.walletDao
                    .get_address(getWalletDto)
                    .then((list) => list.map((item) => item.address));
                const amounts: Array<string> = [];
                let msg_value = new BigNumber(0);
                let contract_address = "";
                let transferBatchDto;

                // TODO admin_id nonce 问题
                // 获取nonce
                const nonce = await get_nonce(env.USER_ADDRESS);

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

                // TODO
                const transactionDto = new TransactionDto(env.USER_ADDRESS, contract_address, msg_value.valueOf(), '', env.PRIVATE_KEY, nonce);

                // 提交交易
                await this.subsidyTransactionService.subsidy(transferBatchDto, transactionDto, id);
            }

        }
    }


    // @Cron(CronExpression.EVERY_5_MINUTES)
    async execute_approve() {

        this.monitor_approve_orders_logger.log("√");

        // 获取订单
        const orders = await this.transactionApproveDao.get_wrong();

        // 批量提交
        orders.map(async (item) => {

            const {id: order_id, token_address, spender} = item;

            // TODO 有gas就去授权

            const nonce = await get_nonce(item.wallet.address);
            const approveDto = new ApproveDto(spender, uint256_max, token_address);
            const transactionDto = new TransactionDto(item.wallet.address, token_address, new BigNumber(0).valueOf(), '', item.wallet.private_key, nonce);

            // 提交交易
            this.approveTransactionService.approve(approveDto, transactionDto, order_id);
        })

    }


    // @Cron(CronExpression.EVERY_5_MINUTES)
    async approve_process() {

        // 获取打款完成的task
        const tasks = await this.taskDao.get(TaskStatus.PREPARE_DONE);

        // 遍历tasks
        for (let i = 0; i < tasks.length; i++) {

            const task = tasks[i];
            const {id: task_id, admin_id, wallet_begin_num, wallet_limit_num} = task;

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
            const getWalletDto = new GetWalletDto(admin_id, wallet_begin_num, wallet_limit_num);
            const success_counts = await this.transactionApproveDao.get_success_counts(getWalletDto);

            // 如果 交易成功的数量 和 limit_num 一样，更改task为授权完成
            if (success_counts === wallet_limit_num) await this.taskDao.update_status(task_id, TaskStatus.APPROVE_DONE);

        }

    }


    // @Cron(CronExpression.EVERY_MINUTE)
    async execute_swap_never() {
        this.monitor_swap_orders_never_logger.log("√");
        this.transactionService.execute_swap_order("never");
    }


    // @Cron(CronExpression.EVERY_MINUTE)
    async execute_swap_failed() {
        this.monitor_swap_orders_filed_logger.log("√");
        this.transactionService.execute_swap_order("failed");
    }


    async create_collect() {
        // 获取到达归集时间的task
        const tasks = await this.taskDao.get(TaskStatus.PREPARE_DONE);

        // 遍历tasks
        for (let i = 0; i < tasks.length; i++) {
            const task = tasks[i];
            const {id: task_id, admin_id, wallet_begin_num, wallet_limit_num, collecttime} = task;

            // 更改task为归集中
            if (collecttime < timestamp()) await this.taskDao.update_status(task_id, TaskStatus.COLLECT_ING);

            // 创建归集记录
            // TODO 修改
            // this.collectTransactionService.create_collect_order();

        }
    }


    // @Cron(CronExpression.EVERY_5_MINUTES)
    async execute_collect() {

        this.monitor_collect_orders_logger.log("√");

        // 获取订单
        const orders = await this.collectTransactionDao.get_wrong();

        // 批量提交
        // this.collectTransactionService.collect(orders);
    }


    // @Cron(CronExpression.EVERY_MINUTE)
    // async update_env() {
    //
    //     await update_env();
    //
    //     // 配置变更
    //     if (env.CREATE_TIME !== env.CREATE_TIME_LAST) {
    //
    //         this.update_env_logger.log("更新扫描task时间");
    //
    //         clearInterval(this.create_swap);
    //
    //         this.create_swap = setInterval(() => {
    //             this.monitor_task_swap_logger.log("√");
    //             this.transactionService.create_swap_from_task();
    //         }, 1000 * env.CREATE_TIME);
    //
    //         env.CREATE_TIME_LAST = env.CREATE_TIME;
    //     }
    //
    // }
    //
    //
    // create_swap: NodeJS.Timeout = setInterval(() => {
    //     this.monitor_task_swap_logger.log("√");
    //     this.transactionService.create_swap_from_task();
    // }, 1000 * env.CREATE_TIME);


    // @Cron(CronExpression.EVERY_5_SECONDS)
    // async test() {
    //
    // }

}