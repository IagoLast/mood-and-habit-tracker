import { Module } from '@nestjs/common';
import { ScoresController } from './scores.controller';
import { ListScoresService } from './services/list-scores.service';
import { ScoresRepository } from './repositories/scores.repository';

@Module({
  controllers: [ScoresController],
  providers: [
    ScoresRepository,
    ListScoresService,
  ],
  exports: [ScoresRepository],
})
export class ScoresModule {}
