import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TransactionModule } from './transaction/transaction.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { env } from './config';
import {ScheduleModule} from "@nestjs/schedule";
import {WalletModule} from "./wallet/wallet.module";

@Module({
  imports: [
    TypeOrmModule.forRoot({
      'type': 'mysql',
      'host': env.DB.HOST,
      'port': 3306,
      'username': env.DB.USERNAME,
      'password': env.DB.PASSWORD,
      'database': env.DB.DATABASE,
      'autoLoadEntities': true,
      'synchronize': true,
      'logging': false,
    }),
    WalletModule,
    TransactionModule,
    ScheduleModule.forRoot(),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
}
