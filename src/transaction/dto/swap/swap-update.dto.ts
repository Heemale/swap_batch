import {ApiProperty, ApiPropertyOptional} from '@nestjs/swagger';
import {StatusEnum} from '../../../common/enum';

export class SwapUpdateDto {

    constructor(id: number, status: StatusEnum, remark: string, amount_out: string, swap_hash: string) {
        this.id = id;
        this.status = status;
        this.remark = remark;
        this.amount_out = amount_out;
        this.hash = swap_hash;
    }

    @ApiProperty({description: 'ID'})
    id: number;

    @ApiProperty({description: '打款状态'})
    status: StatusEnum;

    @ApiProperty({description: '备注'})
    remark: string;

    @ApiProperty({description: 'swap转出金额'})
    amount_out: string;

    @ApiProperty({description: '交易hash'})
    hash: string;

}