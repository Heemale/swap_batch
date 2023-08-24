import {Injectable} from '@nestjs/common';
import BigNumber from 'bignumber.js';

import {env} from '../config';
import {
    from_wei,
    get_balance,
    get_nonce,
    get_receipt,
    hex_to_number_string,
    remove_pad,
    transfer,
    get_gas_price,
    get_token_balance
} from '../web3';
import {timestamp} from '../common/util';
import {StatusEnum} from '../common/enum';
import {TransactionDto} from '../web3/dto/transaction.dto';
import {TransferDto} from '../web3/dto/transfer.dto';
import {CollectUpdateDto} from './dto/collect/collect-update.dto';
import {CollectBatchDto} from './dto/collect/collect-batch.dto';
import {TransactionCollectDao} from './dao/transaction-collect.dao';
import {WalletDao} from "../wallet/wallet.dao";
import {TypeOrmCrudService} from "@nestjsx/crud-typeorm";
import {TransactionCollectEntity} from "./entities/transaction-collect.entity";
import {InjectRepository} from "@nestjs/typeorm";

export const Web3 = require('web3');

@Injectable()
export class TransactionCollectService extends TypeOrmCrudService<TransactionCollectEntity> {

    constructor(
        @InjectRepository(TransactionCollectEntity) repo,
        private readonly walletDao: WalletDao,
        private readonly collectTransactionDao: TransactionCollectDao,
    ) {
        super(repo);
    }

    create_collect_order = async (collectBatchDto: CollectBatchDto) => {

        const {wallets, token_addresses, task_id} = collectBatchDto;

        // 生成订单（归集）
        let order_list = [];

        for (let i = 0; i < token_addresses.length; i++) {

            const token_address = token_addresses[i];

            for (let j = 0; j < wallets.length; j++) {

                const {id: wallet_id} = wallets[j];

                order_list.push({
                    task: task_id, wallet: wallet_id, amount: null, token_address, createtime: timestamp(),
                });

            }

        }

        // 创建订单（归集）
        return await this.collectTransactionDao.create(order_list);
    }

