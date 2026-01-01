import { Module } from '@nestjs/common';
import { ScoresController } from './scores.controller';
import { ListScoresService } from './services/list-scores.service';
import { CreateScoreService } from './services/create-score.service';
import { GetScoreService } from './services/get-score.service';
import { DeleteScoreService } from './services/delete-score.service';

@Module({
  controllers: [ScoresController],
  providers: [
    ListScoresService,
    CreateScoreService,
    GetScoreService,
    DeleteScoreService,
  ],
})
export class ScoresModule {}
