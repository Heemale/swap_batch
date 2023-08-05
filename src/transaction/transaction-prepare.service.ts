import {Injectable} from '@nestjs/common';
import {CreatePrepareDto} from "./dto/prepare/create-prepare.dto";
import {TransactionPrepareDao} from "./dao/transaction-prepare.dao";
import {env} from "../config";

@Injectable()
export class TransactionPrepareService {

    constructor(
        private readonly transactionPrepareDao: TransactionPrepareDao,
    ) {
    }

    create = async (task_id, admin_id, times_arr, token_address) => {

        // 生成订单（准备）
        const order_list = generate_prepare_order(times_arr, task_id, token_address, admin_id);

        // 创建订单（准备）
        await this.transactionPrepareDao.create(order_list);
    }

}

export const generate_prepare_order = (times_arr, task_id, token_address, admin_id): Array<CreatePrepareDto> => {

    const order_list: Array<any> = [];

    for (let i = 0; i < times_arr.length; i++) {
        const start = times_arr[i].start;
        const counts = times_arr[i].counts;
        order_list.push({
            task: task_id,
            begin_num: start,
            limit_num: counts,
            token_address,
            spender: env.ROUTER_CONTRACT_ADDRESS,
            admin_id,
        });

    }

    return order_list;
}
