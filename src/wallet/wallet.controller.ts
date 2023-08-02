import {Controller, Post, Body} from '@nestjs/common';
import {CreateWalletBatchDto} from './dto/create-wallet-batch.dto';
import {ApiOperation, ApiTags} from '@nestjs/swagger';
import {UpdateIntervalDto} from "./dto/update-interval.dto";
import {WalletDao} from "./dao/wallet.dao";
import {WalletService} from "./wallet.service";

@ApiTags('钱包')
@Controller('wallet')
export class WalletController {

    constructor(
        private readonly walletService: WalletService,
        private readonly walletDao: WalletDao
    ) {
    }


    @ApiOperation({summary: '创建钱包'})
    @Post()
    create(@Body() createWalletDto: CreateWalletBatchDto) {
        return this.walletService.create(createWalletDto);
    }


    @ApiOperation({summary: '批量更新间隔时间'})
    @Post('interval')
    update_interval(@Body() updateIntervalDto: UpdateIntervalDto) {
        return this.walletDao.update_interval(updateIntervalDto);
    }

}
