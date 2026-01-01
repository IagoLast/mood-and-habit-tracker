export class CategoryResponseDto {
  id: number;
  name: string;
  user_id: string;
  created_at: Date;
  updated_at: Date;
  created_at_timestamp_ms: number;
  updated_at_timestamp_ms: number;
}

export interface ListCategoriesResult {
  data: CategoryResponseDto[];
}
