import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { GoogleAuthService } from './services/google-auth.service';
import { HabitsModule } from '../habits/habits.module';

@Module({
  imports: [HabitsModule],
  controllers: [AuthController],
  providers: [GoogleAuthService],
})
export class AuthModule {}
