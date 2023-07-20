import {Injectable} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {DataSource, Repository} from 'typeorm';
import {WalletEntity} from '../entities/wallet.entity';
import {pool} from "../../config";
import {timestamp} from "../../common/util";
import {UpdateIntervalDto} from "../dto/update-interval.dto";

@Injectable()
export class AddressDao {

    constructor(
        @InjectRepository(WalletEntity)
        private readonly addressEntityRepository: Repository<WalletEntity>,
        private dataSource: DataSource,
    ) {
    }

    async get_address(begin: number, limit: number): Promise<Array<WalletEntity>> {

        return await this.dataSource
            .getRepository(WalletEntity)
            .createQueryBuilder('user')
            .where('user.id >= :id', {id: begin})
            .limit(limit)
            .getMany();
    }

    async update_interval(updateIntervalDto: UpdateIntervalDto) {

        const {interval_max, interval_min} = updateIntervalDto;

        try {
            let values = [interval_max, interval_min, timestamp()];
            let sql = `update fa_wallet set interval_max = ? , interval_min = ?, updatetime = ?;`;
            let rows, fields;
            try {
                [rows, fields] = await pool.query(sql, [...values]);
            } catch (e) {
                console.log('update_interval 异常 => ', e.message);
                return {status: -1, msg: e};
            }
            return {status: 0, msg: rows};
        } catch (e) {
            return e;
        }
    }

}