import { ApiProperty } from '@nestjs/swagger';

export class AllowanceDto {

  constructor(owner: string, spender: string, contract_address: string) {
    this.owner = owner;
    this.spender = spender;
    this.contract_address = contract_address;
  }

  @ApiProperty({ description: 'owner', example: '0xC9065454cB82112fDE41d5728d096A96053DfA5c' })
  owner: string;

  @ApiProperty({ description: 'spender', example: '0x399Fabce1b91C06700579491Aa9fD9b12e2cD29b' })
  spender: string;

  @ApiProperty({ description: 'erc20_address', example: '0x0F633B364208436561F2e71f3E77f0412a1a8ee5' })
  contract_address: string;

}