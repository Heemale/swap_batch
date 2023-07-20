import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { StatusEnum } from '../../../common/enum';

export class CollectUpdateDto {

  constructor(id: number, status: StatusEnum, remark: string, hash: string, amount: string) {
    this.id = id;
    this.status = status;
    this.remark = remark;
    this.hash = hash;
    this.amount = amount;
  }

  @ApiProperty({ description: 'ID' })
  id: number;

  @ApiProperty({ description: '打款状态' })
  status: StatusEnum;

  @ApiProperty({ description: '备注' })
  remark: string;

  @ApiProperty({ description: 'hash' })
  hash: string;

  @ApiProperty({ description: '金额' })
  amount: string;

}