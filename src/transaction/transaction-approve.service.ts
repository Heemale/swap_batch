import {Injectable} from '@nestjs/common';
import {v4 as uuid} from 'uuid';
import BigNumber from 'bignumber.js';

import {env} from '../config';
import {approve, get_nonce, send_transaction} from '../web3';
import {timestamp, uint256_max} from '../common/util';
import {StatusEnum} from '../common/enum';
import {TransactionDto} from '../web3/dto/transaction.dto';
import {TransactionApproveDao} from "./dao/transaction-approve.dao";
import {ApproveBatchDto} from "./dto/approve/batch/approve-batch.dto";
import {ApproveDto} from "../web3/dto/approve.dto";
import {ApproveUpdateDto} from "./dto/approve/approve-update.dto";
import {ApproveAdminBatchDto} from "./dto/approve/batch/approve-admin-batch.dto";
import {TransactionApproveAdminDao} from "./dao/transaction-approve-admin.dao";
import {ApproveUpdateAdminDto} from "./dto/approve/approve-update-admin.dto";
import {WalletDao} from "../wallet/dao/wallet.dao";

export const Web3 = require('web3');

@Injectable()
export class TransactionApproveService {

    constructor(
        private readonly walletDao: WalletDao,
        private readonly transactionApproveDao: TransactionApproveDao,
        private readonly transactionApproveAdminDao: TransactionApproveAdminDao,
    ) {
    }

