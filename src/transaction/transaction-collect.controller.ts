import {Controller} from "@nestjs/common";
import {Crud, CrudController} from "@nestjsx/crud";
import {ApiTags} from "@nestjs/swagger";
import {TransactionCollectEntity} from "./entities/transaction-collect.entity";
import {TransactionCollectService} from "./transaction-collect.service";

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
    constructor(public service: TransactionCollectService) {
    }
}