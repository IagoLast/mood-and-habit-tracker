export interface ScoreEntryDto {
  id: number;
  date: string;
  score: number;
}

export interface ListScoresResponseDto {
  user_id: string;
  entries: ScoreEntryDto[];
}
