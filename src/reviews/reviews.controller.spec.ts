import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Reflector } from '@nestjs/core';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { UserType } from '../utils/enums';
import { UsersService } from '../users/users.service';
import { ReviewsControllers } from './reviews.controller';
import { ReviewsService } from './reviews.service';

describe('ReviewsControllers', () => {
  let controller: ReviewsControllers;
  let service: Record<string, ReturnType<typeof vi.fn>>;
  const payload = { id: 1, userType: UserType.NORMaL_USER };

  beforeEach(async () => {
    service = {
      getAll: vi.fn(() => Promise.resolve([{ id: 1 }])),
      createReview: vi.fn((productId, userId, dto) => Promise.resolve({ id: 1, productId, userId, ...dto })),
      getOneBy: vi.fn((id) => Promise.resolve({ id })),
      Update: vi.fn((id, userId, dto) => Promise.resolve({ id, userId, ...dto })),
      Delete: vi.fn(() => Promise.resolve({ message: 'review deleted' })),
    };
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReviewsControllers],
      providers: [
        { provide: ReviewsService, useValue: service },
        { provide: UsersService, useValue: {} },
        { provide: JwtService, useValue: {} },
        { provide: ConfigService, useValue: {} },
        { provide: Reflector, useValue: {} },
      ],
    }).compile();
    controller = module.get(ReviewsControllers);
  });

  it('forwards a paginated list request', async () => {
    await expect(controller.getAllReviews(2, 4)).resolves.toEqual([{ id: 1 }]);
    expect(service.getAll).toHaveBeenCalledWith(2, 4);
  });

  it('forwards create, get, update, and delete operations', async () => {
    const dto = { comment: 'Good', rating: 5 };

    await expect(controller.createNewReview(10, dto, payload)).resolves.toMatchObject({
      id: 1,
      productId: 10,
      userId: 1,
    });
    await expect(controller.getSingleReview(1)).resolves.toEqual({ id: 1 });
    await expect(controller.UpdateProduct(1, { rating: 4 }, payload)).resolves.toMatchObject({
      id: 1,
      userId: 1,
      rating: 4,
    });
    await expect(controller.DeleteProduct(1, payload)).resolves.toEqual({ message: 'review deleted' });
    expect(service.createReview).toHaveBeenCalledWith(10, 1, dto);
    expect(service.getOneBy).toHaveBeenCalledWith(1);
    expect(service.Update).toHaveBeenCalledWith(1, 1, { rating: 4 });
    expect(service.Delete).toHaveBeenCalledWith(1, payload);
  });
});
