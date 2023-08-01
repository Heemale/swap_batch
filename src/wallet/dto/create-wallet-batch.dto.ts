import {ApiPropertyOptional} from '@nestjs/swagger';

export class CreateWalletBatchDto {

    @ApiPropertyOptional({description: '管理员ID', example: 10})
    readonly admin_id: number;

    @ApiPropertyOptional({description: '创建数量', example: 10})
    readonly counts: number;

}
