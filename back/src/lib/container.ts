import { getPool } from './db';
import { AuthService } from '@/auth/auth.service';
import { GoogleAuthService } from '@/auth/google-auth.service';
import { CategoriesRepository } from '@/habits/categories.repository';
import { HabitsRepository } from '@/habits/habits.repository';
import { GetHabitsService } from '@/habits/get-habits.service';
import { UpsertHabitsService } from '@/habits/upsert-habits.service';
import { InitializeDefaultCategoriesService } from '@/habits/initialize-default-categories.service';
import { ScoresRepository } from '@/scores/scores.repository';
import { ListScoresService } from '@/scores/list-scores.service';
import { CompletionsRepository } from '@/days/completions.repository';
import { GetDayService } from '@/days/get-day.service';
import { UpdateDayService } from '@/days/update-day.service';

// Repositories - created once per request cycle
function createCategoriesRepository() {
  return new CategoriesRepository(getPool());
}

function createHabitsRepository() {
  return new HabitsRepository(getPool());
}

function createScoresRepository() {
  return new ScoresRepository(getPool());
}

function createCompletionsRepository() {
  return new CompletionsRepository(getPool());
}

// Services
export function getAuthService(): AuthService {
  return new AuthService();
}

export function getGoogleAuthService(): GoogleAuthService {
  const categoriesRepository = createCategoriesRepository();
  const habitsRepository = createHabitsRepository();
  const initializeDefaultCategoriesService = new InitializeDefaultCategoriesService(
    categoriesRepository,
    habitsRepository,
  );
  return new GoogleAuthService(getPool(), initializeDefaultCategoriesService);
}

export function getGetHabitsService(): GetHabitsService {
  return new GetHabitsService(
    createCategoriesRepository(),
    createHabitsRepository(),
  );
}

export function getUpsertHabitsService(): UpsertHabitsService {
  return new UpsertHabitsService(
    createCategoriesRepository(),
    createHabitsRepository(),
  );
}

export function getListScoresService(): ListScoresService {
  return new ListScoresService(createScoresRepository());
}

export function getGetDayService(): GetDayService {
  return new GetDayService(
    createCategoriesRepository(),
    createHabitsRepository(),
    createScoresRepository(),
    createCompletionsRepository(),
  );
}

export function getUpdateDayService(): UpdateDayService {
  return new UpdateDayService(
    getPool(),
    createHabitsRepository(),
    createCategoriesRepository(),
    createScoresRepository(),
    createCompletionsRepository(),
  );
}
