import { ApiProperty } from '@nestjs/swagger';

export class CreatePrepareDto {

    constructor(task: number, begin_num: number, limit_num: number, token_address: string, spender: string, admin_id: number, admin_special_num: number) {
        this.task = task;
        this.begin_num = begin_num;
        this.limit_num = limit_num;
        this.token_address = token_address;
        this.spender = spender;
        this.admin_id = admin_id;
        this.admin_special_num = admin_special_num;
    }

    @ApiProperty({ description: '任务ID' })
    task: number;

    @ApiProperty({ description: '选择钱包起始编号' })
    begin_num:number;

    @ApiProperty({ description: '选择钱包数量' })
    limit_num:number;

    @ApiProperty({ description: 'token地址' })
    token_address: string;

    @ApiProperty({ description: '使用人地址' })
    spender: string;

    @ApiProperty({ description: 'admin_id' })
    admin_id: number;

    @ApiProperty({ description: 'admin_special_num' })
    admin_special_num: number;

}