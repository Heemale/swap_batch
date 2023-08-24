import {Body, Controller, Post} from "@nestjs/common";
import {Crud, CrudController} from "@nestjsx/crud";
import {ApiTags} from "@nestjs/swagger";
import {TransactionCollectEntity} from "./entities/transaction-collect.entity";
import {TransactionCollectService} from "./transaction-collect.service";
import {CollectBatchDto} from "./dto/collect/collect-batch.dto";
import {WalletDao} from "../wallet/wallet.dao";
import {CollectDto} from "./dto/collect/collect.dto";

@Crud({
    model: {
        type: TransactionCollectEntity,
    },
    query: {
        exclude: ['id'], // fix https://github.com/nestjsx/crud/issues/788
        join: {
            wallet: {
                eager: true, // 使用 eager 加载关联数据
                exclude: ['id'], // fix https://github.com/nestjsx/crud/issues/788
            },
            task: {
                eager: true, // 使用 eager 加载关联数据
                exclude: ['id'], // fix https://github.com/nestjsx/crud/issues/788
            },
        },
    },
})
@ApiTags('归集记录')
@Controller("transaction/collect")
export class TransactionCollectController implements CrudController<TransactionCollectEntity> {
    constructor(
        public service: TransactionCollectService,
        private readonly walletDao: WalletDao,
    ) {
    }

    @Post('gas')
    async create_collect_gas(@Body() collectDto: CollectDto) {

        const {task_id} = collectDto;

        // 获取wallets
        const wallets = await this.walletDao.get_address_by_task_id(task_id);

        // 创建归集记录
        const collectBatchDto = new CollectBatchDto(task_id, wallets, [""])

        // 调用
        return await this.service.create_collect_order(collectBatchDto);
    }

}