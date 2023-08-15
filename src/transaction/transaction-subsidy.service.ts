import {Injectable} from '@nestjs/common';

import {env} from '../config';
import {
    from_wei,
    send_transaction,
    transfer_ERC20_batch,
    transfer_ETH_batch
} from '../web3';
import {generate_number_array, timestamp} from '../common/util';
import {PrepareType, StatusEnum} from '../common/enum';
import {TransactionDto} from '../web3/dto/transaction.dto';
import {TransferBatchDto} from "../web3/dto/transfer-batch.dto";
import {TransactionSubsidyDao} from "./dao/transaction-subsidy.dao";
import {SubsidyUpdateDto} from "./dto/subsidy/subsidy-update.dto";
import {timesType} from "../common/interface";
import {WalletDao} from "../wallet/wallet.dao";
import {TransactionPrepareDao} from "./dao/transaction-prepare.dao";
import BigNumber from "bignumber.js";

export const Web3 = require('web3');

@Injectable()
export class TransactionSubsidyService {

    constructor(
        private readonly walletDao: WalletDao,
        private readonly transactionSubsidyDao: TransactionSubsidyDao,
        private readonly transactionPrepareDao: TransactionPrepareDao,
    ) {
    }

    subsidy = async (transferBatchDto: TransferBatchDto, transactionDto: TransactionDto, order_id) => {

        const {token: contract_address} = transferBatchDto;

        let web3, data, signed, receipt;
        let amount, prepare_type;

        if (contract_address === "") {
            prepare_type = PrepareType.GAS;
            amount = await from_wei(transactionDto.value);
        } else {
            prepare_type = PrepareType.TOKEN;
            const sum = transferBatchDto.amounts.reduce((acc, current) => acc.plus(new BigNumber(current)), new BigNumber(0));
            amount = sum.dividedBy(new BigNumber('10').pow(18)).toFixed(18);
        }

        let subsidy_status = new SubsidyUpdateDto(order_id, amount, StatusEnum.NEVER, null, null);

        // 连接区块链
        try {
            web3 = await new Web3(new Web3.providers.HttpProvider(env.HTTP_PROVIDER));
        } catch ({message}) {
            subsidy_status.status = StatusEnum.FAILURE;
            subsidy_status.remark = "RPC连接失败";
            await this.transactionPrepareDao.update(subsidy_status, prepare_type);
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
                await this.transactionPrepareDao.update(subsidy_status, prepare_type);
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
                await this.transactionPrepareDao.update(subsidy_status, prepare_type);
                return;
            }
        }

        try {
            signed = await send_transaction(transactionDto);
            receipt = await web3.eth.sendSignedTransaction(signed.rawTransaction)
                .on('transactionHash', (hash) => {
                    subsidy_status.hash = hash;
                    subsidy_status.status = StatusEnum.PENDING;
                    this.transactionPrepareDao.update(subsidy_status, prepare_type);
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
            await this.transactionPrepareDao.update(subsidy_status, prepare_type);
            return;
        }

        // 交易成功
        subsidy_status.hash = receipt.transactionHash;
        subsidy_status.status = StatusEnum.CHECK_SUCCESS;
        await this.transactionPrepareDao.update(subsidy_status, prepare_type);
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

export const generate_approve_order = (approve_list, begin_num, limit_num, spender, token_addresses, task_id) => {

    // <哪些机器人> 已授权 <哪些token>
    const approved_mapping: { [key: number]: string[] } = {};

    for (let i = 0; i < approve_list.length; i++) {

        const {token_address} = approve_list[i];

        const {id: wallet_id} = approve_list[i].wallet;

        if (!(wallet_id in approved_mapping)) {
            approved_mapping[wallet_id] = [];
        }

        approved_mapping[wallet_id].push(token_address);
    }

    // <哪些机器人> 没有授权 <哪些token>
    const approve_order_list = [];
    const input_array = generate_number_array(begin_num, limit_num);

    for (let i = 0; i < token_addresses.length; i++) {

        const token_address = token_addresses[i];

        for (let j = 0; j < input_array.length; j++) {

            const wallet_id = input_array[j];

            if (!(wallet_id in approved_mapping) || approved_mapping[wallet_id].indexOf(token_address) == -1) {
                approve_order_list.push({
                    task: task_id, wallet: wallet_id, spender, token_address, createtime: timestamp(),
                });
            }

        }

    }

    return approve_order_list;
}