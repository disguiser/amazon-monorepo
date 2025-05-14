import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, DeepPartial } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { ProductsService } from './products.service';
import { Product } from './entities/product.entity';

// 定义一个更通用的模拟 Repository 类型
type MockRepository<T extends object> = Pick<
  Repository<T>,
  keyof Repository<T>
> & {
  [K in keyof Repository<T>]: Repository<T>[K] extends (...args: any[]) => any
    ? jest.Mock<ReturnType<Repository<T>[K]>, Parameters<Repository<T>[K]>>
    : Repository<T>[K];
};

// 辅助函数创建模拟 Repository 实例
// 这个函数现在将返回一个 Partial 的 MockRepository，我们只模拟需要的方法
const createMockRepository = <T extends object>(): Partial<
  MockRepository<T>
> => ({
  findOneBy: jest.fn(),
  find: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
  preload: jest.fn(),
  // 根据需要为其他方法添加 jest.fn()
});

describe('ProductsService', () => {
  let service: ProductsService;
  let productRepository: Partial<MockRepository<Product>>;

  const mockProductId = 'some-uuid-string';
  const mockProductEntity = new Product(); // 使用实体类创建实例
  Object.assign(mockProductEntity, {
    id: mockProductId,
    name: 'Test Product',
    description: 'Test Description',
    price: 100,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        {
          provide: getRepositoryToken(Product),
          useValue: createMockRepository<Product>(),
        },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
    productRepository = module.get<Partial<MockRepository<Product>>>(
      getRepositoryToken(Product),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findOne', () => {
    it('should return a product if found', async () => {
      // 确保模拟方法已定义
      if (productRepository.findOneBy) {
        productRepository.findOneBy.mockResolvedValue(mockProductEntity);
      }

      const result = await service.findOne(mockProductId);
      expect(result).toEqual(mockProductEntity);
      expect(productRepository.findOneBy).toHaveBeenCalledWith({
        id: mockProductId,
      });
    });

    it('should throw NotFoundException if product not found', async () => {
      if (productRepository.findOneBy) {
        productRepository.findOneBy.mockResolvedValue(null);
      }

      await expect(service.findOne('non-existent-id')).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.findOne('non-existent-id')).rejects.toThrow(
        'Product with ID "non-existent-id" not found',
      );
      expect(productRepository.findOneBy).toHaveBeenCalledWith({
        id: 'non-existent-id',
      });
    });
  });

  // 你可以为 create, findAll, update, remove 方法添加更多的 describe 和 it 块
  // 例如: describe('create', () => { ... });
});
