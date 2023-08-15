import {Module} from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';
import {TransactionSubsidyEntity} from './entities/transaction-subsidy.entity';
import {TransactionSubsidyDao} from './dao/transaction-subsidy.dao';
import {TransactionSwapEntity} from './entities/transaction-swap.entity';
import {TransactionSwapDao} from './dao/transaction-swap.dao';
import {TransactionApproveEntity} from './entities/transaction-approve.entity';
import {TransactionApproveDao} from './dao/transaction-approve.dao';
import {TaskEntity} from '../task/entities/task.entity';
import {TransactionCollectEntity} from './entities/transaction-collect.entity';
import {TransactionCollectDao} from './dao/transaction-collect.dao';
import {TaskDao} from "../task/task.dao";
import {TransactionCollectService} from "./transaction-collect.service";
import {TransactionSubsidyService} from "./transaction-subsidy.service";
import {TransactionApproveService} from "./transaction-approve.service";
import {TransactionApproveAdminEntity} from "./entities/transaction-approve-admin.entity";
import {TransactionApproveAdminDao} from "./dao/transaction-approve-admin.dao";
import {TradePairEntity} from "../trade-pair/entities/trade-pair.entity";
import {AdminTradePairEntity} from "../trade-pair/entities/admin-trade-pair.entity";
import {WalletDao} from "../wallet/wallet.dao";
import {WalletEntity} from "../wallet/entities/wallet.entity";
import {TransactionPrepareEntity} from "./entities/transaction-prepare.entity";
import {TransactionPrepareService} from "./transaction-prepare.service";
import {TransactionPrepareDao} from "./dao/transaction-prepare.dao";
import {AdminEntity} from "../admin/entities/admin.entity";
import {TaskController} from "../task/task.controller";
import {TaskService} from "../task/task.service";
import {TradePairController} from "../trade-pair/trade-pair.controller";
import {TradePairService} from "../trade-pair/trade-pair.service";
import {AdminController} from "../admin/admin.controller";
import {AdminService} from "../admin/admin.service";
import {TransactionPrepareController} from "./transaction-prepare.controller";
import {TransactionSwapService} from "./transaction-swap.service";
import {TransactionSwapController} from "./transaction-swap.controller";
import {AdminDao} from "../admin/admin.dao";
import {TransactionCollectController} from "./transaction-collect.controller";
import {TransactionApproveController} from "./transaction-approve.controller";
import {TransactionApproveAdminController} from "./transaction-approve-admin.controller";
import {TransactionApproveAdminService} from "./transaction-approve-admin.service";
import {BalanceEntity} from "./entities/balance.entity";
import {BalanceController} from "./balance.controller";
import {BalanceService} from "./balance.service";
import {BalanceDao} from "./dao/balance.dao";

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
            TransactionPrepareEntity,
            AdminEntity,
            BalanceEntity
        ]),
    ],
    controllers: [
        TaskController,
        TradePairController,
        AdminController,
        TransactionPrepareController,
        TransactionSwapController,
        TransactionCollectController,
        TransactionApproveController,
        TransactionApproveAdminController,
        BalanceController
    ],
    providers: [
        WalletDao,
        TaskDao,
        TransactionSubsidyDao,
        TransactionApproveDao,
        TransactionApproveAdminDao,
        TransactionSwapDao,
        TransactionCollectDao,
        TransactionPrepareDao,
        AdminDao,
        BalanceDao,
        TransactionSubsidyService,
        TransactionApproveService,
        TransactionCollectService,
        TransactionPrepareService,
        TaskService,
        TradePairService,
        AdminService,
        TransactionPrepareService,
        TransactionSwapService,
        TransactionCollectService,
        TransactionApproveService,
        TransactionApproveAdminService,
        BalanceService
    ],
    exports: [
        WalletDao,
        TaskDao,
        TransactionSubsidyDao,
        TransactionApproveDao,
        TransactionApproveAdminDao,
        TransactionSwapDao,
        TransactionCollectDao,
        TransactionPrepareDao,
        AdminDao,
        BalanceDao,
        TransactionSubsidyService,
        TransactionApproveService,
        TransactionCollectService,
        TransactionPrepareService,
        TaskService,
        TradePairService,
        AdminService,
        TransactionPrepareService,
        TransactionSwapService,
        TransactionCollectService,
        TransactionApproveService,
        TransactionApproveAdminService,
        BalanceService
    ],
})
export class TransactionModule {
}
