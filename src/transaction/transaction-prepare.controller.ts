import {Controller} from "@nestjs/common";
import {Crud, CrudController} from "@nestjsx/crud";
import {ApiTags} from "@nestjs/swagger";
import {TransactionPrepareEntity} from "./entities/transaction-prepare.entity";
import {TransactionPrepareService} from "./transaction-prepare.service";

@Crud({
    model: {
        type: TransactionPrepareEntity,
    },
})
@ApiTags('准备记录')
@Controller("transaction/prepare")
export class TransactionPrepareController implements CrudController<TransactionPrepareEntity> {
    constructor(public service: TransactionPrepareService) {
    }
}