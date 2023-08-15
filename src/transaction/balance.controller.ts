import {Body, Controller, Post} from "@nestjs/common";
import {Crud, CrudController} from "@nestjsx/crud";
import {ApiOperation, ApiTags} from "@nestjs/swagger";
import {BalanceEntity} from "./entities/balance.entity";
import {BalanceService} from "./balance.service";
import {BalanceStatisticalDto} from "./dto/balance/balance-statistical.dto";

@Crud({
    model: {
        type: BalanceEntity,
    },
})
@ApiTags('余额')
@Controller("balance")
export class BalanceController implements CrudController<BalanceEntity> {

    constructor(public service: BalanceService) {
    }

    @ApiOperation({summary: '统计余额'})
    @Post('statistical')
    statistical_balance(@Body() balanceStatisticalDto: BalanceStatisticalDto) {
        this.service.statistical_balance(balanceStatisticalDto);
        return "已提交";
    }

}