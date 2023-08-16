import {Injectable} from "@nestjs/common";
import {TradePairEntity} from "./entities/trade-pair.entity";
import {DataSource, Repository} from "typeorm";
import {InjectRepository} from "@nestjs/typeorm";
import {SwitchEnum} from "../common/enum";

@Injectable()
export class TradePairDao {

    constructor(
        @InjectRepository(TradePairEntity)
        private readonly tradePairEntityRepository: Repository<TradePairEntity>,
        private dataSource: DataSource
    ) {
    }

    get_all = async () => {

        return await this.dataSource.getRepository(TradePairEntity)
            .createQueryBuilder('trade_pairs')
            .where('open_switch = :open_switch', {open_switch: SwitchEnum.OPEN})
            .getMany();
    }

}