import { Controller, Post, Body } from '@nestjs/common';
import { GoogleAuthDto } from './dto/google-auth.dto';
import { GoogleAuthService } from './services/google-auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly googleAuthService: GoogleAuthService) {}

  @Post('google')
  async googleAuth(@Body() dto: GoogleAuthDto) {
    return this.googleAuthService.execute(dto);
  }
}
