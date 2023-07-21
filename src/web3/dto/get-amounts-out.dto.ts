import {ApiProperty} from '@nestjs/swagger';

export class GetAmountsOutDto {

    constructor(amount_in: number, tokens: string[], contract_address: string) {
        this.amount_in = amount_in;
        this.tokens = tokens;
        this.contract_address = contract_address;
    }

    @ApiProperty({description: '输入代币数量'})
    amount_in: number;

    @ApiProperty({
        description: '兑换路径',
        example: [
            "0x397b5b9066d72ed34e5b8f4c5336a998cb2b61d1",
            "0x546028cac67fb85b00260c004695d975a23b0515"
        ]
    })
    tokens: string[];

    @ApiProperty({
        description: 'contract_address',
        example: "0xCACd778509Eb52E894172f69D0BB6EF8eeb32F48"
    })
    contract_address: string;

}