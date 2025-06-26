import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RankingSnapshot } from './entities/ranking-snapshot.entity';
import { Repository } from 'typeorm';

@Injectable()
export class RankingSnapshotService {
  constructor(
    @InjectRepository(RankingSnapshot)
    private readonly rankingRepository: Repository<RankingSnapshot>,
  ) {}

  async findOne(rankingDate: Date) {
    const ranking = await this.rankingRepository.findOneBy({ rankingDate })
    return ranking ? ranking.data : [];
  }
}
