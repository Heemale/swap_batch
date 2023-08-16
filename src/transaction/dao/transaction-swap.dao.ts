import {Injectable} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {DataSource, Repository} from 'typeorm';
import {TransactionSwapEntity} from '../entities/transaction-swap.entity';
import {timestamp} from '../../common/util';
import {SwapUpdateDto} from '../dto/swap/swap-update.dto';
import {StatusEnum, SwitchEnum} from "../../common/enum";
import {env} from "../../config";

@Injectable()
export class TransactionSwapDao {

    constructor(
        @InjectRepository(TransactionSwapEntity)
        private readonly transactionSwapEntityRepository: Repository<TransactionSwapEntity>,
        private dataSource: DataSource,
    ) {
    }

    async create(order_list) {
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
            console.log("TransactionSwapEntity create写入失败 => ", e.message);
            return e;
        }

    }

    async get_success_counts(task_id: number) {

        return await this.dataSource.getRepository(TransactionSwapEntity)
            .createQueryBuilder('swap_order')
            .where('task_id = :task_id', {task_id})
            .andWhere('status = :status', {status: StatusEnum.CHECK_SUCCESS})
            .getCount();

    }

    async get(type: "never" | "failed", trade_pair_id, limits) {

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
            .where('swap_order.status IN (:...statuses)', {statuses})
            .andWhere('swap_order.executetime <= :timestamp', {timestamp: timestamp()})
            .andWhere('swap_order.failed_counts < :failed_counts', {failed_counts: 10})
            .andWhere('task.trade_pair = :trade_pair', {trade_pair: trade_pair_id})
            .andWhere('task.swap_switch = :swap_switch', {trade_pair: SwitchEnum.OPEN})
            .limit(limits)
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
                    failed_counts: () => "failed_counts + 1", // 失败次数自增1
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
            console.log("swap update异常 => ", e.message);
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