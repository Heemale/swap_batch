import {Injectable} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {DataSource, Repository} from 'typeorm';
import {TransactionSubsidyEntity} from '../entities/transaction-subsidy.entity';
import {timestamp} from '../../common/util';
import {SubsidyUpdateDto} from "../dto/subsidy/subsidy-update.dto";
import {StatusEnum} from "../../common/enum";

@Injectable()
export class TransactionSubsidyDao {

    constructor(
        @InjectRepository(TransactionSubsidyEntity)
        private readonly transactionSubsidyEntityRepository: Repository<TransactionSubsidyEntity>,
        private dataSource: DataSource,
    ) {
    }

    async create(order_list: Array<TransactionSubsidyEntity>) {
        try {
            return await this.dataSource
                .createQueryBuilder()
                .insert()
                .into(TransactionSubsidyEntity)
                .values(order_list)
                .execute()
                .then((result) => {
                    return {
                        affectedRows: result.raw.affectedRows,
                    };
                });
        } catch (e) {
            return e;
        }

    }

    async update(subsidyBatchUpdateDto: SubsidyUpdateDto) {

        let {id, status, remark, hash} = subsidyBatchUpdateDto;

        try {
            await this.dataSource
                .createQueryBuilder()
                .update(TransactionSubsidyEntity)
                .set({
                    status,
                    remark,
                    hash,
                    'updatetime': timestamp(),
                })
                .where('id = :id', {id})
                .execute();
        } catch (e) {
            return e;
        }
    }

    async get_by_order_num(order_num: string) {
        return await this.dataSource.getRepository(TransactionSubsidyEntity)
            .createQueryBuilder('subsidy_orders')
            .where('order_num = :order_num', {order_num})
            .getMany();
    }

    async get_wrong() {
        return await this.dataSource.getRepository(TransactionSubsidyEntity)
            .createQueryBuilder('orders')
            .where('status != :status', {status: StatusEnum.CHECK_SUCCESS})
            .getOne();
    }
}