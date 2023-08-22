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
    query: {
        exclude: ['id'], // fix https://github.com/nestjsx/crud/issues/788
        join: {
            wallet: {
                eager: true, // 使用 eager 加载关联数据
                exclude: ['id'], // fix https://github.com/nestjsx/crud/issues/788
            },
            "wallet.task": {
                eager: true, // 使用 eager 加载关联数据
                exclude: ['id'], // fix https://github.com/nestjsx/crud/issues/788
            },
        },
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