import { Pool } from 'pg';
import { AuthenticatedUser } from '@/auth/types';
import { dateStringToPlainDate } from '@/lib/timestamp';
import { CategoriesRepository } from '@/habits/categories.repository';
import { HabitsRepository } from '@/habits/habits.repository';
import { ScoresRepository } from '@/scores/scores.repository';
import { CompletionsRepository } from './completions.repository';
import { DayResponseDto, UpdateDayDto } from './types';

interface UpdateDayParams {
  user: AuthenticatedUser;
  date: string;
  dto: UpdateDayDto;
}

export class UpdateDayService {
  constructor(
    private readonly pool: Pool,
    private readonly habitsRepository: HabitsRepository,
    private readonly categoriesRepository: CategoriesRepository,
    private readonly scoresRepository: ScoresRepository,
    private readonly completionsRepository: CompletionsRepository,
  ) {}

  async execute(params: UpdateDayParams): Promise<DayResponseDto> {
    const { user, date, dto } = params;
    const plainDate = dateStringToPlainDate(date);

    if (dto.date && dto.date !== plainDate) {
      throw new Error('Date mismatch');
    }

    const habitIds = dto.elements.map((e) => e.elementId);
    const hasAccess = await this.habitsRepository.verifyOwnershipBatch(habitIds, user.userId);
    if (!hasAccess) {
      throw new Error('One or more habits not found');
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
