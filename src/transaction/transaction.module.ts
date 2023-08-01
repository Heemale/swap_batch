import {Module} from '@nestjs/common';
import {TransactionService} from './transaction.service';
import {TransactionController} from './transaction.controller';
import {TypeOrmModule} from '@nestjs/typeorm';
import {TransactionSubsidyEntity} from './entities/transaction-subsidy.entity';
import {TransactionSubsidyDao} from './dao/transaction-subsidy.dao';
import {TransactionSwapEntity} from './entities/transaction-swap.entity';
import {TransactionSwapDao} from './dao/transaction-swap.dao';
import {TransactionApproveEntity} from './entities/transaction-approve.entity';
import {TransactionApproveDao} from './dao/transaction-approve.dao';
import {TaskEntity} from './entities/task.entity';
import {TransactionCollectEntity} from './entities/transaction-collect.entity';
import {TransactionCollectDao} from './dao/transaction-collect.dao';
import {TaskDao} from "./dao/task.dao";
import {TransactionCollectService} from "./transaction-collect.service";
import {TransactionSubsidyService} from "./transaction-subsidy.service";
import {TransactionApproveService} from "./transaction-approve.service";
import {TransactionApproveAdminEntity} from "./entities/transaction-approve-admin.entity";
import {TransactionApproveAdminDao} from "./dao/transaction-approve-admin.dao";
import {TradePairEntity} from "./entities/trade-pair.entity";
import {AdminTradePairEntity} from "./entities/admin-trade-pair.entity";
import {WalletDao} from "../wallet/dao/wallet.dao";
import {WalletEntity} from "../wallet/entities/wallet.entity";

@Module({
    imports: [
        TypeOrmModule.forFeature([
            WalletEntity,
            TaskEntity,
            TransactionSubsidyEntity,
            TransactionApproveEntity,
            TransactionApproveAdminEntity,
            TransactionSwapEntity,
            TransactionCollectEntity,
            TradePairEntity,
            AdminTradePairEntity,
        ]),
    ],
    controllers: [TransactionController],
    providers: [
        WalletDao,
        TaskDao,
        TransactionService,
        TransactionSubsidyDao,
        TransactionApproveDao,
        TransactionApproveAdminDao,
        TransactionSwapDao,
        TransactionCollectDao,
        TransactionSubsidyService,
        TransactionApproveService,
        TransactionCollectService,
    ],
    exports: [
        WalletDao,
        TaskDao,
        TransactionService,
        TransactionSubsidyDao,
        TransactionApproveDao,
        TransactionApproveAdminDao,
        TransactionSwapDao,
        TransactionCollectDao,
        TransactionSubsidyService,
        TransactionApproveService,
        TransactionCollectService,
    ],
})
export class TransactionModule {
}
