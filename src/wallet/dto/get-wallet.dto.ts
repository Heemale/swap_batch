import {ApiPropertyOptional} from '@nestjs/swagger';

export class GetWalletDto {

    @ApiPropertyOptional({description: '管理员ID'})
    readonly admin_id: number;

    @ApiPropertyOptional({description: '选择钱包起始ID'})
    readonly begin_num: number;

    @ApiPropertyOptional({description: '选择钱包数量'})
    readonly limit_num: number;

}
