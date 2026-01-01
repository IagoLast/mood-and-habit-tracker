export class ScoreEntryDto {
  id: number;
  date: string;
  score: number;
}

export class ListScoresResponseDto {
  user_id: string;
  entries: ScoreEntryDto[];
}
