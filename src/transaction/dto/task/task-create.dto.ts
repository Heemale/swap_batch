import {ApiProperty} from '@nestjs/swagger';

export class TaskCreateDto {

    constructor(
        swap_switch: number,
        disposable_switch: number,
        dense_switch: number,
        range_switch: number,
        begin_num: number,
        limit_num: number,
        max_num: number,
        min_num: number,
        max_price: string,
        min_price: string,
        token_in: string,
        token_out: string,
        times: number,
        rangestarttime: number,
        rangeendtime: number,
        createtime: number
    ) {
        this.swap_switch = swap_switch;
        this.disposable_switch = disposable_switch;
        this.dense_switch = dense_switch;
        this.range_switch = range_switch;
        this.begin_num = begin_num;
        this.limit_num = limit_num;
        this.max_num = max_num;
        this.min_num = min_num;
        this.max_price = max_price;
        this.min_price = min_price;
        this.token_in = token_in;
        this.token_out = token_out;
        this.times = times;
        this.rangestarttime = rangestarttime;
        this.rangeendtime = rangeendtime;
        this.createtime = createtime;
    }

    @ApiProperty({description: '任务是否启动', default: 0, example: 0})
    swap_switch: number;

    @ApiProperty({description: '是否一次性交易', default: 0, example: 0})
    disposable_switch: number;

    @ApiProperty({description: '是否密集交易', default: 0, example: 0})
    dense_switch: number;

    @ApiProperty({description: '是否区间交易', default: 1, example: 1})
    range_switch: number;

    @ApiProperty({description: '起始编号', default: 1, example: 1})
    begin_num: number;

    @ApiProperty({description: '编号数量', default: 1, example: 1})
    limit_num: number;

    @ApiProperty({description: '交易最大值', default: 0, example: 0})
    max_num: number;

    @ApiProperty({description: '交易最小值', default: 0, example: 0})
    min_num: number;

    @ApiProperty({description: '市值最大值', default: 0, example: 0})
    max_price: string;

    @ApiProperty({description: '市值最小值', default: 0, example: 0})
    min_price: string;

    @ApiProperty({description: '转入的token', nullable: false})
    token_in: string;

    @ApiProperty({description: '转出的token', nullable: false})
    token_out: string;

    @ApiProperty({description: '循环次数', default: 1, nullable: false})
    times: number;

    @ApiProperty({description: '区间起始时间', type: 'bigint', default: null, nullable: true})
    rangestarttime: number;

    @ApiProperty({description: '区间结束时间', type: 'bigint', default: null, nullable: true})
    rangeendtime: number;

    @ApiProperty({description: '创建时间', type: 'bigint', default: 0})
    createtime: number;
}