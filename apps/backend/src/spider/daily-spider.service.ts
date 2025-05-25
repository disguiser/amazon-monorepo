import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';

@Injectable()
export class DailySpiderService {
  private readonly logger = new Logger(DailySpiderService.name);

  // 或者指定具体时间（例如每天凌晨3点15分）
  @Cron('15 16 * * *')
  handleCustomTimeTask() {
    this.logger.log('Running task');
  }
}
