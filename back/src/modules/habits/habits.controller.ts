import { Controller, Get, Put, Body, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { User, AuthenticatedUser } from '../../common/decorators/user.decorator';
import { UpsertHabitsDto } from './dto/upsert-habits.dto';
import { GetHabitsService } from './services/get-habits.service';
import { UpsertHabitsService } from './services/upsert-habits.service';

@Controller('habits')
@UseGuards(JwtAuthGuard)
export class HabitsController {
  constructor(
    private readonly getHabitsService: GetHabitsService,
    private readonly upsertHabitsService: UpsertHabitsService,
  ) {}

  @Get()
  async get(@User() user: AuthenticatedUser) {
    return this.getHabitsService.execute({ user });
  }

  @Put()
  async upsert(@User() user: AuthenticatedUser, @Body() dto: UpsertHabitsDto) {
    return this.upsertHabitsService.execute({ user, dto });
  }
}
