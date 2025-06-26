import { Module } from '@nestjs/common';
import { RankingSnapshotService } from './ranking-snapshot.service';
import { RankingSnapshotController } from './ranking-snapshot.controller';
import { RankingSnapshot } from './entities/ranking-snapshot.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([RankingSnapshot])],
  controllers: [RankingSnapshotController],
  providers: [RankingSnapshotService],
})
export class RankingSnapshotModule {}
