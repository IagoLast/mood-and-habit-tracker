import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './common/database/database.module';
import { AuthModule } from './modules/auth/auth.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { ElementsModule } from './modules/elements/elements.module';
import { CompletionsModule } from './modules/completions/completions.module';
import { ScoresModule } from './modules/scores/scores.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    DatabaseModule,
    AuthModule,
    CategoriesModule,
    ElementsModule,
    CompletionsModule,
    ScoresModule,
  ],
})
export class AppModule {}
