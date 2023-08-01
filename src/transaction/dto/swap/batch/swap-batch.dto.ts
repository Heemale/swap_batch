import {ApiProperty, ApiPropertyOptional} from '@nestjs/swagger';
import {format_timestamp, timestamp} from "../../../../common/util";

export class SwapBatchDto {

    constructor(disposable_switch: number, dense_switch: number, range_switch: number, rangestarttime: string, rangeendtime: string, begin_num: number, limit_num: number, max_num: number, min_num: number, token_in: string, token_out: string, times: number, task_id: number) {
        this.disposable_switch = disposable_switch;
        this.dense_switch = dense_switch;
        this.range_switch = range_switch;
        this.rangestarttime = rangestarttime;
        this.rangeendtime = rangeendtime;
        this.begin_num = begin_num;
        this.limit_num = limit_num;
        this.max_num = max_num;
        this.min_num = min_num;
        this.token_in = token_in;
        this.token_out = token_out;
        this.times = times;
        this.task_id = task_id;
    }

    @ApiProperty({description: '是否一次性交易:0=否,1=是', default: 1, example: 1})
    readonly disposable_switch: number;

    @ApiProperty({description: '是否密集交易:0=否,1=是', default: 0, example: 0})
    readonly dense_switch: number;

    @ApiProperty({description: '是否区间交易:0=否,1=是', default: 1, example: 1})
    readonly range_switch: number;

    @ApiProperty({description: '区间起始时间', example: format_timestamp(timestamp())})
    readonly rangestarttime: string;

    @ApiProperty({description: '区间结束时间', example: format_timestamp(timestamp() + 3600 * 4)})
    readonly rangeendtime: string;

    @ApiProperty({description: '起始编号', default: 1, example: 1})
    readonly begin_num: number;

    @ApiProperty({description: '从起始编号开始，选取几个账号', default: 1, example: 1})
    readonly limit_num: number;

    @ApiProperty({type: 'decimal', description: '交易最大值', default: 40, example: 40})
    readonly max_num: number;

    @ApiProperty({type: 'decimal', description: '交易最小值', default: 20, example: 20})
    readonly min_num: number;

    @ApiProperty({description: '转入的token', example: '0xae8e93864f2A0E550Bc430EBA77A91eA6CC3EA7e'})
    readonly token_in: string;

    @ApiProperty({description: '转出的token', example: '0xa4f7F4E0204E769aA0A998bc8C7f2B17dF6c188F'})
    readonly token_out: string;

    @ApiProperty({description: '循环次数', example: 1})
    readonly times: number;

    @ApiProperty({description: 'swap任务ID', example: null})
    readonly task_id: number;

}