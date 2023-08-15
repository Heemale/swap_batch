import {Injectable} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {DataSource, Repository} from 'typeorm';
import {BalanceEntity} from "../entities/balance.entity";

@Injectable()
export class BalanceDao {

    constructor(
        @InjectRepository(BalanceEntity)
        private readonly balanceEntityRepository: Repository<BalanceEntity>,
        private dataSource: DataSource,
    ) {
    }

    async create(order_list) {

        await this.dataSource
            .createQueryBuilder()
            .insert()
            .into(BalanceEntity)
            .values(order_list)
            .orUpdate(
                ["balance", "updatetime"],
                ["wallet", "token_address"],
            )
            .execute()

    }

}