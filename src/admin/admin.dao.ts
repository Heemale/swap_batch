import {Injectable} from '@nestjs/common';
import {InjectRepository} from "@nestjs/typeorm";
import {DataSource, Repository} from "typeorm";
import {AdminEntity} from "./entities/admin.entity";

@Injectable()
export class AdminDao {

    constructor(
        @InjectRepository(AdminEntity)
        private readonly adminEntityRepository: Repository<AdminEntity>,
        private dataSource: DataSource,
    ) {
    }

    get_one = async (username: string) => {

        return await this.dataSource.getRepository(AdminEntity)
            .createQueryBuilder('admin')
            .leftJoinAndSelect('admin.auth_group', 'auth_group')
            .where('username = :username', {username})
            .getOne();
    }

}