import { Module } from '@nestjs/common';
import { HabitsController } from './habits.controller';
import { GetHabitsService } from './services/get-habits.service';
import { UpsertHabitsService } from './services/upsert-habits.service';
import { InitializeDefaultCategoriesService } from './services/initialize-default-categories.service';
import { HabitsRepository } from './repositories/habits.repository';
import { CategoriesRepository } from './repositories/categories.repository';

@Module({
  controllers: [HabitsController],
  providers: [
    HabitsRepository,
    CategoriesRepository,
    GetHabitsService,
    UpsertHabitsService,
    InitializeDefaultCategoriesService,
  ],
  exports: [HabitsRepository, CategoriesRepository, InitializeDefaultCategoriesService],
})
export class HabitsModule {}
