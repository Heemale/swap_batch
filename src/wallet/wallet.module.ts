import { Module } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { WalletController } from './wallet.controller';
import { WalletEntity } from './entities/wallet.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WalletDao } from './dao/wallet.dao';

@Module({
  imports: [TypeOrmModule.forFeature([WalletEntity])],
  controllers: [WalletController],
  providers: [WalletService, WalletDao],
})
export class WalletModule {
}
