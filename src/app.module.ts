import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AddressModule } from './address/address.module';
import { TransactionModule } from './transaction/transaction.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { env } from './config';
import {ScheduleModule} from "@nestjs/schedule";

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
    AddressModule,
    TransactionModule,
    ScheduleModule.forRoot(),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
}
