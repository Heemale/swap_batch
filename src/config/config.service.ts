import {Injectable} from '@nestjs/common';
import {InjectRepository} from "@nestjs/typeorm";
import { TypeOrmCrudService } from "@nestjsx/crud-typeorm";
import {ConfigEntity} from "./entities/config.entity";

@Injectable()
export class ConfigService extends TypeOrmCrudService<ConfigEntity> {
    constructor(@InjectRepository(ConfigEntity) repo) {
        super(repo);
    }
}
