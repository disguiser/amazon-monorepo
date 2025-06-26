import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { SpiderService } from './spider.service';

@Injectable()
export class DailySpiderService {
  constructor(private readonly spiderService: SpiderService) {}
  
  // private readonly logger = new Logger(DailySpiderService.name);

  // 或者指定具体时间（例如每天凌晨3点15分）
  @Cron('14 17 * * *')
  async handleCustomTimeTask() {
    await this.spiderService.daily();
  }
}
