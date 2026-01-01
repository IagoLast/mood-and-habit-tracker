import { IsArray, IsString, IsNotEmpty, IsOptional, IsInt, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class UpsertElementDto {
  @IsOptional()
  @IsInt()
  id?: number;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsString()
  iconName?: string | null;
}

export class UpsertCategoryDto {
  @IsOptional()
  @IsInt()
  id?: number;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpsertElementDto)
  elements: UpsertElementDto[];
}

export class UpsertHabitsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpsertCategoryDto)
  categories: UpsertCategoryDto[];
}
