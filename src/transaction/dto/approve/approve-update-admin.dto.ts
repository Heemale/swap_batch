import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { StatusEnum } from '../../../common/enum';

export class ApproveUpdateAdminDto {

  constructor(id: number, status: StatusEnum, remark: string, hash: string) {
    this.id = id;
    this.status = status;
    this.remark = remark;
    this.hash = hash;
  }

  @ApiProperty({ description: 'ID' })
  id: number;

  @ApiProperty({ description: '打款状态' })
  status: StatusEnum;

  @ApiProperty({ description: '备注' })
  remark: string;

  @ApiProperty({ description: 'hash' })
  hash: string;

}