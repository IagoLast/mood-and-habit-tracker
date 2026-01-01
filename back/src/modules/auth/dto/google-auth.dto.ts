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
  codeVerifier?: string;

  @IsOptional()
  @IsString()
  googleToken?: string;
}
