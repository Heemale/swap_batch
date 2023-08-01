import {ApiProperty} from '@nestjs/swagger';
import {StatusEnum} from '../../../common/enum';

export class SwapUpdateDto {

    constructor(id: number, status: StatusEnum, remark: string, amount_out: string, hash: string, failed: boolean) {
        this.id = id;
        this.status = status;
        this.remark = remark;
        this.amount_out = amount_out;
        this.hash = hash;
        this.failed = failed;
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

    @ApiProperty({description: '是否记录失败次数'})
    failed: boolean;

}