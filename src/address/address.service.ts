import {Injectable} from '@nestjs/common';
import {CreateAddressDto} from './dto/create-address.dto';
import {WalletEntity} from './entities/wallet.entity';
import {DataSource, Repository} from 'typeorm';
import {InjectRepository} from '@nestjs/typeorm';
import {timestamp, generateWallet} from '../common/util';
import {AddressDao} from "./dao/address.dao";
import {UpdateIntervalDto} from "./dto/update-interval.dto";

@Injectable()
export class AddressService {

    constructor(
        @InjectRepository(WalletEntity)
        private readonly addressRepository: Repository<WalletEntity>,
        private dataSource: DataSource,
        private readonly addressDao: AddressDao,
    ) {
    }

    async create(createAddressDto: CreateAddressDto) {

        let {counts} = createAddressDto;
        let address_list = [];

        for (let i = 0; i < counts; i++) {
            let {address, privateKey: private_key, mnemonic} = await generateWallet();
            address_list.push({
                address,
                private_key,
                mnemonic,
                'createtime': timestamp()
            });
        }

        try {
            await this.dataSource
                .createQueryBuilder()
                .insert()
                .into(WalletEntity)
                .values(address_list)
                .execute();
        } catch (e) {
            return e;
        }

        return "创建成功";
    }

    async update_interval(updateIntervalDto: UpdateIntervalDto) {
        const {status} = await this.addressDao.update_interval(updateIntervalDto);
        if (status === 0) {
            return "修改成功"
        } else {
            return "修改失败"
        }
    }
}
