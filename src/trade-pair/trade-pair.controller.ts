import { Controller } from "@nestjs/common";
import { Crud, CrudController } from "@nestjsx/crud";
import {ApiTags} from "@nestjs/swagger";
import {TradePairEntity} from "./entities/trade-pair.entity";
import {TradePairService} from "./trade-pair.service";

@Crud({
    model: {
        type: TradePairEntity,
    },
})
@ApiTags('交易对')
@Controller("trade-pairs")
export class TradePairController implements CrudController<TradePairEntity> {
    constructor(public service: TradePairService) {}
}