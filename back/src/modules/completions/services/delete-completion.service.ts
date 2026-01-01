import { Injectable, NotFoundException } from '@nestjs/common';
import { AuthenticatedUser } from '../../../common/decorators/user.decorator';
import { ElementsRepository } from '../../elements/repositories/elements.repository';
import { CompletionsRepository } from '../repositories/completions.repository';

interface DeleteCompletionParams {
  user: AuthenticatedUser;
  elementId: number;
  date: string;
}

@Injectable()
export class DeleteCompletionService {
  constructor(
    private readonly elementsRepository: ElementsRepository,
    private readonly completionsRepository: CompletionsRepository,
  ) {}

  async execute(params: DeleteCompletionParams): Promise<{ message: string }> {
    const { user, elementId, date } = params;

    const hasAccess = await this.elementsRepository.verifyOwnership(elementId, user.userId);
    if (!hasAccess) {
      throw new NotFoundException('Completion not found');
    }

    const completion = await this.completionsRepository.deleteByElementIdAndDateZts(elementId, date);

    if (!completion) {
      throw new NotFoundException('Completion not found');
    }

    return { message: 'Completion deleted successfully' };
  }
}
