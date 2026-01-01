import { Module } from '@nestjs/common';
import { CompletionsController } from './completions.controller';
import { ListCompletionsService } from './services/list-completions.service';
import { CreateCompletionService } from './services/create-completion.service';
import { DeleteCompletionService } from './services/delete-completion.service';

@Module({
  controllers: [CompletionsController],
  providers: [
    ListCompletionsService,
    CreateCompletionService,
    DeleteCompletionService,
  ],
})
export class CompletionsModule {}
