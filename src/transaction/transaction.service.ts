import {HttpException, Injectable} from '@nestjs/common';
import {v4 as uuid} from 'uuid';
import BigNumber from 'bignumber.js';

import {env} from '../config';
import {
    from_wei,
    get_nonce, get_token_price,
    hex_to_number_string,
    remove_pad,
    send_transaction,
    swap,
    to_wei,
} from '../web3';
import {convertToTimestamp, formatTimestamp, getRandom, timestamp} from '../common/util';

import {TransactionSwapDao} from './dao/transaction-swap.dao';
import {SwapCreateDto} from './dto/swap/swap-create.dto';
import {SwapBatchDto} from './dto/swap/batch/swap-batch.dto';
import {SwapDto} from '../web3/dto/swap.dto';
import {TransactionDto} from '../web3/dto/transaction.dto';
import {StatusEnum} from '../common/enum';
import {SwapUpdateDto} from './dto/swap/swap-update.dto';
import {AddressDao} from '../address/dao/address.dao';
import {get_tasks, TaskDao} from "./dao/task.dao";
import {GetAmountsOutDto} from "../web3/dto/get-amounts-out.dto";

export const Web3 = require('web3');

@Injectable()
export class TransactionService {

    constructor(
        private readonly addressDao: AddressDao,
        private readonly transactionSwapDao: TransactionSwapDao,
        private readonly taskDao: TaskDao,
    ) {
    }

    create_swap_from_task = async () => {

        // 获取swap任务
        let tasks = await get_tasks();
        if (tasks.status === -1) return '读取swap任务失败';

        // 调用接口
        for (let i = 0; i < tasks.msg.length; i++) {
            const item = tasks.msg[i];
            let {
                disposable_switch,
                dense_switch,
                range_switch,
                rangestarttime,
                rangeendtime,
                begin_num,
                limit_num,
                max_num,
                min_num,
                token_in,
                token_out,
                times,
                id
            } = item;

            let _rangestarttime;
            let _rangeendtime;
            if (rangestarttime === null || rangeendtime === null) {
                // console.log("定时任务，区间时间格式错误，task_id =>", id);
                continue;
            } else {
                try {
                    _rangestarttime = formatTimestamp(rangestarttime);
                    _rangeendtime = formatTimestamp(rangeendtime);
                } catch (err) {
                    // console.log("定时任务，区间时间格式错误，task_id =>", id);
                    continue;
                }
            }

            const swapBatchDto = new SwapBatchDto(
                disposable_switch,
                dense_switch,
                range_switch,
                _rangestarttime,
                _rangeendtime,
                begin_num,
                limit_num,
                max_num,
                min_num,
                token_in,
                token_out,
                times,
                id
            );

            // TODO 改为直接调用方法
            await this.create_swap_order(swapBatchDto);
        }

        return '执行成功';
    }

