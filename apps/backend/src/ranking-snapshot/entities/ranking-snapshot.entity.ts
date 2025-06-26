import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { RankingItem } from '@amazon-monorepo/shared';

@Entity()
export class RankingSnapshot {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'date', default: () => 'CURRENT_DATE' })
  rankingDate: Date;

  @Column({ type: 'jsonb' })
  data: RankingItem[];
}