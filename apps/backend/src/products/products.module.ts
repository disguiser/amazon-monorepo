import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { Product } from './entities/product.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Product])], // 导入 Product 实体，使其可以在 ProductsService 中注入 ProductRepository
  controllers: [ProductsController],
  providers: [ProductsService],
})
export class ProductsModule {} 