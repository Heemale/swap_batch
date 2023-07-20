import { ApiPropertyOptional } from '@nestjs/swagger';

export class CreateAddressDto {

  @ApiPropertyOptional({ description: '创建数量', default: 10, example: 10 })
  readonly counts: number;

}
