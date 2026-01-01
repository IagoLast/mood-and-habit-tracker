import { Module } from '@nestjs/common';
import { DaysController } from './days.controller';
import { GetDayService } from './services/get-day.service';
import { UpdateDayService } from './services/update-day.service';
import { CompletionsRepository } from './repositories/completions.repository';
import { HabitsModule } from '../habits/habits.module';
import { ScoresModule } from '../scores/scores.module';

@Module({
  imports: [HabitsModule, ScoresModule],
  controllers: [DaysController],
  providers: [GetDayService, UpdateDayService, CompletionsRepository],
})
export class DaysModule {}
