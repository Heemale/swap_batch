import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateIntervalDto {

  @ApiPropertyOptional({ description: '间隔的最大值', default: 180, example: 180 })
  readonly interval_max: number;

  @ApiPropertyOptional({ description: '间隔的最小值', default: 120, example: 120 })
  readonly interval_min: number;

}

