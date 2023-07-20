import {ApiProperty} from '@nestjs/swagger';

export class SubsidyApproveBatchDto {

    @ApiProperty({description: '起始编号', default: 1, example: 1})
    readonly begin_num: number;

    @ApiProperty({description: '从起始编号开始，选取几个账号', default: 1, example: 1})
    readonly limit_num: number;

    @ApiProperty({description: '打款最大金额', default: 1, example: 1})
    readonly value_max: string;

    @ApiProperty({description: '打款最小金额', default: 1, example: 1})
    readonly value_min: string;

    @ApiProperty({description: '使用人地址', example: '0xCACd778509Eb52E894172f69D0BB6EF8eeb32F48'})
    readonly spender: string;

    @ApiProperty({
        description: '授权代币合约地址',
        example: ["0x397b5b9066d72ed34e5b8f4c5336a998cb2b61d1", "0x546028cac67fb85b00260c004695d975a23b0515"]
    })
    readonly token_addresses: string[];

}