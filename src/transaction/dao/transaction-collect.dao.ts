import {Injectable} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {DataSource, Repository} from 'typeorm';
import {timestamp} from '../../common/util';
import {TransactionCollectEntity} from '../entities/transaction-collect.entity';
import {CollectUpdateDto} from '../dto/collect/collect-update.dto';
import {StatusEnum, SwitchEnum, TaskStatus} from "../../common/enum";
import {pool} from "../../config";
import {TaskEntity} from "../../task/entities/task.entity";

@Injectable()
export class TransactionCollectDao {

    constructor(
        @InjectRepository(TransactionCollectEntity)
        private readonly transactionCollectEntityRepository: Repository<TransactionCollectEntity>,
        private dataSource: DataSource,
    ) {
    }

    create = async (order_list: Array<TransactionCollectEntity>) => {
        try {
            return await this.dataSource
                .createQueryBuilder()
                .insert()
                .into(TransactionCollectEntity)
                .values(order_list)
                .execute()
        } catch ({message}) {
            return message;
        }

    }

    update = async (collectUpdateDto: CollectUpdateDto) => {

        let {id, status, remark, hash, amount} = collectUpdateDto;

        try {
            await this.dataSource
                .createQueryBuilder()
                .update(TransactionCollectEntity)
                .set({
                    status,
                    remark,
                    hash,
                    amount,
                    'updatetime': timestamp(),
                })
                .where('id = :id', {id})
                .execute();
        } catch ({message}) {
            return message;
        }
    }

    get_success_counts = async (task_id: number) => {

        return await this.dataSource.getRepository(TransactionCollectEntity)
            .createQueryBuilder('collect_order')
            .where('task = :task', {task: task_id})
            .andWhere('status = :status', {status: StatusEnum.CHECK_SUCCESS})
            .getCount();

    }

    get_gas_record = async () => {

        return await this.dataSource.getRepository(TransactionCollectEntity)
            .createQueryBuilder('collect_order')
            .leftJoinAndSelect('collect_order.task', 'task')
            .leftJoinAndSelect('task.admin', 'admin')
            .where('collect_order.token_address = :token_address', {token_address: ""})
            .andWhere('(collect_order.status = :status1 OR collect_order.status = :status2)', {
                status1: StatusEnum.NEVER,
                status2: StatusEnum.FAILURE
            })
            .groupBy('wallet')
            .getMany();
    }

    get_token_record = async () => {

        return await this.dataSource.getRepository(TransactionCollectEntity)
            .createQueryBuilder('collect_order')
            .leftJoinAndSelect('collect_order.task', 'task')
            .leftJoinAndSelect('collect_order.wallet', 'wallet')
            .leftJoinAndSelect('task.admin', 'admin')
            .where('collect_order.token_address != :token_address', {token_address: ""})
            .andWhere('(collect_order.status = :status1 OR collect_order.status = :status2)', {
                status1: StatusEnum.NEVER,
                status2: StatusEnum.FAILURE
            })
            .groupBy('wallet')
            .getMany();
    }

}