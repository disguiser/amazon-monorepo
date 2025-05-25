import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProductsModule } from './products/products.module';
import { SpiderModule } from './spider/spider.module';
import { ScheduleModule } from '@nestjs/schedule';
import { DailySpiderService } from './spider/daily-spider.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const dbPort = configService.get<string>('DB_PORT');
        if (dbPort === undefined) {
          throw new Error('DB_PORT environment variable is not set.');
        }
        return {
          type: 'postgres',
          host: configService.get<string>('DB_HOST'),
          port: parseInt(dbPort, 10),
          username: configService.get<string>('DB_USERNAME'),
          password: configService.get<string>('DB_PASSWORD'),
          database: configService.get<string>('DB_DATABASE'),
          entities: [__dirname + '/**/*.entity{.ts,.js}'],
          synchronize: configService.get<string>('NODE_ENV') !== 'production',
        };
      },
      inject: [ConfigService],
    }),
    ProductsModule,
    SpiderModule,
    ScheduleModule.forRoot(),
  ],
  controllers: [AppController],
  providers: [AppService, DailySpiderService],
})
export class AppModule {}
