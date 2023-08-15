import {Injectable} from '@nestjs/common';
import {InjectRepository} from "@nestjs/typeorm";
import { TypeOrmCrudService } from "@nestjsx/crud-typeorm";
import {TradePairEntity} from "./entities/trade-pair.entity";

@Injectable()
export class TradePairService extends TypeOrmCrudService<TradePairEntity> {
    constructor(@InjectRepository(TradePairEntity) repo) {
        super(repo);
    }
}
