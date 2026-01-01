import { Injectable, Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import { Pool } from 'pg';
import { AuthenticatedUser } from '../../../common/decorators/user.decorator';
import { UpdateDayDto } from '../dto/update-day.dto';
import { DayResponseDto } from '../dto/day-response.dto';
import { dateStringToPlainDate } from '../../../common/utils/timestamp';
import { CategoriesRepository } from '../../habits/repositories/categories.repository';
import { HabitsRepository } from '../../habits/repositories/habits.repository';
import { ScoresRepository } from '../../scores/repositories/scores.repository';
import { CompletionsRepository } from '../repositories/completions.repository';

interface UpdateDayParams {
  user: AuthenticatedUser;
  date: string;
  dto: UpdateDayDto;
}

@Injectable()
export class UpdateDayService {
  constructor(
    @Inject('DATABASE_POOL') private readonly pool: Pool,
    private readonly habitsRepository: HabitsRepository,
    private readonly categoriesRepository: CategoriesRepository,
    private readonly scoresRepository: ScoresRepository,
    private readonly completionsRepository: CompletionsRepository,
  ) {}

  async execute(params: UpdateDayParams): Promise<DayResponseDto> {
    const { user, date, dto } = params;
    const plainDate = dateStringToPlainDate(date);

    if (dto.date && dto.date !== plainDate) {
      throw new BadRequestException('Date mismatch');
    }

    const habitIds = dto.elements.map((e) => e.elementId);
    const hasAccess = await this.habitsRepository.verifyOwnershipBatch(habitIds, user.userId);
    if (!hasAccess) {
      throw new NotFoundException('One or more habits not found');
    }

    const completedElements = dto.elements.filter((e) => e.completed === 'COMPLETED');

    let score: number | null = null;
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');

      if (dto.score !== undefined && dto.score !== null) {
        score = await this.scoresRepository.upsertWithClient(client, {
          userId: user.userId,
          date: plainDate,
          score: dto.score,
        });
      } else if (dto.score === null) {
        await this.scoresRepository.deleteWithClient(client, user.userId, plainDate);
        score = null;
      }

      await this.completionsRepository.deleteByUserIdAndDateWithClient(
        client,
        user.userId,
        plainDate,
      );

      if (completedElements.length > 0) {
        const completions = completedElements.map((e) => ({
          habitId: e.elementId,
          date: plainDate,
        }));
        await this.completionsRepository.createBatchWithClient(client, completions);
      }

      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }

    const categories = await this.categoriesRepository.findAllByUserId(user.userId);
    if (score === null && dto.score === undefined) {
      score = await this.scoresRepository.findByUserIdAndDate(user.userId, plainDate);
    }
    const completedHabitIds = new Set(completedElements.map((e) => e.elementId));

    const dayCategories = [];

    for (const category of categories) {
      const habits = await this.habitsRepository.findAllByCategoryId(category.id);

      const dayElements = habits.map((habit) => ({
        ...habit,
        completed: completedHabitIds.has(habit.id),
      }));

      dayCategories.push({
        ...category,
        elements: dayElements,
      });
    }

    return {
      date: plainDate,
      score,
      categories: dayCategories,
    };
  }
}
