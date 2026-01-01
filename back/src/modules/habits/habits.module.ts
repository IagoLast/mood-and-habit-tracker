import { Module } from '@nestjs/common';
import { HabitsController } from './habits.controller';
import { GetHabitsService } from './services/get-habits.service';
import { UpsertHabitsService } from './services/upsert-habits.service';
import { CategoriesModule } from '../categories/categories.module';
import { ElementsModule } from '../elements/elements.module';

@Module({
  imports: [CategoriesModule, ElementsModule],
  controllers: [HabitsController],
  providers: [GetHabitsService, UpsertHabitsService],
})
export class HabitsModule {}
