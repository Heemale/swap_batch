import {Injectable} from '@nestjs/common';
import BigNumber from 'bignumber.js';

import {env} from '../config';
import {
    from_wei,
    get_nonce, get_token_balance, get_token_price,
    hex_to_number_string,
    remove_pad,
    send_transaction,
    swap,
    to_wei,
} from '../web3';
import {timestamp} from '../common/util';

import {TransactionSwapDao} from './dao/transaction-swap.dao';
import {SwapDto} from '../web3/dto/swap.dto';
import {TransactionDto} from '../web3/dto/transaction.dto';
import {StatusEnum,} from '../common/enum';
import {SwapUpdateDto} from './dto/swap/swap-update.dto';
import {TaskDao} from "./dao/task.dao";
import {GetAmountsOutDto} from "../web3/dto/get-amounts-out.dto";
import {WalletDao} from "../wallet/dao/wallet.dao";

export const Web3 = require('web3');

@Injectable()
export class TransactionService {

    constructor(
        private readonly walletDao: WalletDao,
        private readonly transactionSwapDao: TransactionSwapDao,
        private readonly taskDao: TaskDao,
    ) {
    }

    execute_swap_order = async (type: "never" | "failed") => {

        // swap总开关关闭
        if (env.SWAP_SWITCH === "0") {
            return;
        } else {
            // swap开关异常
            if (env.SWAP_SWITCH !== "1") return;
        }

        const orders = await this.transactionSwapDao.get(type);

        // nonce_mapping
        let nonce_mapping: { [key: string]: bigint } = {};

        for (let i = 0; i < orders.length; i++) {

            const order = orders[i];

            const {
                id: order_id,
                token_in,
                token_out
            } = order;
            const {
                token_in_amount,
                price_max,
                price_min
            } = order?.task;
            const wallet_address = order.wallet.address.toLowerCase();

            // 转入token数量，用于计算市值（必填）
            console.log({token_in_amount});
            if (token_in_amount === 0) continue;

            // 如果未查询过nonce
            if (!(wallet_address.toLowerCase() in nonce_mapping)) {
                nonce_mapping[wallet_address.toLowerCase()] = await get_nonce(wallet_address);
            }
            console.log({nonce_mapping});

            // 获取市值
            const getAmountsOutDto = new GetAmountsOutDto(token_in_amount, [token_in, token_out], env.ROUTER_CONTRACT_ADDRESS);
            const market_price = new BigNumber(await get_token_price(getAmountsOutDto));

            // 市值是否在合法范围内
            const compared_to_max_price = market_price.comparedTo(price_max);
            const compared_to_min_price = market_price.comparedTo(price_min);
            if (!(compared_to_max_price === -1 && compared_to_min_price === 1)) continue;

            const amount_in = await to_wei(order.amount_in);
            const deadline = (timestamp() + 86400 * 60 * 1000);
            const swapDto = new SwapDto(amount_in, 0, [token_in, token_out], wallet_address, deadline, env.ROUTER_CONTRACT_ADDRESS);
            const transactionDto = new TransactionDto(wallet_address, env.ROUTER_CONTRACT_ADDRESS, new BigNumber(0).valueOf(), '', order.wallet.private_key, nonce_mapping[wallet_address.toLowerCase()]++);
            // console.log({swapDto});
            // console.log({transactionDto});
            // 提交交易
            this.swap(swapDto, transactionDto, order_id);
        }

    }

    swap = async (swapDto: SwapDto, transactionDto: TransactionDto, order_id) => {

        console.log("swap()");

        let web3, data, signed, receipt;

        let swap_status = new SwapUpdateDto(order_id, StatusEnum.NEVER, null, null, null, false);

        // 连接区块链
        try {
            web3 = await new Web3(new Web3.providers.HttpProvider(env.HTTP_PROVIDER));
        } catch ({message}) {
            console.log("连接区块链 => ", message)
            swap_status.status = StatusEnum.FAILURE;
            swap_status.remark = "RPC连接失败";
            await this.transactionSwapDao.update(swap_status);
            return;
        }

        // TODO 检查授权额度

        // 判断token余额
        const amount_in = swapDto.amountIn;
        const from = transactionDto.from;
        const token_address = swapDto.path[0];
        const balance = await get_token_balance(from, token_address);
        const amount_in_BN = new BigNumber(amount_in);
        const balance_BN = new BigNumber(balance);
        if (amount_in_BN.gt(balance_BN)) {
            swap_status.status = StatusEnum.FAILURE;
            swap_status.remark = "token不足";
            swap_status.failed = true;
            await this.transactionSwapDao.update(swap_status);
            console.log("token不足 => ",swap_status);
            return;
        }

        // ABI编码
        try {
            data = await swap(swapDto);
            transactionDto.data = data;
        } catch (e) {
            swap_status.status = StatusEnum.FAILURE;
            swap_status.remark = e.message;
            swap_status.failed = true;
            await this.transactionSwapDao.update(swap_status);
            return;
        }

        // 交易数据编码，提交交易
        try {
            signed = await send_transaction(transactionDto);
            receipt = await web3.eth.sendSignedTransaction(signed.rawTransaction)
                .on('transactionHash', (hash) => {
                    // 交易中
                    swap_status.hash = hash;
                    swap_status.status = StatusEnum.PENDING;
                    this.transactionSwapDao.update(swap_status);
                });
        } catch (e) {

            if (e.message.includes('CONNECTION ERROR')) {
                swap_status.remark = 'RPC连接失败';
            } else if (e.message.includes('insufficient funds for gas * price + value')) {
                swap_status.remark = 'gas不足';
                swap_status.failed = true;
            } else if (e.message.includes('replacement transaction underpriced')) {
                swap_status.remark = '交易过快，nonce冲突';
                swap_status.failed = true;
            } else if (e.message.includes('nonce too low')) {
                swap_status.remark = 'nonce太低';
                swap_status.failed = true;
            } else if (e.message.includes('TRANSFER_FROM_FAILED')) {
                swap_status.remark = 'token不足';
                swap_status.failed = true;
            } else {
                swap_status.remark = e.message;
                swap_status.failed = true;
            }

            swap_status.status = StatusEnum.FAILURE;
            await this.transactionSwapDao.update(swap_status);
            return;
        }

        // 待核验
        swap_status.status = StatusEnum.CHECK_WAITING;
        await this.transactionSwapDao.update(swap_status);

        // 验证
        const {logs} = receipt;

        for (let i = 0; i < logs.length; i++) {
            const log = logs[i];
            const topics = log.topics;

            // 如果topics[1]、topics[2]不存在，进行下一次循环
            if (!topics[1] || !topics[2]) continue;

            // 验证条件
            const toAddress = swapDto.to;
            const _toAddress = await remove_pad(topics[2]);

            // 检查 log 的 topics[2] 是否与条件匹配
            if (toAddress.toLowerCase() === _toAddress.toLowerCase()) {
                const amountOut = await hex_to_number_string(log.data);
                swap_status.amount_out = await from_wei(amountOut);
                swap_status.status = StatusEnum.CHECK_SUCCESS;
                swap_status.remark = null;
                await this.transactionSwapDao.update(swap_status);
                break; // 跳出 for 循环
            }
        }

    }

}
