import { ApiProperty } from '@nestjs/swagger';

export class BalanceCreateDto {

  constructor(wallet: number, token_address: string, balance: string, createtime: number, updatetime: number) {
    this.wallet = wallet;
    this.token_address = token_address;
    this.balance = balance;
    this.createtime = createtime;
    this.updatetime = updatetime;
  }

  @ApiProperty({ description: '钱包ID' })
  wallet: number;

  @ApiProperty({ description: 'token地址' })
  token_address: string;

  @ApiProperty({ description: '余额' })
  balance : string

  @ApiProperty({ description: '创建时间', type: 'bigint' })
  createtime: number;

  @ApiProperty({ description: '更新时间', type: 'bigint' })
  updatetime: number;
}