    create_swap_order = async (swapBatchDto: SwapBatchDto) => {

        if (env.SWAP_SWITCH === "0") {
            throw new HttpException("swap总开关关闭", 400);
        } else {
            if (env.SWAP_SWITCH !== "1") throw new HttpException("swap开关异常", 400);
        }

        let {
            disposable_switch,
            dense_switch,
            range_switch,
            rangestarttime,
            rangeendtime,
            begin_num,
            limit_num,
            max_num,
            min_num,
            token_in,
            token_out,
            times,
            task_id
        } = swapBatchDto;

        if (times <= 0) throw new HttpException("参数times错误", 400);

        const order_num = uuid();

        // 获取用户
        const users = await this.addressDao.get_address(begin_num, limit_num);

        // 生成订单（swap）
        let order_list = [];

        // 如果是区间交易
        if (range_switch === 1) {

            let _rangestarttime;
            let _rangeendtime;
            try {
                _rangestarttime = convertToTimestamp(rangestarttime);
                _rangeendtime = convertToTimestamp(rangeendtime);
            } catch (err) {
                throw new HttpException("区间时间格式错误", 400);
            }

            // 获取随机时间、排序
            const random_times = [];
            for (let i = 0; i < users.length * times; i++) {
                random_times.push(getRandom(_rangestarttime, _rangeendtime));
            }
            random_times.sort((a, b) => a - b);

            for (let i = 0; i < times; i++) {
                for (let j = 0; j < users.length; j++) {
                    const item = users[j];
                    order_list.push(new SwapCreateDto(order_num, item.id, task_id, i + 1, 0, random_times[users.length * i + j], _rangestarttime, _rangeendtime, getRandom(min_num, max_num), token_in, token_out, timestamp()));
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

                for (let j = 0; j < users.length; j++) {
                    const item = users[j];

                    if (interval_map[item.id] === undefined) {
                        interval_map[item.id] = getRandom(item.interval_min, item.interval_max);
                    } else {
                        interval_map[item.id] += getRandom(item.interval_min, item.interval_max);
                    }

                    let executetime = 0;
                    if (dense_switch === 0) {
                        total_interval = total_interval + interval_map[item.id] * 60;
                        executetime = total_interval;
                    } else if (dense_switch === 1) {
                        executetime = timestamp() + interval_map[item.id] * 60;
                    } else {
                        throw new HttpException("dense_switch 参数错诶，请填写0或者1", 400);
                    }

                    order_list.push(new SwapCreateDto(order_num, item.id, task_id, i + 1, interval_map[item.id], executetime, null, null, getRandom(min_num, max_num), token_in, token_out, timestamp()));
                }
            }
        }

        // 创建订单（swap）
        await this.transactionSwapDao.create(order_list);

        // 如果是一次性任务 且 task_id 不为 null，提交后修改一次性交易执行时间
        if (disposable_switch === 1 && task_id) {
            await this.taskDao.update_disposabletime(task_id);
        }

        return '创建排程的订单已提交';
    }

    execute_swap_order = async () => {

        if (env.SWAP_SWITCH === "0") {
            throw new HttpException("swap总开关关闭", 400);
        } else {
            if (env.SWAP_SWITCH !== "1") throw new HttpException("swap开关异常", 400);
        }

        let orders = await this.transactionSwapDao.get_wrong();

        //设置nonce的对象
        let nonce_map = {};

        //获取各个地址的nonce
        for (let i = 0; i < orders.length; i++) {
            const item = orders[i];
            nonce_map[item.wallet.address.toLowerCase()] = await get_nonce(item.wallet.address);
        }

        for (let i = 0; i < orders.length; i++) {

            const item = orders[i];

            const {id: order_id, token_in, token_out} = item;
            const {token_in_amount, max_price, min_price} = item?.task;

            if (token_in_amount === 0) continue;

            // 获取市值
            const getAmountsOutDto = new GetAmountsOutDto(token_in_amount, [token_in, token_out], env.ROUTER_CONTRACT_ADDRESS);
            const market_price = new BigNumber(await get_token_price(getAmountsOutDto));

            console.log({
                order_id,
                market_price: market_price.valueOf(),
                max_price,
                min_price
            })

            // 市值是否在合法范围内
            const compared_to_max_price = market_price.comparedTo(max_price);
            const compared_to_min_price = market_price.comparedTo(min_price);
            if (!(compared_to_max_price === -1 && compared_to_min_price === 1)) {
                console.log('不在价格区间内，return');
                continue;
            }

            const amount_in = await to_wei(item.amount_in);
            const deadline = (timestamp() + 86400 * 60 * 1000);
            let swapDto = new SwapDto(amount_in, 0, [token_in, token_out], item.wallet.address, deadline, env.ROUTER_CONTRACT_ADDRESS);
            let transactionDto = new TransactionDto(item.wallet.address, env.ROUTER_CONTRACT_ADDRESS, new BigNumber(0).valueOf(), '', item.wallet.private_key, nonce_map[item.wallet.address.toLowerCase()]);
            nonce_map[item.wallet.address.toLowerCase()] = nonce_map[item.wallet.address.toLowerCase()] + 1;

            // 提交交易
            console.log("提交交易")
            this.swap(swapDto, transactionDto, order_id);
        }

    }

    swap = async (swapDto: SwapDto, transactionDto: TransactionDto, order_id) => {

        let web3, data, signed, receipt;

        let swap_status = new SwapUpdateDto(order_id, StatusEnum.NEVER, null, null, null);

        // 连接区块链
        try {
            web3 = await new Web3(new Web3.providers.HttpProvider(env.HTTP_PROVIDER));
        } catch ({message}) {
            swap_status.status = StatusEnum.FAILURE;
            swap_status.remark = "RPC连接失败";
            await this.transactionSwapDao.update(swap_status);
            return;
        }

        // TODO 检查授权额度

        // TODO 检查token余额

        // ABI编码
        try {
            data = await swap(swapDto);
            transactionDto.data = data;
        } catch (e) {
            swap_status.status = StatusEnum.FAILURE;
            swap_status.remark = e.message;
            await this.transactionSwapDao.update(swap_status);
            return;
        }

        // 交易数据编码，提交交易
        try {
            signed = await send_transaction(transactionDto);
            receipt = await web3.eth.sendSignedTransaction(signed.rawTransaction)
                .on('transactionHash', (hash) => {
                    swap_status.hash = hash;
                    this.transactionSwapDao.update(swap_status);
                });
        } catch (e) {

            if (e.message.includes('CONNECTION ERROR')) {
                swap_status.remark = 'RPC连接失败';
            } else if (e.message.includes('insufficient funds for gas * price + value')) {
                swap_status.remark = 'gas不足';
            } else if (e.message.includes('replacement transaction underpriced')) {
                swap_status.remark = '交易过快，nonce冲突';
            } else if (e.message.includes('nonce too low')) {
                swap_status.remark = 'nonce太低';
            } else {
                swap_status.remark = e.message;
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
