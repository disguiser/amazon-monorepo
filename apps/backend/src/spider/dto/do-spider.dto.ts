import { IsArray, IsBoolean, IsNumber, IsString } from 'class-validator';
import { IDoSpiderDto } from '@amazon-monorepo/shared';

export class DoSpiderDto implements IDoSpiderDto {
  @IsArray()
  @IsString({ each: true })
  urls: string[];

  @IsBoolean()
  headless: boolean;

  @IsNumber()
  sleepSecond: number;
}
