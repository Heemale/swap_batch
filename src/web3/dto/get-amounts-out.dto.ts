import { ApiProperty } from '@nestjs/swagger';

export class GetAmountsOutDto {

    constructor(amount_in: number, tokens: string[], contract_address: string) {
        this.amount_in = amount_in;
        this.tokens = tokens;
        this.contract_address = contract_address;
    }

    @ApiProperty({ description: '输入代币数量' })
    amount_in: number;

    @ApiProperty({ description: '授权额度' })
    tokens: string[];

    @ApiProperty({ description: 'contract_address' })
    contract_address: string;

}