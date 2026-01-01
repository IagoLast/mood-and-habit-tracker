import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { User, AuthenticatedUser } from '../../common/decorators/user.decorator';
import { CreateScoreWithDateDto } from './dto/create-score-with-date.dto';
import { ListScoresService } from './services/list-scores.service';
import { CreateScoreService } from './services/create-score.service';
import { GetScoreService } from './services/get-score.service';
import { DeleteScoreService } from './services/delete-score.service';

@Controller('scores')
@UseGuards(JwtAuthGuard)
export class ScoresController {
  constructor(
    private readonly listScoresService: ListScoresService,
    private readonly createScoreService: CreateScoreService,
    private readonly getScoreService: GetScoreService,
    private readonly deleteScoreService: DeleteScoreService,
  ) {}

  @Get()
  async list(
    @User() user: AuthenticatedUser,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.listScoresService.execute({ user, startDate, endDate });
  }

  @Post()
  async create(@User() user: AuthenticatedUser, @Body() dto: CreateScoreWithDateDto) {
    return this.createScoreService.execute({ user, dto });
  }

  @Get(':date')
  async get(@User() user: AuthenticatedUser, @Param('date') date: string) {
    return this.getScoreService.execute({ user, date });
  }

  @Delete(':date')
  async delete(@User() user: AuthenticatedUser, @Param('date') date: string) {
    return this.deleteScoreService.execute({ user, date });
  }
}
