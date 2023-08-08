import {Injectable} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {DataSource, Repository} from 'typeorm';
import {timestamp} from '../../common/util';
import {TransactionApproveEntity} from '../entities/transaction-approve.entity';
import {ApproveUpdateDto} from '../dto/approve/approve-update.dto';
import {StatusEnum} from "../../common/enum";
import {GetWalletDto} from "../../wallet/dto/get-wallet.dto";

@Injectable()
export class TransactionApproveDao {

    constructor(
        @InjectRepository(TransactionApproveEntity)
        private readonly approveEntityRepository: Repository<TransactionApproveEntity>,
        private dataSource: DataSource,
    ) {
    }

    async create(order_list) {
        try {
            return await this.dataSource
                .createQueryBuilder()
                .insert()
                .into(TransactionApproveEntity)
                .values(order_list)
                .execute();
        } catch (e) {
            console.log('TransactionApprove 写入失败', e.message);
            return e;
        }

    }

    async update(approveUpdateDto: ApproveUpdateDto) {

        let {id, status, remark, hash} = approveUpdateDto;

        try {
            await this.dataSource
                .createQueryBuilder()
                .update(TransactionApproveEntity)
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
        return await this.dataSource.getRepository(TransactionApproveEntity)
            .createQueryBuilder('approve_orders')
            .leftJoinAndSelect('approve_orders.wallet', 'wallet')
            .where('order_num = :order_num', {order_num})
            .getMany();
    }

    async get_wrong() {
        return await this.dataSource.getRepository(TransactionApproveEntity)
            .createQueryBuilder('approve_orders')
            .leftJoinAndSelect('approve_orders.wallet', 'wallet')
            .where('(approve_orders.status = :status1 OR approve_orders.status = :status2)', {
                status1: StatusEnum.NEVER,
                status2: StatusEnum.FAILURE
            })
            .groupBy("wallet_id")
            .getMany();
    }

    async get_all() {
        return await this.dataSource.getRepository(TransactionApproveEntity)
            .createQueryBuilder('approve_orders')
            .leftJoinAndSelect('approve_orders.wallet', 'wallet')
            .getMany();
    }

}