import {ApiProperty} from '@nestjs/swagger';

export class CollectBatchDto {

    constructor(task_id: number, begin_num: number, limit_num: number, token_addresses: string[]) {
        this.task_id = task_id;
        this.begin_num = begin_num;
        this.limit_num = limit_num;
        this.token_addresses = token_addresses;
    }

    @ApiProperty({description: '任务编号', example: 1})
    readonly task_id: number;

    @ApiProperty({description: '起始编号', example: 1})
    readonly begin_num: number;

    @ApiProperty({description: '从起始编号开始，选取几个账号', example: 1})
    readonly limit_num: number;

    @ApiProperty({
        description: '归集代币合约地址（""表示归集gas）',
        example: [
            "0x397b5b9066d72ed34e5b8f4c5336a998cb2b61d1",
            "0x546028cac67fb85b00260c004695d975a23b0515",
            ""
        ]
    })
    readonly token_addresses: string[];

}