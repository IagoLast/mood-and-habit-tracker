import { IsString, IsNotEmpty, IsInt } from 'class-validator';

export class CreateCompletionDto {
  @IsInt()
  elementId: number;

  @IsString()
  @IsNotEmpty()
  dateZts: string;
}
