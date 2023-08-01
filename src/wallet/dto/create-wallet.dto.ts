import {ApiPropertyOptional} from '@nestjs/swagger';

export class CreateWalletDto {

    constructor(admin_id: number, address: string, private_key: string, mnemonic: string, createtime: number) {
        this.admin_id = admin_id;
        this.address = address;
        this.private_key = private_key;
        this.mnemonic = mnemonic;
        this.createtime = createtime;
    }

    @ApiPropertyOptional({description: '管理员ID'})
    readonly admin_id: number;

    @ApiPropertyOptional({description: '地址'})
    readonly address: string;

    @ApiPropertyOptional({description: '私钥'})
    readonly private_key: string;

    @ApiPropertyOptional({description: '助记词'})
    readonly mnemonic: string;

    @ApiPropertyOptional({description: '创建时间'})
    readonly createtime: number;

}
