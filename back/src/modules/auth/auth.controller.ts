import { Controller, Post, Body } from '@nestjs/common';
import { GoogleAuthService } from './services/google-auth.service';
import { GoogleAuthDto } from './dto/google-auth.dto';

@Controller('auth/google')
export class AuthController {
  constructor(private readonly googleAuthService: GoogleAuthService) {}

  @Post()
  async googleAuth(@Body() dto: GoogleAuthDto) {
    return this.googleAuthService.execute(dto);
  }
}
