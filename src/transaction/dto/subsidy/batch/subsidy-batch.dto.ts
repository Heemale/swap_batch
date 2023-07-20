import { ApiProperty } from '@nestjs/swagger';

export class SubsidyBatchDto {

  constructor(begin_num: number, limit_num: number, value_max: string, value_min: string, token_address: string) {
    this.begin_num = begin_num;
    this.limit_num = limit_num;
    this.value_max = value_max;
    this.value_min = value_min;
    this.token_address = token_address;
  }

  @ApiProperty({ description: '起始编号', default: 1, example: 1 })
  readonly begin_num: number;

  @ApiProperty({ description: '从起始编号开始，选取几个账号', default: 1, example: 1 })
  readonly limit_num: number;

  @ApiProperty({description: '打款最大金额', default: 1, example: 1 })
  readonly value_max: string;

  @ApiProperty({description: '打款最小金额', default: 1, example: 1 })
  readonly value_min: string;

  @ApiProperty({ description: '统一打款币种，填写合约地址，默认是omp', default: '', example: '' })
  readonly token_address: string;

}