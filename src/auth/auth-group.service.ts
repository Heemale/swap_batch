import {Injectable} from '@nestjs/common';
import {TypeOrmCrudService} from "@nestjsx/crud-typeorm";
import {AuthGroupEntity} from "./entities/auth-group.entity";
import {InjectRepository} from "@nestjs/typeorm";

@Injectable()
export class AuthGroupService extends TypeOrmCrudService<AuthGroupEntity> {
    constructor(@InjectRepository(AuthGroupEntity) repo) {
        super(repo);
    }
}
