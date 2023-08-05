import { ApiProperty } from '@nestjs/swagger';

export class SwapCreateDto {

  constructor( wallet: number, task: number, times: number, interval_num: number, executetime: number, rangestarttime: number, rangeendtime: number, amount_in: number, token_in: string, token_out: string, createtime: number) {
    this.wallet = wallet;
    this.task = task;
    this.times = times;
    this.interval_num = interval_num;
    this.executetime = executetime;
    this.rangestarttime = rangestarttime;
    this.rangeendtime = rangeendtime;
    this.amount_in = amount_in;
    this.token_in = token_in;
    this.token_out = token_out;
    this.createtime = createtime;
  }

  @ApiProperty({ description: '钱包ID' })
  wallet: number;

  @ApiProperty({ description: 'swap任务ID' })
  task: number;

  @ApiProperty({ description: '第几次循环' })
  times: number;

  @ApiProperty({ description: '间隔时间' })
  interval_num: number;

  @ApiProperty({ description: '执行时间', type: 'bigint' })
  executetime: number;

  @ApiProperty({ description: '区间起始时间', type: 'bigint' })
  rangestarttime: number;

  @ApiProperty({ description: '区间结束时间', type: 'bigint' })
  rangeendtime: number;

  @ApiProperty({ description: '转入token数量' })
  amount_in: number;

  @ApiProperty({ description: '转入token' })
  token_in: string;

  @ApiProperty({ description: '转出token' })
  token_out: string;

  @ApiProperty({ description: '创建时间', type: 'bigint' })
  createtime: number;
}