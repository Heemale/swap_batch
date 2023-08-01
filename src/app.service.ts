import {Injectable, Logger} from '@nestjs/common';
import {Cron, CronExpression} from "@nestjs/schedule";
import {
    get_nonce,
    to_wei,
} from "./web3";
import {random, uint256_max} from "./common/util";
import BigNumber from "bignumber.js";
import {env, update_env} from "./config";

import {TransactionApproveDao} from "./transaction/dao/transaction-approve.dao";
import {TransactionCollectDao} from "./transaction/dao/transaction-collect.dao";
import {TransactionSubsidyDao} from "./transaction/dao/transaction-subsidy.dao";
import {TaskDao} from "./transaction/dao/task.dao";

import {TransferBatchDto} from "./web3/dto/transfer-batch.dto";
import {TransactionDto} from "./web3/dto/transaction.dto";
import {ApproveDto} from "./web3/dto/approve.dto";

import {TransactionSubsidyService} from "./transaction/transaction-subsidy.service";
import {TransactionCollectService} from "./transaction/transaction-collect.service";
import {TransactionApproveService} from "./transaction/transaction-approve.service";
import {TransactionService} from "./transaction/transaction.service";
import {TransactionSwapDao} from "./transaction/dao/transaction-swap.dao";
import {WalletDao} from "./wallet/dao/wallet.dao";

@Injectable()
export class AppService {

    constructor(
        private readonly walletDao: WalletDao,
        private readonly subsidyTransactionDao: TransactionSubsidyDao,
        private readonly approveTransactionDao: TransactionApproveDao,
        private readonly collectTransactionDao: TransactionCollectDao,
        private readonly transactionSwapDao: TransactionSwapDao,
        private readonly taskDao: TaskDao,
        private readonly subsidyTransactionService: TransactionSubsidyService,
        private readonly approveTransactionService: TransactionApproveService,
        private readonly collectTransactionService: TransactionCollectService,
        private readonly transactionService: TransactionService,
    ) {
    }

    private readonly monitor_subsidy_orders_logger = new Logger("定时任务：打款");
    private readonly monitor_approve_orders_logger = new Logger("定时任务：授权");
    private readonly monitor_collect_orders_logger = new Logger("定时任务：归集");
    private readonly monitor_swap_orders_never_logger = new Logger("定时任务：swap_never");
    private readonly monitor_swap_orders_filed_logger = new Logger("定时任务：swap_filed");
    private readonly update_env_logger = new Logger("定时任务：更新配置");
    private readonly monitor_task_swap_logger = new Logger("定时任务：根据task创建swap订单");


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