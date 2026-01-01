export class CategoryResponseDto {
  id: number;
  name: string;
  user_id: string;
  created_at: Date;
  updated_at: Date;
}

export interface ListCategoriesResult {
  data: CategoryResponseDto[];
}
