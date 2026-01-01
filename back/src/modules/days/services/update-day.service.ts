import { Injectable, Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import { Pool } from 'pg';
import { AuthenticatedUser } from '../../../common/decorators/user.decorator';
import { UpdateDayDto } from '../dto/update-day.dto';
import { DayResponseDto } from '../dto/day-response.dto';
import { getCurrentTimestampMs, dateStringToDateZts } from '../../../common/utils/timestamp';
import { CategoriesRepository } from '../../categories/repositories/categories.repository';
import { ElementsRepository } from '../../elements/repositories/elements.repository';
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
    private readonly elementsRepository: ElementsRepository,
    private readonly categoriesRepository: CategoriesRepository,
    private readonly scoresRepository: ScoresRepository,
    private readonly completionsRepository: CompletionsRepository,
  ) {}

  async execute(params: UpdateDayParams): Promise<DayResponseDto> {
    const { user, date, dto } = params;
    const dateZts = dateStringToDateZts(date);

    if (dto.date_zts && dto.date_zts !== dateZts) {
      throw new BadRequestException('Date mismatch');
    }

    const elementIds = dto.elements.map((e) => e.elementId);
    const hasAccess = await this.elementsRepository.verifyOwnershipBatch(elementIds, user.userId);
    if (!hasAccess) {
      throw new NotFoundException('One or more elements not found');
    }

    const completedElements = dto.elements.filter((e) => e.completed === 'COMPLETED');

    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');

      if (dto.score !== undefined && dto.score !== null) {
        const now = getCurrentTimestampMs();
        await this.scoresRepository.upsertWithClient(client, {
          userId: user.userId,
          dateZts,
          score: dto.score,
          createdAtTimestampMs: now,
          updatedAtTimestampMs: now,
        });
      } else if (dto.score === null) {
        await this.scoresRepository.deleteWithClient(client, user.userId, dateZts);
      }

      await this.completionsRepository.deleteByUserIdAndDateZtsWithClient(
        client,
        user.userId,
        dateZts,
      );

      if (completedElements.length > 0) {
        const now = getCurrentTimestampMs();
        const completions = completedElements.map((e) => ({
          elementId: e.elementId,
          dateZts,
          createdAtTimestampMs: now,
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
    const score = await this.scoresRepository.findByUserIdAndDateZts(user.userId, dateZts);
    const completedElementIds = new Set(completedElements.map((e) => e.elementId));

    const dayCategories = [];

    for (const category of categories) {
      const elements = await this.elementsRepository.findAllByCategoryId(category.id);

      const dayElements = elements.map((element) => ({
        ...element,
        completed: completedElementIds.has(element.id),
      }));

      dayCategories.push({
        ...category,
        elements: dayElements,
      });
    }

    return {
      date_zts: dateZts,
      score,
      categories: dayCategories,
    };
  }
}
