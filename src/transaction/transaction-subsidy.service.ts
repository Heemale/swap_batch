import {HttpException, Injectable} from '@nestjs/common';
import {v4 as uuid} from 'uuid';

import {env} from '../config';
import {
    send_transaction,
    transfer_ERC20_batch,
    transfer_ETH_batch
} from '../web3';
import {convert_to_timestamp, generate_number_array, timestamp} from '../common/util';
import {StatusEnum} from '../common/enum';
import {TransactionDto} from '../web3/dto/transaction.dto';
import {TransferBatchDto} from "../web3/dto/transfer-batch.dto";
import {TransactionSubsidyDao} from "./dao/transaction-subsidy.dao";
import {SubsidyUpdateDto} from "./dto/subsidy/subsidy-update.dto";
import {timesType} from "../common/interface";
import {SubsidyApproveBatchDto} from "./dto/subsidy/batch/subsidy-approve-batch.dto";
import {TransactionApproveDao} from "./dao/transaction-approve.dao";
import {SubsidyCreateDto} from "./dto/subsidy/subsidy-create.dto";
import {SubsidySwapBatchDto} from "./dto/subsidy/batch/subsidy-swap-batch.dto";
import {TransactionService} from "./transaction.service";
import {TaskEntity} from "./entities/task.entity";
import {TaskDao} from "./dao/task.dao";
import {SwapBatchDto} from "./dto/swap/batch/swap-batch.dto";
import {WalletDao} from "../wallet/dao/wallet.dao";

export const Web3 = require('web3');

@Injectable()
export class TransactionSubsidyService {

    constructor(
        private readonly walletDao: WalletDao,
        private readonly transactionSubsidyDao: TransactionSubsidyDao,
        private readonly transactionApproveDao: TransactionApproveDao,
        private readonly taskDao: TaskDao,
        private readonly transactionService: TransactionService,
    ) {
    }

    // create_subsidy_approve_order = async (subsidyApproveBatchDto: SubsidyApproveBatchDto) => {
    //
    //     const {begin_num, limit_num, value_max, value_min, spender, token_addresses} = subsidyApproveBatchDto;
    //     const token_address: string = "";
    //     const order_num = uuid();
    //
    //     // 生成批次数组
    //     const times_arr = clusters(begin_num, limit_num);
    //
    //     // 生成订单（打款）
    //     const subsidy_order_list = generate_subsidy_order(times_arr, order_num, value_max, value_min, token_address);
    //
    //     // 创建订单（打款）
    //     await this.transactionSubsidyDao.create(subsidy_order_list);
    //
    //     // 获取所有记录（授权）
    //     const approve_list = await this.transactionApproveDao.get_all();
    //
    //     // 生成订单（授权）
    //     const approve_order_list = generate_approve_order(approve_list, begin_num, limit_num, spender, token_addresses, order_num);
    //
    //     // 创建订单（授权）
    //     await this.transactionApproveDao.create(approve_order_list);
    //
    //     return "已提交";
    // }

    // create_subsidy_swap_order = async (subsidySwapBatchDto: SubsidySwapBatchDto) => {
    //
    //     let {
    //         begin_num,
    //         limit_num,
    //         value_max,
    //         value_min,
    //         token_address,
    //         disposable_switch,
    //         dense_switch,
    //         range_switch,
    //         rangestarttime,
    //         rangeendtime,
    //         max_num,
    //         min_num,
    //         token_in_amount,
    //         max_price,
    //         min_price,
    //         token_in,
    //         token_out,
    //         times: create_times,
    //     } = subsidySwapBatchDto;
    //
    //     if (token_address == "") throw new HttpException("token_address为空", 400);
    //
    //     const order_num = uuid();
    //
    //     // 生成批次数组
    //     const times_arr = clusters(begin_num, limit_num);
    //
    //     // 生成订单（打款）
    //     const subsidy_order_list = generate_subsidy_order(times_arr, order_num, value_max, value_min, token_address);
    //
    //     // 创建订单（打款）
    //     await this.transactionSubsidyDao.create(subsidy_order_list);
    //
    //     // 创建订单（task）
    //     // const task = new TaskEntity(
    //     //     0,
    //     //     disposable_switch,
    //     //     dense_switch,
    //     //     range_switch,
    //     //     begin_num,
    //     //     limit_num,
    //     //     max_num,
    //     //     min_num,
    //     //     token_in_amount,
    //     //     max_price,
    //     //     min_price,
    //     //     token_in,
    //     //     token_out,
    //     //     create_times,
    //     //     convert_to_timestamp(rangestarttime),
    //     //     convert_to_timestamp(rangeendtime),
    //     //     timestamp(),
    //     //     timestamp(),
    //     // );
    //     // const result = await this.taskDao.create(task);
    //     // const task_id = result?.raw?.insertId;
    //     //
    //     // // 创建订单（swap）
    //     // const swapBatchDto = new SwapBatchDto(
    //     //     disposable_switch,
    //     //     dense_switch,
    //     //     range_switch,
    //     //     rangestarttime,
    //     //     rangeendtime,
    //     //     begin_num,
    //     //     limit_num,
    //     //     max_num,
    //     //     min_num,
    //     //     token_in,
    //     //     token_out,
    //     //     create_times,
    //     //     task_id
    //     // );
    //     // await this.transactionService.create_swap_order(swapBatchDto);
    //
    //     return "已提交";
    //
    // }

