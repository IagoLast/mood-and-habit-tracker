import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class UpdateElementDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsString()
  iconName?: string;
}
