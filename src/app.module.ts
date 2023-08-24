import {Module} from '@nestjs/common';
import {AppController} from './app.controller';
import {AppService} from './app.service';
import {TransactionModule} from './transaction/transaction.module';
import {TypeOrmModule} from '@nestjs/typeorm';
import {env} from './config';
import {ScheduleModule} from "@nestjs/schedule";
import {WalletModule} from "./wallet/wallet.module";
import {AuthModule} from './auth/auth.module';
import {TaskModule} from './task/task.module';
import {AdminModule} from './admin/admin.module';
import {TradePairModule} from './trade-pair/trade-pair.module';
import {ConfigModule} from "./config/config.module";

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
        ScheduleModule.forRoot(),
        WalletModule,
        TransactionModule,
        AuthModule,
        TaskModule,
        AdminModule,
        TradePairModule,
        ConfigModule
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {
}
