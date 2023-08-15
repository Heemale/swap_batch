import {Injectable} from '@nestjs/common';
import {env} from '../config';
import {approve, send_transaction} from '../web3';
import {StatusEnum} from '../common/enum';
import {TransactionDto} from '../web3/dto/transaction.dto';
import {TransactionApproveDao} from "./dao/transaction-approve.dao";
import {ApproveDto} from "../web3/dto/approve.dto";
import {ApproveUpdateDto} from "./dto/approve/approve-update.dto";
import {TransactionApproveAdminDao} from "./dao/transaction-approve-admin.dao";
import {ApproveUpdateAdminDto} from "./dto/approve/approve-update-admin.dto";
import {WalletDao} from "../wallet/wallet.dao";
import {TypeOrmCrudService} from "@nestjsx/crud-typeorm";
import {TransactionApproveEntity} from "./entities/transaction-approve.entity";
import {InjectRepository} from "@nestjs/typeorm";

export const Web3 = require('web3');

@Injectable()
export class TransactionApproveService extends TypeOrmCrudService<TransactionApproveEntity> {

    constructor(
        @InjectRepository(TransactionApproveEntity) repo,
        private readonly walletDao: WalletDao,
        private readonly transactionApproveDao: TransactionApproveDao,
        private readonly transactionApproveAdminDao: TransactionApproveAdminDao,
    ) {
        super(repo);
    }

    approve_admin = async (approveDto: ApproveDto, transactionDto: TransactionDto, id: number) => {

        let web3, data, signed, receipt;
        let approve_status = new ApproveUpdateAdminDto(id, StatusEnum.NEVER, null, null);

        // 连接区块链
        try {
            web3 = await new Web3(new Web3.providers.HttpProvider(env.HTTP_PROVIDER));
        } catch ({message}) {
            approve_status.status = StatusEnum.FAILURE;
            approve_status.remark = "RPC连接失败";
            await this.transactionApproveAdminDao.update(approve_status);
            return;
        }

        // ABI编码
        try {
            data = await approve(approveDto);
            transactionDto.data = data;
        } catch (e) {
            approve_status.status = StatusEnum.FAILURE;
            approve_status.remark = e.message;
            await this.transactionApproveAdminDao.update(approve_status);
            return;
        }

        // 交易数据编码、提交交易
        try {
            signed = await send_transaction(transactionDto);
            receipt = await web3.eth.sendSignedTransaction(signed.rawTransaction)
                .on('transactionHash', (hash) => {
                    approve_status.hash = hash;
                    approve_status.status = StatusEnum.PENDING;
                    this.transactionApproveAdminDao.update(approve_status);
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
            await this.transactionApproveAdminDao.update(approve_status);
            return;
        }

        // 交易成功
        approve_status.status = StatusEnum.CHECK_SUCCESS;
        await this.transactionApproveAdminDao.update(approve_status);
    }

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
                    approve_status.status = StatusEnum.PENDING;
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
