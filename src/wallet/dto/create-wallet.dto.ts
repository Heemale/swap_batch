import {ApiPropertyOptional} from '@nestjs/swagger';

export class CreateWalletDto {

    constructor(admin_special_num: number, admin_id: number, task: number, address: string, private_key: string, mnemonic: string, createtime: number) {
        this.admin_special_num = admin_special_num;
        this.admin_id = admin_id;
        this.task = task;
        this.address = address;
        this.private_key = private_key;
        this.mnemonic = mnemonic;
        this.createtime = createtime;
    }

    @ApiPropertyOptional({description: '编号'})
    readonly admin_special_num: number;

    @ApiPropertyOptional({description: '管理员ID'})
    readonly admin_id: number;

    @ApiPropertyOptional({description: '来源任务ID'})
    readonly task: number;

    @ApiPropertyOptional({description: '地址'})
    readonly address: string;

    @ApiPropertyOptional({description: '私钥'})
    readonly private_key: string;

    @ApiPropertyOptional({description: '助记词'})
    readonly mnemonic: string;

    @ApiPropertyOptional({description: '创建时间'})
    readonly createtime: number;

}
