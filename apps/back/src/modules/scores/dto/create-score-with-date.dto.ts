import { IsInt, IsNotEmpty, IsString, Min, Max } from 'class-validator';

export class CreateScoreWithDateDto {
  @IsString()
  @IsNotEmpty()
  dateZts: string;

  @IsInt()
  @Min(1)
  @Max(10)
  score: number;
}