    subsidy = async (transferBatchDto: TransferBatchDto, transactionDto: TransactionDto, order_id) => {

        let subsidy_status = new SubsidyUpdateDto(order_id, StatusEnum.NEVER, null, null);
        let {token: contract_address} = transferBatchDto;
        let web3, data, signed, receipt;

        // 连接区块链
        try {
            web3 = await new Web3(new Web3.providers.HttpProvider(env.HTTP_PROVIDER));
        } catch ({message}) {
            subsidy_status.status = StatusEnum.FAILURE;
            subsidy_status.remark = "RPC连接失败";
            await this.transactionSubsidyDao.update(subsidy_status);
            return;
        }

        if (contract_address !== '') {
            try {
                data = await transfer_ERC20_batch(transferBatchDto);
                transactionDto.data = data;
            } catch (e) {
                console.log('transfer_ERC20_batch ABI编码异常 => ', e.message);
                subsidy_status.status = StatusEnum.FAILURE;
                subsidy_status.remark = e.message;
                await this.transactionSubsidyDao.update(subsidy_status);
                return;
            }
        } else {
            try {
                data = await transfer_ETH_batch(transferBatchDto);
                transactionDto.data = data;
            } catch (e) {
                console.log('transfer_ETH_batch ABI编码异常 => ', e.message);
                subsidy_status.status = StatusEnum.FAILURE;
                subsidy_status.remark = e.message;
                await this.transactionSubsidyDao.update(subsidy_status);
                return;
            }
        }

        try {
            signed = await send_transaction(transactionDto);
            receipt = await web3.eth.sendSignedTransaction(signed.rawTransaction)
                .on('transactionHash', (hash) => {
                    subsidy_status.hash = hash;
                    this.transactionSubsidyDao.update(subsidy_status);
                });
        } catch (e) {
            console.log('transfer_batch 发送交易异常 => ', e.message);

            if (e.message.includes('CONNECTION ERROR')) {
                subsidy_status.remark = 'RPC连接失败';
            } else if (e.message.includes('insufficient funds for gas * price + value')) {
                subsidy_status.remark = 'gas不足';
            } else if (e.message.includes('replacement transaction underpriced')) {
                subsidy_status.remark = '交易过快，nonce冲突';
            } else if (e.message.includes('nonce too low')) {
                subsidy_status.remark = 'nonce太低';
            } else if (e.message.includes('multi transfer allowance not enough')) {
                subsidy_status.remark = '空投合约授权额度不够';
            } else if (e.message.includes('omp not enough')) {
                subsidy_status.remark = 'omp不足';
            } else if (e.message.includes('nonce too low')) {
                subsidy_status.remark = 'nonce太低';
            } else {
                subsidy_status.remark = e.message;
            }

            subsidy_status.status = StatusEnum.FAILURE;
            await this.transactionSubsidyDao.update(subsidy_status);
            return;
        }

        // 交易成功
        subsidy_status.hash = receipt.transactionHash;
        subsidy_status.status = StatusEnum.CHECK_SUCCESS;
        await this.transactionSubsidyDao.update(subsidy_status);
    }

}

export const clusters = (begin_num, limit_num) => {

    const group_length = 100;
    const times_arr: Array<timesType> = [];
    const times: number = Math.ceil(limit_num / group_length);

    for (let i = 0; i < times; i++) {
        const start = begin_num + i * group_length;
        const end = Math.min(start + (group_length - 1), begin_num + limit_num - 1);
        const counts = end - start + 1;
        times_arr.push({start, end, counts});
    }

    return times_arr;
}

export const generate_subsidy_order = (times_arr, order_num, value_max, value_min, token_address) => {

    const subsidy_order_list = [];

    for (let i = 0; i < times_arr.length; i++) {
        const start = times_arr[i].start;
        const counts = times_arr[i].counts;
        subsidy_order_list.push(new SubsidyCreateDto(order_num, start, counts, value_max, value_min, token_address, timestamp()));
    }

    return subsidy_order_list;
}

export const generate_approve_order = (approve_list, begin_num, limit_num, spender, token_addresses, task_id, admin_id) => {

    // <哪些机器人> 已授权 <哪些token>
    const approved_mapping: { [key: number]: string[] } = {};

    approve_list.forEach((item) => {
        if (!(item.wallet.id in approved_mapping)) {
            approved_mapping[item.wallet.id] = [];
        }
        approved_mapping[item.wallet.id].push(item.token_address);
    });

    // <哪些机器人> 没有授权 <哪些token>
    const approve_order_list = [];
    const input_array = generate_number_array(begin_num, limit_num);

    for (let i = 0; i < token_addresses.length; i++) {

        const token_address = token_addresses[i];

        for (let j = 0; j < input_array.length; j++) {

            const wallet_id = input_array[j];

            if (!(wallet_id in approved_mapping) || approved_mapping[wallet_id].indexOf(token_address) == -1) {
                approve_order_list.push({
                    task: task_id, admin_id, wallet: wallet_id, spender, token_address, createtime: timestamp(),
                });
            }

        }

    }

    return approve_order_list;
}