import { ApiProperty } from '@nestjs/swagger';

export class ApproveDto {

  constructor(spender: string, amount: string, contract_address: string) {
    this.spender = spender;
    this.amount = amount;
    this.contract_address = contract_address;
  }

  @ApiProperty({ description: 'spender', example: '0x399Fabce1b91C06700579491Aa9fD9b12e2cD29b' })
  spender: string;

  @ApiProperty({ description: '授权额度', example: "100" })
  amount: string;

  @ApiProperty({ description: 'contract_address', example: '0x0F633B364208436561F2e71f3E77f0412a1a8ee5' })
  contract_address: string;

}