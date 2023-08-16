import {Injectable} from '@nestjs/common';
import {InjectRepository} from "@nestjs/typeorm";
import {TypeOrmCrudService} from "@nestjsx/crud-typeorm";
import {BalanceEntity} from "./entities/balance.entity";
import {from_wei, get_balance, get_token_balance} from "../web3";
import {BalanceCreateDto} from "./dto/balance/balance-create.dto";
import {timestamp} from "../common/util";
import {BalanceDao} from "./dao/balance.dao";
import {BalanceStatisticalDto} from "./dto/balance/balance-statistical.dto";
import {WalletDao} from "../wallet/wallet.dao";

@Injectable()
export class BalanceService extends TypeOrmCrudService<BalanceEntity> {
    constructor(
        @InjectRepository(BalanceEntity) repo,
        private balanceDao: BalanceDao,
        private walletDao: WalletDao
    ) {
        super(repo);
    }

    statistical_balance = async (balanceStatisticalDto: BalanceStatisticalDto) => {

        const {token_addresses} = balanceStatisticalDto;
        const order_list: Array<BalanceCreateDto> = [];

        // 获取wallets
        const wallets = await this.walletDao.get_all();

        // 遍历wallets
        for (let i = 0; i < wallets.length; i++) {

            const wallet = wallets[i];

            const {
                id: wallet_id,
                address: wallet_address
            } = wallet;

            // 遍历token_addresses
            for (let i = 0; i < token_addresses.length; i++) {

                const token_address = token_addresses[i];
                let balance: string;

                if (token_address === "") {
                    balance = await from_wei(await get_balance(wallet_address));
                } else {
                    balance = await from_wei(await get_token_balance(wallet_address, token_address));
                }

                const balanceCreateDto = new BalanceCreateDto(wallet_id, token_address, balance, timestamp(), timestamp());

                order_list.push(balanceCreateDto);
            }

        }

        await this.balanceDao.create(order_list);
    }

}
