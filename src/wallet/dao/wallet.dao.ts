import {Injectable} from '@nestjs/common';
import {DataSource, Repository} from 'typeorm';
import {WalletEntity} from '../entities/wallet.entity';
import {generate_wallet, timestamp} from "../../common/util";
import {UpdateIntervalDto} from "../dto/update-interval.dto";
import {CreateWalletBatchDto} from "../dto/create-wallet-batch.dto";
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

    create = async (createWalletBatchDto: CreateWalletBatchDto) => {

        // TODO 实现不同的admin_id，admin_wallet_num递增
        // const existingWallets = await this.walletEntityRepository.find({
        //     where: { admin_id: adminId },
        //     order: { admin_wallet_num: 'DESC' },
        //     take: 1,
        // });
        //
        // const maxAdminWalletNum = existingWallets.length > 0 ? existingWallets[0].admin_wallet_num : 0;

        const wallets = await generate_wallet_batch(createWalletBatchDto);

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

export const generate_wallet_batch = async (createWalletBatchDto: CreateWalletBatchDto): Promise<Array<CreateWalletDto>> => {

    const {admin_id, counts} = createWalletBatchDto;

    const wallets: Array<CreateWalletDto> = [];

    for (let i = 0; i < counts; i++) {
        const {address, private_key, mnemonic} = await generate_wallet();
        const createWalletDto = new CreateWalletDto(admin_id, address, private_key, mnemonic, timestamp());
        wallets.push(createWalletDto);
    }

    return wallets;
}