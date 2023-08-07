import {ApiPropertyOptional} from '@nestjs/swagger';

export class GetWalletDto {

    constructor(begin_num: number, limit_num: number) {
        this.begin_num = begin_num;
        this.limit_num = limit_num;
    }

    @ApiPropertyOptional({description: '选择钱包起始ID'})
    readonly begin_num: number;

    @ApiPropertyOptional({description: '选择钱包数量'})
    readonly limit_num: number;

}
