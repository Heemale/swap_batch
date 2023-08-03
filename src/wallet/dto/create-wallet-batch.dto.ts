import {ApiPropertyOptional} from '@nestjs/swagger';

export class CreateWalletBatchDto {

    constructor(admin_id: number, task_id: number, counts: number) {
        this.admin_id = admin_id;
        this.task_id = task_id;
        this.counts = counts;
    }

    @ApiPropertyOptional({description: '管理员ID', example: 10})
    readonly admin_id: number;

    @ApiPropertyOptional({description: '来源任务ID', example: 10})
    readonly task_id: number;

    @ApiPropertyOptional({description: '创建数量', example: 10})
    readonly counts: number;

}
