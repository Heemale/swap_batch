import { ApiProperty } from '@nestjs/swagger';

export class TransactionDto {

  constructor(from: string, to: string, value: string, data: string, private_key: string, nonce: bigint) {
    this.from = from;
    this.to = to;
    this.value = value;
    this.data = data;
    this.private_key = private_key;
    this.nonce = nonce;
  }

  @ApiProperty({ description: 'from' })
  from: string;

  @ApiProperty({ description: 'to' })
  to: string;

  @ApiProperty({ description: '金额' })
  value: string;

  @ApiProperty({ description: 'data' })
  data: string;

  @ApiProperty({ description: 'private_key' })
  private_key: string;

  @ApiProperty({ description: 'nonce' })
  nonce: bigint;

}