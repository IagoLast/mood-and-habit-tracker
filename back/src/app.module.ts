import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './common/database/database.module';
import { AuthModule } from './modules/auth/auth.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { ElementsModule } from './modules/elements/elements.module';
import { HabitsModule } from './modules/habits/habits.module';
import { ScoresModule } from './modules/scores/scores.module';
import { DaysModule } from './modules/days/days.module';
import { HealthModule } from './modules/health/health.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: process.env.NODE_ENV === 'production' 
        ? undefined // En producción (Vercel), las variables vienen del entorno, no de archivos
        : process.env.NODE_ENV === 'test'
        ? '.env.test'
        : '.env.local',
      ignoreEnvFile: process.env.NODE_ENV === 'production', // Ignorar archivos .env en producción
    }),
    DatabaseModule,
    AuthModule,
    CategoriesModule,
    ElementsModule,
    HabitsModule,
    ScoresModule,
    DaysModule,
    HealthModule,
  ],
})
export class AppModule {}
