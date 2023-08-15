import { Controller } from "@nestjs/common";
import { Crud, CrudController } from "@nestjsx/crud";
import {ApiTags} from "@nestjs/swagger";
import {TransactionApproveEntity} from "./entities/transaction-approve.entity";
import {TransactionApproveService} from "./transaction-approve.service";

@Crud({
    model: {
        type: TransactionApproveEntity,
    },
    query: {
        exclude: ['id'], // fix https://github.com/nestjsx/crud/issues/788
        join: {
            wallet: {
                eager: true, // 使用 eager 加载关联数据
                exclude: ['id'], // fix https://github.com/nestjsx/crud/issues/788
            },
        },
    },
})
@ApiTags('授权记录')
@Controller("transaction/approve")
export class TransactionApproveController implements CrudController<TransactionApproveEntity> {

    constructor(public service: TransactionApproveService) {}

}