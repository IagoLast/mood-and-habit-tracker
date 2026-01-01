import { Module } from '@nestjs/common';
import { ScoresController } from './scores.controller';
import { ListScoresService } from './services/list-scores.service';
import { CreateScoreService } from './services/create-score.service';
import { GetScoreService } from './services/get-score.service';
import { DeleteScoreService } from './services/delete-score.service';
import { ScoresRepository } from './repositories/scores.repository';

@Module({
  controllers: [ScoresController],
  providers: [
    ScoresRepository,
    ListScoresService,
    CreateScoreService,
    GetScoreService,
    DeleteScoreService,
  ],
  exports: [ScoresRepository],
})
export class ScoresModule {}
