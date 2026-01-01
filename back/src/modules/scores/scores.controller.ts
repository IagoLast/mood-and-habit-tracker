import {
  Controller,
  Get,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { User, AuthenticatedUser } from '../../common/decorators/user.decorator';
import { ListScoresService } from './services/list-scores.service';

@Controller('scores')
@UseGuards(JwtAuthGuard)
export class ScoresController {
  constructor(
    private readonly listScoresService: ListScoresService,
  ) {}

  @Get()
  async list(
    @User() user: AuthenticatedUser,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.listScoresService.execute({ user, startDate, endDate });
  }
}
