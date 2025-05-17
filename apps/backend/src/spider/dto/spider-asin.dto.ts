import { IsBoolean, IsString } from 'class-validator';

export class SpiderAsinDto {
  @IsString()
  url: string;

  @IsBoolean()
  headless: boolean;
}
