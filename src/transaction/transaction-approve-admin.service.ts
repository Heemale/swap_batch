import {Injectable} from '@nestjs/common';
import {InjectRepository} from "@nestjs/typeorm";
import { TypeOrmCrudService } from "@nestjsx/crud-typeorm";
import {TransactionApproveAdminEntity} from "./entities/transaction-approve-admin.entity";

@Injectable()
export class TransactionApproveAdminService extends TypeOrmCrudService<TransactionApproveAdminEntity> {
    constructor(@InjectRepository(TransactionApproveAdminEntity) repo) {
        super(repo);
    }
}
