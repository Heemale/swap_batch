import {Injectable} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {DataSource, Repository} from 'typeorm';
import {timestamp} from '../../common/util';
import {TransactionApproveAdminEntity} from "../entities/transaction-approve-admin.entity";
import {ApproveUpdateAdminDto} from "../dto/approve/approve-update-admin.dto";
import {StatusEnum} from "../../common/enum";

@Injectable()
export class TransactionApproveAdminDao {

    constructor(
        @InjectRepository(TransactionApproveAdminEntity)
        private readonly approveAdminEntityRepository: Repository<TransactionApproveAdminEntity>,
        private dataSource: DataSource,
    ) {
    }

    async create(order_list) {
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

    async group_by_admin_id() {
        return await this.dataSource.getRepository(TransactionApproveAdminEntity)
            .createQueryBuilder('approve_orders')
            .leftJoinAndSelect('approve_orders.admin', 'admin')
            .where('(approve_orders.status = :status1 OR approve_orders.status = :status2)', {
                status1: StatusEnum.NEVER,
                status2: StatusEnum.FAILURE
            })
            .groupBy('admin.id')
            .getMany();
    }

    async get(admin_id, token_address, spender) {
        return await this.dataSource.getRepository(TransactionApproveAdminEntity)
            .createQueryBuilder('approve_orders')
            .where('admin = :admin', {admin: admin_id})
            .andWhere('token_address = :token_address', {token_address})
            .andWhere('spender = :spender', {spender})
            .getOne();
    }

}