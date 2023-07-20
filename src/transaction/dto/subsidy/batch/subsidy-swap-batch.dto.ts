import {ApiProperty} from '@nestjs/swagger';
import {formatTimestamp, timestamp} from "../../../../common/util";

export class SubsidySwapBatchDto {

    @ApiProperty({description: '起始编号', default: 1, example: 1})
    readonly begin_num: number;

    @ApiProperty({description: '从起始编号开始，选取几个账号', default: 1, example: 1})
    readonly limit_num: number;

    @ApiProperty({description: '打款最大金额', default: 1, example: 1})
    readonly value_max: string;

    @ApiProperty({description: '打款最小金额', default: 1, example: 1})
    readonly value_min: string;

    @ApiProperty({description: '统一打款币种，填写合约地址', default: '', example: ''})
    readonly token_address: string;

    @ApiProperty({description: '是否一次性交易:0=否,1=是', default: 1, example: 1})
    readonly disposable_switch: number;

    @ApiProperty({description: '是否密集交易:0=否,1=是', default: 0, example: 0})
    readonly dense_switch: number;

    @ApiProperty({description: '是否区间交易:0=否,1=是', default: 1, example: 1})
    readonly range_switch: number;

    @ApiProperty({description: '区间起始时间', example: formatTimestamp(timestamp())})
    readonly rangestarttime: string;

    @ApiProperty({description: '区间结束时间', example: formatTimestamp(timestamp() + 3600 * 4)})
    readonly rangeendtime: string;

    @ApiProperty({type: 'decimal', description: '转入的token数量（计算市值）', default: 40, example: 40})
    readonly token_in_amount: number;

    @ApiProperty({type: 'decimal', description: '交易最大值', default: 40, example: 40})
    readonly max_num: number;

    @ApiProperty({type: 'decimal', description: '交易最小值', default: 20, example: 20})
    readonly min_num: number;

    @ApiProperty({description: '市值最大值', default: 1, example: 1})
    readonly max_price: number;

    @ApiProperty({description: '市值最小值', default: 1, example: 1})
    readonly min_price: number;

    @ApiProperty({description: '转入的token', example: '0xae8e93864f2A0E550Bc430EBA77A91eA6CC3EA7e'})
    readonly token_in: string;

    @ApiProperty({description: '转出的token', example: '0xa4f7F4E0204E769aA0A998bc8C7f2B17dF6c188F'})
    readonly token_out: string;

    @ApiProperty({description: '循环次数', example: 1})
    readonly times: number;

}