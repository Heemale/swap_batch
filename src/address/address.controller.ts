import {Controller, Post, Body} from '@nestjs/common';
import {AddressService} from './address.service';
import {CreateAddressDto} from './dto/create-address.dto';
import {ApiOperation, ApiTags} from '@nestjs/swagger';
import {UpdateIntervalDto} from "./dto/update-interval.dto";

@ApiTags('钱包')
@Controller('address')
export class AddressController {

    constructor(
        private readonly addressService: AddressService
    ) {
    }
    

    @ApiOperation({summary: '创建钱包'})
    @Post()
    create(@Body() createAddressDto: CreateAddressDto) {
        return this.addressService.create(createAddressDto);
    }


    @ApiOperation({summary: '批量更新间隔时间'})
    @Post('interval')
    update_interval(@Body() updateIntervalDto: UpdateIntervalDto) {
        return this.addressService.update_interval(updateIntervalDto);
    }

}
