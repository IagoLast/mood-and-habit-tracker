import { IsString, IsOptional } from 'class-validator';

export class GoogleAuthDto {
  @IsOptional()
  @IsString()
  code?: string;

  @IsOptional()
  @IsString()
  redirectUri?: string;

  @IsOptional()
  @IsString()
  googleToken?: string;
}
