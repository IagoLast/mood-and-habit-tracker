import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { GoogleAuthService } from './services/google-auth.service';
import { CategoriesModule } from '../categories/categories.module';

@Module({
  controllers: [AuthController],
  providers: [GoogleAuthService],
  imports: [CategoriesModule],
})
export class AuthModule {}
