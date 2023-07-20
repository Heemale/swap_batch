import {ApiProperty, ApiPropertyOptional} from '@nestjs/swagger';

export class SubsidyCreateDto {

    constructor(order_num: string, begin_num: number, limit_num: number, value_max: string, value_min: string, token_address: string, createtime: number) {
        this.order_num = order_num;
        this.begin_num = begin_num;
        this.limit_num = limit_num;
        this.value_max = value_max;
        this.value_min = value_min;
        this.token_address = token_address;
        this.createtime = createtime;
    }

    @ApiProperty({description: '订单号'})
    order_num: string;

    @ApiProperty({description: '起始编号'})
    begin_num: number;

    @ApiProperty({description: '选取数量'})
    limit_num: number;

    @ApiProperty({description: '打款最大金额'})
    value_max: string;

    @ApiProperty({description: '打款最小金额'})
    value_min: string;

    @ApiProperty({description: 'token地址'})
    token_address: string;

    @ApiPropertyOptional({description: '创建时间', type: 'bigint'})
    createtime: number;

}