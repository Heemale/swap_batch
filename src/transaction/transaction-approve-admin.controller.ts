import {Controller} from "@nestjs/common";
import {Crud, CrudController} from "@nestjsx/crud";
import {ApiTags} from "@nestjs/swagger";
import {TransactionApproveAdminEntity} from "./entities/transaction-approve-admin.entity";
import {TransactionApproveAdminService} from "./transaction-approve-admin.service";

@Crud({
    model: {
        type: TransactionApproveAdminEntity,
    },
    query: {
        exclude: ['id'], // fix https://github.com/nestjsx/crud/issues/788
        join: {
            admin: {
                eager: true, // 使用 eager 加载关联数据
                exclude: ['id'], // fix https://github.com/nestjsx/crud/issues/788
            },
        },
    },
})
@ApiTags('管理员授权记录')
@Controller("transaction/approve-admin")
export class TransactionApproveAdminController implements CrudController<TransactionApproveAdminEntity> {
    constructor(public service: TransactionApproveAdminService) {
    }
}