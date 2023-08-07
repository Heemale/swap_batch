import {ApiProperty} from '@nestjs/swagger';
import {StatusEnum} from '../../../common/enum';

export class SubsidyUpdateDto {

    constructor(id: number, amount: string, status: StatusEnum, remark: string, hash: string) {
        this.id = id;
        this.amount = amount;
        this.status = status;
        this.remark = remark;
        this.hash = hash;
    }

    @ApiProperty({description: '订单ID'})
    id: number;

    @ApiProperty({description: '打款数量'})
    amount: string;

    @ApiProperty({description: '打款状态'})
    status: StatusEnum;

    @ApiProperty({description: '备注'})
    remark: string;

    @ApiProperty({description: 'hash'})
    hash: string;

}