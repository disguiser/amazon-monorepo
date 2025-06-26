import { Module } from '@nestjs/common';
import { SpiderService } from './spider.service';
import { SpiderController } from './spider.controller';
import { RankingSnapshot } from '../ranking-snapshot/entities/ranking-snapshot.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DailySpiderService } from './daily-spider.service';

@Module({
  imports: [TypeOrmModule.forFeature([RankingSnapshot])],
  controllers: [SpiderController],
  providers: [SpiderService, DailySpiderService],
})
export class SpiderModule {}
