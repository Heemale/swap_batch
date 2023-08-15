import {Injectable} from '@nestjs/common';
import {InjectRepository} from "@nestjs/typeorm";
import {TypeOrmCrudService} from "@nestjsx/crud-typeorm";
import {AdminEntity} from "./entities/admin.entity";
import {AdminDao} from "./admin.dao";

@Injectable()
export class AdminService extends TypeOrmCrudService<AdminEntity> {

    constructor(
        @InjectRepository(AdminEntity) repo,
        private readonly adminDao: AdminDao,
    ) {
        super(repo);
    }

    get_one = async (username: string) => {
        return await this.adminDao.get_one(username);
    }

}
