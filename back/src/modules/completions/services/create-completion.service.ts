import { Injectable, NotFoundException } from '@nestjs/common';
import { AuthenticatedUser } from '../../../common/decorators/user.decorator';
import { CreateCompletionDto } from '../dto/create-completion.dto';
import { CompletionResponseDto } from '../dto/completion-response.dto';
import { getCurrentTimestampMs } from '../../../common/utils/timestamp';
import { ElementsRepository } from '../../elements/repositories/elements.repository';
import { CompletionsRepository } from '../repositories/completions.repository';

interface CreateCompletionParams {
  user: AuthenticatedUser;
  dto: CreateCompletionDto;
}

@Injectable()
export class CreateCompletionService {
  constructor(
    private readonly elementsRepository: ElementsRepository,
    private readonly completionsRepository: CompletionsRepository,
  ) {}

  async execute(params: CreateCompletionParams): Promise<CompletionResponseDto> {
    const { user, dto } = params;
    const { elementId, dateZts } = dto;

    const hasAccess = await this.elementsRepository.verifyOwnership(elementId, user.userId);
    if (!hasAccess) {
      throw new NotFoundException('Element not found');
    }

    const now = getCurrentTimestampMs();

    return await this.completionsRepository.create({
      elementId,
      dateZts,
      createdAtTimestampMs: now,
    });
  }
}
