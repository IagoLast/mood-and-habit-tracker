import { Module } from '@nestjs/common';
import { CompletionsController } from './completions.controller';
import { ListCompletionsService } from './services/list-completions.service';
import { CreateCompletionService } from './services/create-completion.service';
import { DeleteCompletionService } from './services/delete-completion.service';
import { CompletionsRepository } from './repositories/completions.repository';
import { ElementsModule } from '../elements/elements.module';

@Module({
  imports: [ElementsModule],
  controllers: [CompletionsController],
  providers: [
    CompletionsRepository,
    ListCompletionsService,
    CreateCompletionService,
    DeleteCompletionService,
  ],
  exports: [CompletionsRepository],
})
export class CompletionsModule {}