    // approve_admin_batch = async (approveAdminBatchDto: ApproveAdminBatchDto) => {
    //
    //     const {spender, token_addresses} = approveAdminBatchDto;
    //     const order_num = uuid();
    //
    //     // 生成订单（打款）
    //     let order_list = [];
    //     for (let i = 0; i < token_addresses.length; i++) {
    //         order_list.push({
    //             order_num,
    //             wallet: env.USER_ADDRESS,
    //             token_address: token_addresses[i],
    //             spender,
    //             createtime: timestamp(),
    //         });
    //     }
    //
    //     // 创建订单（打款）
    //     await this.transactionApproveAdminDao.create(order_list);
    //
    //     // 获取订单（打款）
    //     const orders = await this.transactionApproveAdminDao.get_by_order_num(order_num);
    //
    //     this.approve_admin_for(orders);
    //
    //     return "提交批量授权（总号）"
    // }
    //
    // approve_admin_for = async (orders) => {
    //
    //     // 批量打款
    //     for (let i = 0; i < orders.length; i++) {
    //
    //         // 获取nonce
    //         const nonce = await get_nonce(env.USER_ADDRESS);
    //
    //         const item = orders[i];
    //         const {id, wallet, spender, token_address} = item;
    //         let approveDto = new ApproveDto(spender, uint256_max, token_address);
    //         let transactionDto = new TransactionDto(wallet, token_address, new BigNumber(0).valueOf(), '', env.PRIVATE_KEY, nonce);
    //
    //         // 提交交易
    //         await this.approve_admin(approveDto, transactionDto, id);
    //     }
    //
    // }
    //
    // approve_admin = async (approveDto: ApproveDto, transactionDto: TransactionDto, id: number) => {
    //
    //     let web3, data, signed, receipt;
    //     let approve_status = new ApproveUpdateAdminDto(id, StatusEnum.NEVER, null, null);
    //
    //     // 连接区块链
    //     try {
    //         web3 = await new Web3(new Web3.providers.HttpProvider(env.HTTP_PROVIDER));
    //     } catch ({message}) {
    //         approve_status.status = StatusEnum.FAILURE;
    //         approve_status.remark = "RPC连接失败";
    //         await this.transactionApproveAdminDao.update(approve_status);
    //         return;
    //     }
    //
    //     // ABI编码
    //     try {
    //         data = await approve(approveDto);
    //         transactionDto.data = data;
    //     } catch (e) {
    //         approve_status.status = StatusEnum.FAILURE;
    //         approve_status.remark = e.message;
    //         await this.transactionApproveAdminDao.update(approve_status);
    //         return;
    //     }
    //
    //     // 交易数据编码、提交交易
    //     try {
    //         signed = await send_transaction(transactionDto);
    //         receipt = await web3.eth.sendSignedTransaction(signed.rawTransaction)
    //             .on('transactionHash', (hash) => {
    //                 approve_status.hash = hash;
    //                 this.transactionApproveAdminDao.update(approve_status);
    //             });
    //     } catch (e) {
    //
    //         if (e.message.includes('CONNECTION ERROR')) {
    //             approve_status.remark = 'RPC连接失败';
    //         } else if (e.message.includes('insufficient funds for gas * price + value')) {
    //             approve_status.remark = 'gas不足';
    //         } else if (e.message.includes('replacement transaction underpriced')) {
    //             approve_status.remark = '交易过快，nonce冲突';
    //         } else if (e.message.includes('nonce too low')) {
    //             approve_status.remark = 'nonce太低';
    //         } else {
    //             approve_status.remark = e.message;
    //         }
    //
    //         approve_status.status = StatusEnum.FAILURE;
    //         await this.transactionApproveAdminDao.update(approve_status);
    //         return;
    //     }
    //
    //     // 交易成功
    //     approve_status.status = StatusEnum.CHECK_SUCCESS;
    //     await this.transactionApproveAdminDao.update(approve_status);
    // }
    //
    // // TODO 批量-创建订单（打款） / 手动操作创建授权订单
    // approve_batch = async (approveBatchDto: ApproveBatchDto): Promise<string> => {
    //
    //     const {begin_num, limit_num, spender, token_address} = approveBatchDto;
    //     const order_num = uuid();
    //
    //     // 生成订单（打款）
    //     let order_list = [];
    //     let user_id = begin_num;
    //     for (let i = begin_num; i < begin_num + limit_num; i++) {
    //         order_list.push({
    //             order_num, wallet: user_id, spender, token_address, createtime: timestamp(),
    //         });
    //         user_id++;
    //     }
    //
    //     // 创建订单（打款）
    //     await this.transactionApproveDao.create(order_list);
    //
    //     return '已提交';
    // }
    //
    approve = async (approveDto: ApproveDto, transactionDto: TransactionDto, order_id,) => {

        let web3, data, signed, receipt;
        let approve_status = new ApproveUpdateDto(order_id, StatusEnum.NEVER, null, null);

        // 连接区块链
        try {
            web3 = await new Web3(new Web3.providers.HttpProvider(env.HTTP_PROVIDER));
        } catch (e) {
            approve_status.status = StatusEnum.FAILURE;
            approve_status.remark = "RPC连接失败";
            await this.transactionApproveDao.update(approve_status);
            return "RPC连接失败";
        }

        // ABI编码
        try {
            data = await approve(approveDto);
            transactionDto.data = data;
        } catch (e) {
            approve_status.status = StatusEnum.FAILURE;
            approve_status.remark = e.message;
            await this.transactionApproveDao.update(approve_status);
            return;
        }

        // 交易数据编码、提交交易
        try {
            signed = await send_transaction(transactionDto);
            receipt = await web3.eth.sendSignedTransaction(signed.rawTransaction)
                .on('transactionHash', (hash) => {
                    approve_status.hash = hash;
                    this.transactionApproveDao.update(approve_status);
                });
        } catch (e) {

            if (e.message.includes('CONNECTION ERROR')) {
                approve_status.remark = 'RPC连接失败';
            } else if (e.message.includes('insufficient funds for gas * price + value')) {
                approve_status.remark = 'gas不足';
            } else if (e.message.includes('replacement transaction underpriced')) {
                approve_status.remark = '交易过快，nonce冲突';
            } else if (e.message.includes('nonce too low')) {
                approve_status.remark = 'nonce太低';
            } else {
                approve_status.remark = e.message;
            }

            approve_status.status = StatusEnum.FAILURE;
            await this.transactionApproveDao.update(approve_status);
            return;
        }

        // 交易成功
        approve_status.status = StatusEnum.CHECK_SUCCESS;
        await this.transactionApproveDao.update(approve_status);
    }


}
