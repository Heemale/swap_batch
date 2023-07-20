import { ApiProperty } from '@nestjs/swagger';

export class TransferDto {

  constructor(to: string, amount: string, contract_address: string) {
    this.to = to;
    this.amount = amount;
    this.contract_address = contract_address;
  }

  @ApiProperty({ description: '接收人' })
  to: string;

  @ApiProperty({ description: '转账金额' })
  amount: string;

  @ApiProperty({ description: '合约地址' })
  contract_address: string;

}