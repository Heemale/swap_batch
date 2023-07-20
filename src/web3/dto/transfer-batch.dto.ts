import { ApiProperty } from '@nestjs/swagger';

export class TransferBatchDto {

  constructor(accounts: string[], amounts: string[], token: string) {
    this.accounts = accounts;
    this.amounts = amounts;
    this.token = token;
  }

  @ApiProperty({ description: '接收人' })
  accounts: string[];

  @ApiProperty({ description: '转账金额' })
  amounts: string[];

  @ApiProperty({ description: '合约地址' })
  token: string;

}