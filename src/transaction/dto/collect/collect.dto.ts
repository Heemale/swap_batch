import {ApiProperty} from '@nestjs/swagger';

export class CollectDto {

    constructor(task_id: number) {
        this.task_id = task_id;
    }

    @ApiProperty({description: '任务编号', example: 1})
    readonly task_id: number;

}