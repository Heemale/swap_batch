import {Controller} from "@nestjs/common";
import {Crud, CrudController} from "@nestjsx/crud";
import {ApiTags} from "@nestjs/swagger";
import {TransactionPrepareEntity} from "./entities/transaction-prepare.entity";
import {TransactionPrepareService} from "./transaction-prepare.service";

@Crud({
    model: {
        type: TransactionPrepareEntity,
    },
    query: {
        exclude: ['id'], // fix https://github.com/nestjsx/crud/issues/788
        join: {
            task: {
                eager: true, // 使用 eager 加载关联数据
                exclude: ['id'], // fix https://github.com/nestjsx/crud/issues/788
            },
            "task.admin": {
                eager: true, // 使用 eager 加载关联数据
                exclude: ['id'], // fix https://github.com/nestjsx/crud/issues/788
            },
        },
    },
})
@ApiTags('准备记录')
@Controller("transaction/prepare")
export class TransactionPrepareController implements CrudController<TransactionPrepareEntity> {
    constructor(public service: TransactionPrepareService) {
    }
}