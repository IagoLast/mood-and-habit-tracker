export class HabitResponseDto {
  id: number;
  category_id: number;
  name: string;
  icon_name: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface ListHabitsResult {
  data: HabitResponseDto[];
}
