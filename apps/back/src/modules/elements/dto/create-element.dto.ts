import { IsString, IsNotEmpty, IsInt, IsOptional } from 'class-validator';

export class CreateElementDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsInt()
  categoryId: number;

  @IsOptional()
  @IsString()
  iconName?: string;
}
