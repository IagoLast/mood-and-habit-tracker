import { Module } from '@nestjs/common';
import { DaysController } from './days.controller';
import { GetDayService } from './services/get-day.service';
import { UpdateDayService } from './services/update-day.service';

@Module({
  controllers: [DaysController],
  providers: [
    GetDayService,
    UpdateDayService,
  ],
})
export class DaysModule {}
