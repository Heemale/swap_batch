import {Injectable} from '@nestjs/common';
import {DataSource, Repository} from 'typeorm';
import {WalletEntity} from '../entities/wallet.entity';
import {timestamp} from "../../common/util";
import {UpdateIntervalDto} from "../dto/update-interval.dto";
import {CreateWalletDto} from "../dto/create-wallet.dto";
import {GetWalletDto} from "../dto/get-wallet.dto";
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
            order: {admin_wallet_num: 'DESC'},
            take: 1,
        });

        return existing_wallets.length > 0 ? existing_wallets[0].admin_wallet_num : 0;
    }

    create = async (wallets: Array<CreateWalletDto>) => {

        await this.dataSource
            .createQueryBuilder()
            .insert()
            .into(WalletEntity)
            .values(wallets)
            .execute();
    }

    get_address = async (getWalletDto: GetWalletDto): Promise<Array<WalletEntity>> => {

        const {admin_id, begin_num, limit_num} = getWalletDto;

        return await this.dataSource
            .getRepository(WalletEntity)
            .createQueryBuilder('wallet')
            .where('wallet.admin_id >= :admin_id', {admin_id})
            .andWhere('wallet.admin_wallet_num >= :begin_num', {begin_num})
            .limit(limit_num)
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

}

