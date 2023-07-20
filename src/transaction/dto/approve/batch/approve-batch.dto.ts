import { ApiProperty } from '@nestjs/swagger';

export class ApproveBatchDto {

  constructor(begin_num: number, limit_num: number, spender: string, token_address: string) {
    this.begin_num = begin_num;
    this.limit_num = limit_num;
    this.spender = spender;
    this.token_address = token_address;
  }

  @ApiProperty({ description: '起始编号', default: 1, example: 1 })
  readonly begin_num: number;

  @ApiProperty({ description: '从起始编号开始，选取几个账号', default: 1, example: 1 })
  readonly limit_num: number;

  @ApiProperty({ description: '使用人地址', example: '0xCACd778509Eb52E894172f69D0BB6EF8eeb32F48' })
  readonly spender: string;

  @ApiProperty({ description: '授权代币合约地址', example: '0xae8e93864f2A0E550Bc430EBA77A91eA6CC3EA7e' })
  readonly token_address: string;

}