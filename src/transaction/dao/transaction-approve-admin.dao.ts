import {Injectable} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {DataSource, Repository} from 'typeorm';
import {timestamp} from '../../common/util';
import {TransactionApproveAdminEntity} from "../entities/transaction-approve-admin.entity";
import {ApproveUpdateAdminDto} from "../dto/approve/approve-update-admin.dto";

@Injectable()
export class TransactionApproveAdminDao {

    constructor(
        @InjectRepository(TransactionApproveAdminEntity)
        private readonly approveAdminEntityRepository: Repository<TransactionApproveAdminEntity>,
        private dataSource: DataSource,
    ) {
    }

    async create(order_list: Array<TransactionApproveAdminEntity>) {
        try {
            return await this.dataSource
                .createQueryBuilder()
                .insert()
                .into(TransactionApproveAdminEntity)
                .values(order_list)
                .execute();
        } catch (e) {
            return e;
        }

    }

    async update(approveUpdateAdminDto: ApproveUpdateAdminDto) {

        let {id, status, remark, hash} = approveUpdateAdminDto;

        try {
            await this.dataSource
                .createQueryBuilder()
                .update(TransactionApproveAdminEntity)
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
        return await this.dataSource.getRepository(TransactionApproveAdminEntity)
            .createQueryBuilder('approve_orders')
            .where('order_num = :order_num', {order_num})
            .getMany();
    }

}