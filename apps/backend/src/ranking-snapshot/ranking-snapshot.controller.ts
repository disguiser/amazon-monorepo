import { Controller, Get, Param } from '@nestjs/common';
import { RankingSnapshotService } from './ranking-snapshot.service';

@Controller('ranking-snapshot')
export class RankingSnapshotController {
  constructor(private readonly rankingSnapshotService: RankingSnapshotService) {}

  @Get(':date')
  findOne(@Param('date') date: string) {
    return this.rankingSnapshotService.findOne(new Date(+date));
  }
}
