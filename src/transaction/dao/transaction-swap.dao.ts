import {Injectable} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {DataSource, Repository} from 'typeorm';
import {TransactionSwapEntity} from '../entities/transaction-swap.entity';
import {timestamp} from '../../common/util';
import {SwapUpdateDto} from '../dto/swap/swap-update.dto';
import {StatusEnum} from "../../common/enum";
import {env} from "../../config";

@Injectable()
export class TransactionSwapDao {

    constructor(
        @InjectRepository(TransactionSwapEntity)
        private readonly transactionSwapEntityRepository: Repository<TransactionSwapEntity>,
        private dataSource: DataSource,
    ) {
    }

    async create(order_list: Array<TransactionSwapEntity>) {
        try {
            return await this.dataSource
                .createQueryBuilder()
                .insert()
                .into(TransactionSwapEntity)
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

    async get_by_order_num(order_num: string) {

        return await this.dataSource.getRepository(TransactionSwapEntity)
            .createQueryBuilder('swap_order')
            .leftJoinAndSelect('swap_order.wallet', 'wallet')
            .where('order_num = :order_num', {order_num})
            .getMany();

    }

    async get(type: "never" | "failed") {

        const counts = env.SUBMIT_SWAP_COUNTS;

        let statuses: Array<StatusEnum> = [];

        if (type === "never") {
            statuses = [
                StatusEnum.NEVER,
            ]
        }

        if (type === "failed") {
            statuses = [
                StatusEnum.FAILURE,
                StatusEnum.CHECK_FAILURE
            ]
        }

        return await this.dataSource.getRepository(TransactionSwapEntity)
            .createQueryBuilder('swap_order')
            .leftJoinAndSelect('swap_order.wallet', 'wallet')
            .leftJoinAndSelect('swap_order.task', 'task')
            .where('status IN (:...statuses)', {statuses})
            .andWhere('executetime <= :timestamp', {timestamp: timestamp()})
            .andWhere('failed_counts < :failed_counts', {failed_counts: 10})
            .limit(counts)
            .getMany();
    }

    async update(swapUpdateDto: SwapUpdateDto) {

        let {id, status, remark, amount_out, hash, failed} = swapUpdateDto;

        try {
            const queryBuilder = this.dataSource
                .createQueryBuilder()
                .update(TransactionSwapEntity);

            // 交易失败，更新 failure_counts 字段
            if (failed) {
                queryBuilder.set({
                    status,
                    remark,
                    amount_out,
                    hash,
                    failure_counts: () => "failure_counts + 1", // 将 failure_counts 字段自增 1
                    updatetime: timestamp(),
                });
            } else {
                queryBuilder.set({
                    status,
                    remark,
                    amount_out,
                    hash,
                    updatetime: timestamp(),
                });
            }

            await queryBuilder
                .where('id = :id', {id})
                .execute();
        } catch (e) {
            return e;
        }
    }

    // 获取swap记录中最大的时间戳
    async get_last_time(): Promise<TransactionSwapEntity> {
        try {
            return await this.dataSource.getRepository(TransactionSwapEntity)
                .createQueryBuilder('swap_order')
                .orderBy('swap_order.executetime', 'DESC')
                .getOne();
        } catch ({message}) {
            return message;
        }
    }

}