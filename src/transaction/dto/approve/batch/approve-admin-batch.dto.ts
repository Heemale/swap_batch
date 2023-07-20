import {ApiProperty} from '@nestjs/swagger';

export class ApproveAdminBatchDto {

    constructor(spender: string, token_addresses: string[]) {
        this.spender = spender;
        this.token_addresses = token_addresses;
    }

    @ApiProperty({description: '使用人地址', example: '0x5f3148430B7c3a79e2F7b1aaBAaa23591e21BEFB'})
    spender: string;

    @ApiProperty({
        description: '授权代币合约地址',
        example: ["0x397b5b9066d72ed34e5b8f4c5336a998cb2b61d1", "0x546028cac67fb85b00260c004695d975a23b0515"]
    })
    token_addresses: string[];

}