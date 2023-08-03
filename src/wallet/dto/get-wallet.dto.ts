import {ApiPropertyOptional} from '@nestjs/swagger';

export class GetWalletDto {

    constructor(admin_id: number, begin_num: number, limit_num: number) {
        this.admin_id = admin_id;
        this.begin_num = begin_num;
        this.limit_num = limit_num;
    }

    @ApiPropertyOptional({description: '管理员ID'})
    readonly admin_id: number;

    @ApiPropertyOptional({description: '选择钱包起始ID'})
    readonly begin_num: number;

    @ApiPropertyOptional({description: '选择钱包数量'})
    readonly limit_num: number;

}
