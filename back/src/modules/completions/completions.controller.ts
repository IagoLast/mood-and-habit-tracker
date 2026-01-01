import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Query,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { User, AuthenticatedUser } from '../../common/decorators/user.decorator';
import { CreateCompletionDto } from './dto/create-completion.dto';
import { ListCompletionsService } from './services/list-completions.service';
import { CreateCompletionService } from './services/create-completion.service';
import { DeleteCompletionService } from './services/delete-completion.service';

@Controller('completions')
@UseGuards(JwtAuthGuard)
export class CompletionsController {
  constructor(
    private readonly listCompletionsService: ListCompletionsService,
    private readonly createCompletionService: CreateCompletionService,
    private readonly deleteCompletionService: DeleteCompletionService,
  ) {}

  @Get()
  async list(
    @User() user: AuthenticatedUser,
    @Query('elementId', ParseIntPipe) elementId: number,
    @Query('date') date?: string,
  ) {
    return this.listCompletionsService.execute({ user, elementId, date });
  }

  @Post()
  async create(@User() user: AuthenticatedUser, @Body() dto: CreateCompletionDto) {
    return this.createCompletionService.execute({ user, dto });
  }

  @Delete()
  async delete(
    @User() user: AuthenticatedUser,
    @Query('elementId', ParseIntPipe) elementId: number,
    @Query('date') date: string,
  ) {
    return this.deleteCompletionService.execute({ user, elementId, date });
  }
}
