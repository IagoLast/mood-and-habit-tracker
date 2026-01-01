import { Injectable, NotFoundException } from '@nestjs/common';
import { AuthenticatedUser } from '../../../common/decorators/user.decorator';
import { ListCompletionsResult } from '../dto/completion-response.dto';
import { ElementsRepository } from '../../elements/repositories/elements.repository';
import { CompletionsRepository } from '../repositories/completions.repository';

interface ListCompletionsParams {
  user: AuthenticatedUser;
  elementId: number;
  date?: string;
}

@Injectable()
export class ListCompletionsService {
  constructor(
    private readonly elementsRepository: ElementsRepository,
    private readonly completionsRepository: CompletionsRepository,
  ) {}

  async execute(params: ListCompletionsParams): Promise<ListCompletionsResult> {
    const { user, elementId, date } = params;

    const hasAccess = await this.elementsRepository.verifyOwnership(elementId, user.userId);
    if (!hasAccess) {
      throw new NotFoundException('Element not found');
    }

    const completions = await this.completionsRepository.findByElementId(elementId, date);

    return {
      data: completions,
    };
  }
}
