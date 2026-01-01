import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { GoogleAuthService } from './services/google-auth.service';

@Module({
  controllers: [AuthController],
  providers: [GoogleAuthService],
})
export class AuthModule {}
