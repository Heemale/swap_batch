import {Injectable} from '@nestjs/common';
import {CreateWalletBatchDto} from "./dto/create-wallet-batch.dto";
import {WalletDao} from "./dao/wallet.dao";
import {CreateWalletDto} from "./dto/create-wallet.dto";
import {generate_wallet, timestamp} from "../common/util";

@Injectable()
export class WalletService {

    constructor(
        private readonly walletDao: WalletDao,
    ) {
    }

    create = async (createWalletBatchDto: CreateWalletBatchDto) => {

        const {admin_id, task_id, counts} = createWalletBatchDto;

        // 获取某个管理员创建的钱包最大编号
        const max_admin_wallet_num = await this.walletDao.max_admin_wallet_num(admin_id);

        // 生成钱包
        const wallets = await generate_wallet_batch(admin_id, task_id, counts, max_admin_wallet_num);

        // 创建钱包
        return await this.walletDao.create(wallets);

    }

}

export const generate_wallet_batch = async (admin_id, task_id, counts, max_admin_wallet_num): Promise<Array<CreateWalletDto>> => {

    const wallets: Array<CreateWalletDto> = [];

    for (let i = 0; i < counts; i++) {
        const {address, private_key, mnemonic} = await generate_wallet();
        wallets.push({
            admin_special_num: ++max_admin_wallet_num,
            admin_id,
            task: task_id,
            address,
            private_key,
            mnemonic,
            createtime: timestamp()
        });
    }

    return wallets;
}
