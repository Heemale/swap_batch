import { Controller } from "@nestjs/common";
import { Crud, CrudController } from "@nestjsx/crud";
import {ApiTags} from "@nestjs/swagger";
import {TransactionSwapEntity} from "./entities/transaction-swap.entity";
import {TransactionSwapService} from "./transaction-swap.service";

@Crud({
    model: {
        type: TransactionSwapEntity,
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
            'task.admin': {
                eager: true, // 使用 eager 加载关联数据
                exclude: ['id'], // fix https://github.com/nestjsx/crud/issues/788
            },
        },
    },
})
@ApiTags('swap记录')
@Controller("transaction/swap")
export class TransactionSwapController implements CrudController<TransactionSwapEntity> {
    constructor(public service: TransactionSwapService) {}
}