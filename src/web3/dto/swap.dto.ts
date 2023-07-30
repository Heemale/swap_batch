import { ApiProperty } from '@nestjs/swagger';

export class SwapDto {

  constructor(amountIn: string, amountOutMin: number, path: string[], to: string, deadline: number, contract_address: string) {
    this.amountIn = amountIn;
    this.amountOutMin = amountOutMin;
    this.path = path;
    this.to = to;
    this.deadline = deadline;
    this.contract_address = contract_address;
  }

  @ApiProperty({ description: '转入数量', example: 20 })
  amountIn: string;

  @ApiProperty({ description: '允许最小转出数量', example: 0 })
  amountOutMin: number;

  @ApiProperty({ description: '要交换的两种Token，第一个元素是输入Token，最后一个元素是输出Token', example: '' })
  path: string[];

  @ApiProperty({ description: '接收人', example: '' })
  to: string;

  @ApiProperty({ description: '截止交易的时间戳' })
  deadline: number;

  @ApiProperty({ description: 'contract_address', example: '0x0F633B364208436561F2e71f3E77f0412a1a8ee5' })
  contract_address: string;

}