import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Test, TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Product } from '../products/product.entity.js';
import { ProductsService } from '../products/products.service.js';
import { UserType } from '../utils/enums.js';
import { User } from '../users/user.entity.js';
import { UsersService } from '../users/users.service.js';
import { Review } from './review.entity.js';
import { ReviewsService } from './reviews.service.js';

describe('ReviewsService', () => {
  let service: ReviewsService;
  let repository: Record<string, ReturnType<typeof vi.fn>>;
  let reviews: Review[];

  beforeEach(async () => {
    const user = { id: 1, userType: UserType.NORMaL_USER } as User;
    const product = { id: 10, title: 'Book' } as Product;
    reviews = [
      {
        id: 1,
        comment: 'Very good',
        rating: 5,
        createdAt: new Date('2026-01-01'),
        user,
        product,
      } as Review,
    ];
    repository = {
      create: vi.fn((review) => review),
      save: vi.fn((review) => Promise.resolve({ ...review, id: review.id ?? 1 })),
      find: vi.fn(() => Promise.resolve(reviews)),
      findOne: vi.fn(({ where: { id } }) =>
        Promise.resolve(reviews.find((review) => review.id === id) ?? null),
      ),
      remove: vi.fn((review) => Promise.resolve(review)),
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReviewsService,
        { provide: getRepositoryToken(Review), useValue: repository },
        {
          provide: ProductsService,
          useValue: { getOneBy: vi.fn(() => Promise.resolve(product)) },
        },
        {
          provide: UsersService,
          useValue: { getCurrentUser: vi.fn(() => Promise.resolve(user)) },
        },
      ],
    }).compile();
    service = module.get(ReviewsService);
  });

  it('creates a review associated with the requested product and user', async () => {
    const result = await service.createReview(10, 1, { comment: 'Great product', rating: 5 });

    expect(repository.create).toHaveBeenCalledWith(
      expect.objectContaining({ comment: 'Great product', rating: 5, user: expect.anything(), product: expect.anything() }),
    );
    expect(result).toMatchObject({
      id: 1,
      comment: 'Great product',
      rating: 5,
      userId: 1,
      productId: 10,
    });
  });

  it('applies pagination and sorting when listing reviews', async () => {
    await expect(service.getAll(2, 4)).resolves.toBe(reviews);
    expect(repository.find).toHaveBeenCalledWith({
      skip: 4,
      take: 4,
      order: { createdAt: 'ASC' },
    });
  });

  it('gets a review by id and reports missing reviews', async () => {
    await expect(service.getOneBy(1)).resolves.toBe(reviews[0]);
    await expect(service.getOneBy(99)).rejects.toThrow(NotFoundException);
  });

  it('updates a review only when its owner makes the request', async () => {
    const result = await service.Update(1, 1, { comment: 'Updated', rating: 4 });

    expect(result).toMatchObject({ comment: 'Updated', rating: 4 });
    expect(repository.save).toHaveBeenCalledWith(reviews[0]);
    await expect(service.Update(1, 2, { rating: 3 })).rejects.toThrow(ForbiddenException);
  });

  it('allows review deletion by the owner or an admin only', async () => {
    await expect(
      service.Delete(1, { id: 1, userType: UserType.NORMaL_USER }),
    ).resolves.toEqual({ message: 'review deleted' });
    await expect(
      service.Delete(1, { id: 2, userType: UserType.ADMIN }),
    ).resolves.toEqual({ message: 'review deleted' });
    await expect(
      service.Delete(1, { id: 2, userType: UserType.NORMaL_USER }),
    ).rejects.toThrow(ForbiddenException);
    expect(repository.remove).toHaveBeenCalledTimes(2);
  });
});
