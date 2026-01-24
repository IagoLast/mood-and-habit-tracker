export interface CategoryResponseDto {
  id: number;
  name: string;
  user_id: string;
  created_at: Date;
  updated_at: Date;
}

export interface HabitResponseDto {
  id: number;
  category_id: number;
  name: string;
  icon_name: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface HabitCategory extends CategoryResponseDto {
  elements: HabitResponseDto[];
}

export interface HabitsResponseDto {
  categories: HabitCategory[];
}

export interface UpsertElementDto {
  id?: number;
  name: string;
  iconName?: string | null;
}

export interface UpsertCategoryDto {
  id?: number;
  name: string;
  elements: UpsertElementDto[];
}

export interface UpsertHabitsDto {
  categories: UpsertCategoryDto[];
}
