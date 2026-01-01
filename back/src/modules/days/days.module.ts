import { Module } from '@nestjs/common';
import { DaysController } from './days.controller';
import { GetDayService } from './services/get-day.service';
import { UpdateDayService } from './services/update-day.service';
import { CategoriesModule } from '../categories/categories.module';
import { ElementsModule } from '../elements/elements.module';
import { ScoresModule } from '../scores/scores.module';
import { CompletionsModule } from '../completions/completions.module';

@Module({
  imports: [CategoriesModule, ElementsModule, ScoresModule, CompletionsModule],
  controllers: [DaysController],
  providers: [
    GetDayService,
    UpdateDayService,
  ],
})
export class DaysModule {}
