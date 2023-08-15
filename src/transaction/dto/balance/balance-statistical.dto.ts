import {ApiProperty} from '@nestjs/swagger';

export class BalanceStatisticalDto {

    constructor(token_addresses: string[]) {
        this.token_addresses = token_addresses;
    }

    @ApiProperty({description: 'token地址', example: [""]})
    token_addresses: string[];

}