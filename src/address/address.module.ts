import { Module } from '@nestjs/common';
import { AddressService } from './address.service';
import { AddressController } from './address.controller';
import { WalletEntity } from './entities/wallet.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AddressDao } from './dao/address.dao';

@Module({
  imports: [TypeOrmModule.forFeature([WalletEntity])],
  controllers: [AddressController],
  providers: [AddressService, AddressDao],
})
export class AddressModule {
}
