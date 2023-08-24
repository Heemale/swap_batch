import {Injectable} from '@nestjs/common';
import {DataSource, Repository} from 'typeorm';
import {WalletEntity} from './entities/wallet.entity';
import {timestamp} from "../common/util";
import {UpdateIntervalDto} from "./dto/update-interval.dto";
import {GetWalletDto} from "./dto/get-wallet.dto";
import {InjectRepository} from "@nestjs/typeorm";

@Injectable()
export class WalletDao {

    constructor(
        @InjectRepository(WalletEntity)
        private readonly walletEntityRepository: Repository<WalletEntity>,
        private dataSource: DataSource,
    ) {
    }

    // 获取某个管理员创建的钱包最大编号
    max_admin_wallet_num = async (admin_id: number): Promise<number> => {

        const existing_wallets = await this.walletEntityRepository.find({
            where: {admin_id},
            order: {admin_special_num: 'DESC'},
            take: 1,
        });

        return existing_wallets.length > 0 ? existing_wallets[0].admin_special_num : 0;
    }

    create = async (wallets) => {
        const result = await this.dataSource
            .createQueryBuilder()
            .insert()
            .into(WalletEntity)
            .values(wallets)
            .execute();
        return {
            begin_num: result.raw.insertId,
            limit_num: result.raw.affectedRows
        }
    }

    get_address_special = async (getWalletDto: GetWalletDto): Promise<Array<WalletEntity>> => {

        const {admin_id, begin_num, limit_num} = getWalletDto;

        return await this.dataSource
            .getRepository(WalletEntity)
            .createQueryBuilder('wallet')
            .where('admin_id = :admin_id', {admin_id})
            .andWhere('admin_special_num >= :begin_num', {begin_num})
            .limit(limit_num)
            .getMany();
    }

    get_address = async (begin_num, limit_num): Promise<Array<WalletEntity>> => {

        return await this.dataSource
            .getRepository(WalletEntity)
            .createQueryBuilder('wallet')
            .andWhere('id >= :begin_num', {begin_num})
            .limit(limit_num)
            .getMany();
    }

    get_address_by_task_id = async (task_id: number): Promise<Array<WalletEntity>> => {
        return await this.dataSource
            .getRepository(WalletEntity)
            .createQueryBuilder('wallet')
            .leftJoinAndSelect('wallet.task', 'task') // Left join with 'task'
            .where('task.id = :task_id', { task_id }) // Filter by task_id
            .getMany();
    }

    update_interval = async (updateIntervalDto: UpdateIntervalDto) => {

        const {interval_max, interval_min} = updateIntervalDto;

        await this.dataSource
            .createQueryBuilder()
            .update(WalletEntity)
            .set({
                interval_max,
                interval_min,
                updatetime: timestamp(),
            })
            .execute();
    }

    get_all = async () => {
        return await this.dataSource
            .getRepository(WalletEntity)
            .createQueryBuilder('wallet')
            .getMany();
    }

}

