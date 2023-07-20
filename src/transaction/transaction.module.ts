import {Module} from '@nestjs/common';
import {TransactionService} from './transaction.service';
import {TransactionController} from './transaction.controller';
import {TypeOrmModule} from '@nestjs/typeorm';
import {TransactionSubsidyEntity} from './entities/transaction-subsidy.entity';
import {WalletEntity} from '../address/entities/wallet.entity';
import {TransactionSubsidyDao} from './dao/transaction-subsidy.dao';
import {AddressDao} from '../address/dao/address.dao';
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

@Module({
    imports: [
        TypeOrmModule.forFeature([
            WalletEntity,
            TransactionSubsidyEntity,
            TransactionApproveAdminEntity,
            TaskEntity,
            TransactionApproveEntity,
            TransactionSwapEntity,
            TransactionCollectEntity,
        ]),
    ],
    controllers: [TransactionController],
    providers: [
        TransactionService,
        AddressDao,
        TransactionSubsidyDao,
        TransactionApproveDao,
        TransactionApproveAdminDao,
        TaskDao,
        TransactionSwapDao,
        TransactionCollectDao,
        TransactionSubsidyService,
        TransactionApproveService,
        TransactionCollectService,
    ],
    exports: [
        TransactionService,
        AddressDao,
        TransactionSubsidyDao,
        TransactionApproveDao,
        TransactionApproveAdminDao,
        TaskDao,
        TransactionSwapDao,
        TransactionCollectDao,
        TransactionSubsidyService,
        TransactionApproveService,
        TransactionCollectService,
    ],
})
export class TransactionModule {
}
