import {Injectable} from '@nestjs/common';
import {TransactionPrepareDao} from "./dao/transaction-prepare.dao";
import {env} from "../config";
import {timestamp} from "../common/util";
import {TypeOrmCrudService} from "@nestjsx/crud-typeorm";
import {TransactionPrepareEntity} from "./entities/transaction-prepare.entity";
import {InjectRepository} from "@nestjs/typeorm";

@Injectable()
export class TransactionPrepareService extends TypeOrmCrudService<TransactionPrepareEntity> {

    constructor(
        @InjectRepository(TransactionPrepareEntity) repo,
        private readonly transactionPrepareDao: TransactionPrepareDao,
    ) {
        super(repo);
    }

    create = async (task_id, times_arr, token_address) => {

        // 生成订单（准备）
        const order_list = generate_prepare_order(times_arr, task_id, token_address);

        // 创建订单（准备）
        await this.transactionPrepareDao.create(order_list);
    }

}

export const generate_prepare_order = (times_arr, task_id, token_address) => {

    const order_list: Array<any> = [];
    const createtime = timestamp();

    for (let i = 0; i < times_arr.length; i++) {
        const start = times_arr[i].start;
        const counts = times_arr[i].counts;
        order_list.push({
            task: task_id,
            begin_num: start,
            limit_num: counts,
            token_address,
            spender: env.ROUTER_CONTRACT_ADDRESS,
            createtime
        });

    }

    return order_list;
}
