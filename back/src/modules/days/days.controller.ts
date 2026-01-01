import {
  Controller,
  Get,
  Put,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { User, AuthenticatedUser } from '../../common/decorators/user.decorator';
import { UpdateDayDto } from './dto/update-day.dto';
import { GetDayService } from './services/get-day.service';
import { UpdateDayService } from './services/update-day.service';

@Controller('days')
@UseGuards(JwtAuthGuard)
export class DaysController {
  constructor(
    private readonly getDayService: GetDayService,
    private readonly updateDayService: UpdateDayService,
  ) {}

  @Get(':date')
  async get(@User() user: AuthenticatedUser, @Param('date') date: string) {
    return this.getDayService.execute({ user, date });
  }

  @Put(':date')
  async update(
    @User() user: AuthenticatedUser,
    @Param('date') date: string,
    @Body() dto: UpdateDayDto,
  ) {
    return this.updateDayService.execute({ user, date, dto });
  }
}
