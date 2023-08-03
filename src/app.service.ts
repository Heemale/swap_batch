import {Injectable, Logger} from '@nestjs/common';
import {Cron, CronExpression} from "@nestjs/schedule";

import {TransactionApproveDao} from "./transaction/dao/transaction-approve.dao";
import {TransactionCollectDao} from "./transaction/dao/transaction-collect.dao";
import {TransactionSubsidyDao} from "./transaction/dao/transaction-subsidy.dao";
import {TaskDao} from "./transaction/dao/task.dao";

import {clusters, generate_approve_order, TransactionSubsidyService} from "./transaction/transaction-subsidy.service";
import {TransactionCollectService} from "./transaction/transaction-collect.service";
import {TransactionApproveService} from "./transaction/transaction-approve.service";
import {TransactionService} from "./transaction/transaction.service";
import {TransactionSwapDao} from "./transaction/dao/transaction-swap.dao";
import {WalletDao} from "./wallet/dao/wallet.dao";
import {TaskStatus, TradeType, WalletSource} from "./common/enum";
import {TransactionPrepareService} from "./transaction/transaction-prepare.service";
import {TransactionPrepareDao} from "./transaction/dao/transaction-prepare.dao";
import {v4 as uuid} from 'uuid';
import {env} from "./config";
import {WalletService} from "./wallet/wallet.service";
import {CreateWalletBatchDto} from "./wallet/dto/create-wallet-batch.dto";

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

    // 创建准备列表
    @Cron(CronExpression.EVERY_30_SECONDS)
    async monitor_prepare_create() {

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
            const order_num = uuid();

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
            const approve_order_list = generate_approve_order(approve_list, wallet_begin_num, wallet_limit_num, spender, [token_address], order_num);

            // 创建订单（授权）
            await this.transactionApproveDao.create(approve_order_list);

        }

    };

    // 执行打款
        // 获取tasks
        // 遍历tasks
            // 如果是task不是打款中，return
            // 根据task_id查看打款记录
            // 如果打款gas和打款token，全部完成
                // 更新task状态
                // return
            // 否则
                // 遍历记录去打款，先提交打款gas打款，后打款token

    // 执行授权
        // 获取tasks
            // 遍历tasks
                // 如果是task不是授权中，return
                // 根据task_id查看打款记录
                // 如果授权，全部完成
                    // 更新task状态
                    // return
                // 否则
                    // 遍历记录去授权

    // 创建swap记录

    // 执行swap记录

    // 创建归集记录

    // 执行归集记录

    // @Cron(CronExpression.EVERY_MINUTE)
    // async monitor_subsidy_orders() {
    //
    //     this.monitor_subsidy_orders_logger.log("√");
    //
    //     // 获取订单
    //     const order = await this.subsidyTransactionDao.get_wrong();
    //     if (!order) return;
    //
    //     const {begin_num, limit_num, value_max, value_min, token_address, id: order_id} = order;
    //
    //     // 空投转账参数组装
    //     const accounts = await this.addressDao
    //         .get_address(begin_num, limit_num)
    //         .then((list) => list.map((item) => item.address));
    //     let amounts = []
    //     let msg_value = new BigNumber(0);
    //
    //     for (let i = 0; i < accounts.length; i++) {
    //         const amount = await to_wei(random(value_max.toString(), value_min.toString()));
    //         amounts.push(amount);
    //         if (token_address === '') {
    //             msg_value = msg_value.plus(amount);
    //         }
    //     }
    //
    //     // 获取nonce
    //     const nonce = await get_nonce(env.USER_ADDRESS);
    //
    //     const contract_address = token_address === '' ? env.TRANSFER_ETH_HELPER_ADDRESS : env.TRANSFER_HELPER_ADDRESS;
    //     const transferBatchDto = new TransferBatchDto(accounts, amounts, token_address);
    //     const transactionDto = new TransactionDto(env.USER_ADDRESS, contract_address, msg_value.valueOf(), '', env.PRIVATE_KEY, nonce);
    //
    //     // 提交交易
    //     await this.subsidyTransactionService.subsidy(transferBatchDto, transactionDto, order_id);
    // }
    //
    //
    // @Cron(CronExpression.EVERY_5_MINUTES)
    // async monitor_approve_orders() {
    //
    //     this.monitor_approve_orders_logger.log("√");
    //
    //     // 获取订单
    //     const orders = await this.approveTransactionDao.get_wrong();
    //
    //     // 批量提交
    //     orders.map(async (item) => {
    //
    //         const {id: order_id, token_address, spender} = item;
    //         const nonce = await get_nonce(item.wallet.address);
    //         const approveDto = new ApproveDto(spender, uint256_max, token_address);
    //         const transactionDto = new TransactionDto(item.wallet.address, token_address, new BigNumber(0).valueOf(), '', item.wallet.private_key, nonce);
    //
    //         // 提交交易
    //         this.approveTransactionService.approve(approveDto, transactionDto, order_id);
    //     })
    //
    // }
    //
    //
    // @Cron(CronExpression.EVERY_5_MINUTES)
    // async monitor_collect_orders() {
    //
    //     this.monitor_collect_orders_logger.log("√");
    //
    //     // 获取订单
    //     const orders = await this.collectTransactionDao.get_wrong();
    //
    //     // 批量提交
    //     this.collectTransactionService.collect(orders);
    // }
    //
    //
    // @Cron(CronExpression.EVERY_MINUTE)
    // async monitor_swap_orders_never() {
    //
    //     this.monitor_swap_orders_never_logger.log("√");
    //
    //     this.transactionService.execute_swap_order("never");
    // }
    //
    // @Cron(CronExpression.EVERY_MINUTE)
    // async monitor_swap_orders_failed() {
    //
    //     this.monitor_swap_orders_filed_logger.log("√");
    //
    //     this.transactionService.execute_swap_order("failed");
    // }
    //
    //
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