    collect = async (orders) => {

        for (let i = 0; i < orders.length; i++) {

            const order = orders[i];
            const {id: order_id, token_address: contract_address} = order;
            const {address: from, private_key} = order.wallet;
            const {admin_address,} = order.task.admin;

            const nonce = await get_nonce(from);

            let web3, to, balance, data, transaction_config, signed, receipt;
            let collectUpdateDto = new CollectUpdateDto(order_id, StatusEnum.NEVER, null, null, '0');
            const transactionDto = new TransactionDto(from, to, '0', '', private_key, nonce);

            // to 和 balance（如果是eth转账，后面会重新计算数据）
            if (contract_address == '') {
                to = admin_address;
                balance = await get_balance(from);
            } else {
                to = contract_address;
                try {
                    balance = await get_token_balance(from, contract_address);
                } catch ({message}) {
                    collectUpdateDto.status = StatusEnum.FAILURE;
                    collectUpdateDto.remark = '非法钱包地址或ERC20合约地址';
                    await this.collectTransactionDao.update(collectUpdateDto);
                    return message;
                }
                collectUpdateDto.amount = await from_wei(balance);
            }


            // 交易配置
            if (contract_address == '') {
                transaction_config = {from, to, value: balance};
            } else {
                const transferDto = new TransferDto(admin_address, balance, contract_address);
                try {
                    data = await transfer(transferDto);
                    transactionDto.data = data;
                } catch ({message}) {
                    collectUpdateDto.status = StatusEnum.FAILURE;
                    collectUpdateDto.remark = 'transfer ABI编码异常';
                    await this.collectTransactionDao.update(collectUpdateDto);
                    return;
                }
                transaction_config = {from, to, value: 0, data};
            }

            // 连接区块链
            try {
                web3 = await new Web3(new Web3.providers.HttpProvider(env.HTTP_PROVIDER));
            } catch ({message}) {
                collectUpdateDto.status = StatusEnum.FAILURE;
                collectUpdateDto.remark = "RPC连接失败";
                await this.collectTransactionDao.update(collectUpdateDto);
                return;
            }

            // 预估gas
            let gas = 21000;
            try {
                gas = await web3.eth.estimateGas({...transaction_config});
            } catch ({message}) {
                collectUpdateDto.status = StatusEnum.FAILURE;
                collectUpdateDto.remark = '预估gas异常';
                await this.collectTransactionDao.update(collectUpdateDto);
                return;
            }

            // 重新计算balance
            if (contract_address == '') {

                // 计算balance
                const gas_price = await get_gas_price();
                const value = BigNumber(balance).minus(BigNumber(gas).times(BigNumber(gas_price.toString())));

                if (value.comparedTo(new BigNumber(0)) == -1) {
                    collectUpdateDto.status = StatusEnum.FAILURE;
                    collectUpdateDto.remark = 'gas不足';
                    await this.collectTransactionDao.update(collectUpdateDto);
                    return;
                }

                transaction_config = {from, to, value: value.valueOf()};

                // 更新balance
                collectUpdateDto.amount = await from_wei(value.valueOf());
                await this.collectTransactionDao.update(collectUpdateDto);
            }

            // 签名
            let tx = {...transaction_config, gas, nonce};
            signed = await web3.eth.accounts.signTransaction(tx, private_key);

            // 发送交易
            try {
                receipt = await web3.eth.sendSignedTransaction(signed.rawTransaction)
                    .on('transactionHash', (hash) => {
                        collectUpdateDto.hash = hash;
                        collectUpdateDto.status = StatusEnum.PENDING;
                        this.collectTransactionDao.update(collectUpdateDto);
                    });
            } catch (e) {

                if (e.message.includes('CONNECTION ERROR')) {
                    collectUpdateDto.remark = 'RPC连接失败';
                } else if (e.message.includes('insufficient funds for gas * price + value')) {
                    collectUpdateDto.remark = 'gas不足';
                } else if (e.message.includes('replacement transaction underpriced')) {
                    collectUpdateDto.remark = '交易过快，nonce冲突';
                } else if (e.message.includes('nonce too low')) {
                    collectUpdateDto.remark = 'nonce太低';
                } else {
                    collectUpdateDto.remark = e.message;
                }

                collectUpdateDto.status = StatusEnum.FAILURE;
                await this.collectTransactionDao.update(collectUpdateDto);
                return;
            }

            // 待核验
            collectUpdateDto.status = StatusEnum.CHECK_WAITING;
            await this.collectTransactionDao.update(collectUpdateDto);

            // 获取回执信息
            let _from, _to, _value;
            if (contract_address !== '') {
                const {logs} = receipt;
                _from = await remove_pad(logs[0].topics[1]);
                _to = await remove_pad(logs[0].topics[2]);
                _value = await hex_to_number_string(logs[0].data);
            } else {
                const _receipt = await get_receipt(receipt.transactionHash);
                _from = _receipt.from.toLowerCase();
                _to = _receipt.to.toLowerCase();
                _value = _receipt.value;
            }

            // 核验
            if (_from.toLowerCase() !== from.toLowerCase()) {
                collectUpdateDto.status = StatusEnum.CHECK_FAILURE;
                collectUpdateDto.remark = '核验失败，from不一致';
                await this.collectTransactionDao.update(collectUpdateDto);
                return;
            }
            if (_to.toLowerCase() !== admin_address.toLowerCase()) {
                collectUpdateDto.status = StatusEnum.CHECK_FAILURE;
                collectUpdateDto.remark = '核验失败，to不一致';
                await this.collectTransactionDao.update(collectUpdateDto);
                return;
            }
            if (contract_address == '') {
                if (_value !== transaction_config.value) {
                    collectUpdateDto.status = StatusEnum.CHECK_FAILURE;
                    collectUpdateDto.remark = '核验失败，金额不一致';
                    await this.collectTransactionDao.update(collectUpdateDto);
                    return;
                }
            } else {
                if (_value !== balance) {
                    collectUpdateDto.status = StatusEnum.CHECK_FAILURE;
                    collectUpdateDto.remark = '核验失败，金额不一致';
                    await this.collectTransactionDao.update(collectUpdateDto);
                    return;
                }
            }

            collectUpdateDto.status = StatusEnum.CHECK_SUCCESS;
            await this.collectTransactionDao.update(collectUpdateDto);

        }
    }

}
