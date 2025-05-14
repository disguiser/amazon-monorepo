import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity({ name: 'products' }) // 指定表名为 'products'
export class Product {
  @PrimaryGeneratedColumn('uuid') // 使用 UUID 作为主键
  id: string;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true }) // 描述可以为空
  description: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 }) // 价格，精确到两位小数
  price: number;

  @Column({ type: 'timestamp with time zone', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'timestamp with time zone', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
} 