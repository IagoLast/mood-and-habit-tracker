export class CompletionResponseDto {
  id: number;
  element_id: number;
  date_zts: string;
  created_at: Date;
  created_at_timestamp_ms: number;
}

export interface ListCompletionsResult {
  data: CompletionResponseDto[];
}
