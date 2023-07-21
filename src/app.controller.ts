import {Body, Controller, Post} from '@nestjs/common';
import {ApiOperation, ApiTags} from "@nestjs/swagger";
import {GetAmountsOutDto} from "./web3/dto/get-amounts-out.dto";
import {get_token_price} from "./web3";

@ApiTags('查询')
@Controller()
export class AppController {

    @ApiOperation({summary: '获取市值'})
    @Post('/market/price')
    async approve_admin_batch(@Body() getAmountsOutDto: GetAmountsOutDto): Promise<string> {
        return await get_token_price(getAmountsOutDto);
    }

}
