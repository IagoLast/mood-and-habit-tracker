import { IsString, IsNotEmpty, IsOptional, IsInt, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class ElementCompletionDto {
  @IsInt()
  elementId: number;

  @IsString()
  @IsNotEmpty()
  completed: 'COMPLETED' | 'NOT_COMPLETED';
}

export class UpdateDayDto {
  @IsOptional()
  @IsString()
  date_zts?: string;

  @IsOptional()
  @IsInt()
  score?: number | null;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ElementCompletionDto)
  elements: ElementCompletionDto[];
}
