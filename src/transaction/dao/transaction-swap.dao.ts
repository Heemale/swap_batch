import {Injectable} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {DataSource, Repository} from 'typeorm';
import {TransactionSwapEntity} from '../entities/transaction-swap.entity';
import {timestamp} from '../../common/util';
import {SwapUpdateDto} from '../dto/swap/swap-update.dto';
import {StatusEnum} from "../../common/enum";

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

    async get_wrong() {
        return await this.dataSource.getRepository(TransactionSwapEntity)
            .createQueryBuilder('swap_order')
            .leftJoinAndSelect('swap_order.wallet', 'wallet')
            .leftJoinAndSelect('swap_order.task', 'task')
            .where('status != :status', {status: StatusEnum.CHECK_SUCCESS})
            .andWhere('executetime <= :timestamp', {timestamp: timestamp()})
            .getMany();
    }

    async update(swapUpdateDto: SwapUpdateDto) {

        let {id, status, remark, amount_out, hash} = swapUpdateDto;

        try {
            await this.dataSource
                .createQueryBuilder()
                .update(TransactionSwapEntity)
                .set({
                    status,
                    remark,
                    amount_out,
                    hash: hash,
                    'updatetime': timestamp(),
                })
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