import {Controller, Post, Body} from '@nestjs/common';
import {ApiOperation, ApiTags} from '@nestjs/swagger';
import {UpdateIntervalDto} from "./dto/update-interval.dto";
import {WalletDao} from "./wallet.dao";
import {WalletService} from "./wallet.service";
import {Crud, CrudController} from "@nestjsx/crud";
import {WalletEntity} from "./entities/wallet.entity";

@Crud({
    model: {
        type: WalletEntity,
    },
    query: {
        exclude: ['id'], // fix https://github.com/nestjsx/crud/issues/788
        join: {
            admin: {
                eager: true, // 使用 eager 加载关联数据
                exclude: ['id'], // fix https://github.com/nestjsx/crud/issues/788
            },
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
@ApiTags('钱包')
@Controller('wallets')
export class WalletController implements CrudController<WalletEntity> {

    constructor(
        public service: WalletService,
        private readonly walletDao: WalletDao
    ) {
    }

    @ApiOperation({summary: '批量更新间隔时间'})
    @Post('interval')
    update_interval(@Body() updateIntervalDto: UpdateIntervalDto) {
        return this.walletDao.update_interval(updateIntervalDto);
    }

}
