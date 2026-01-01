import { Module } from '@nestjs/common';
import { CategoriesController } from './categories.controller';
import { ListCategoriesService } from './services/list-categories.service';
import { CreateCategoryService } from './services/create-category.service';
import { GetCategoryService } from './services/get-category.service';
import { UpdateCategoryService } from './services/update-category.service';
import { DeleteCategoryService } from './services/delete-category.service';
import { InitializeDefaultCategoriesService } from './services/initialize-default-categories.service';

@Module({
  controllers: [CategoriesController],
  providers: [
    ListCategoriesService,
    CreateCategoryService,
    GetCategoryService,
    UpdateCategoryService,
    DeleteCategoryService,
    InitializeDefaultCategoriesService,
  ],
  exports: [InitializeDefaultCategoriesService],
})
export class CategoriesModule {}
