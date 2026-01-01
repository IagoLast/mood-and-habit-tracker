import { Module, forwardRef } from '@nestjs/common';
import { InitializeDefaultCategoriesService } from './services/initialize-default-categories.service';
import { CategoriesRepository } from './repositories/categories.repository';
import { ElementsModule } from '../elements/elements.module';

@Module({
  imports: [forwardRef(() => ElementsModule)],
  providers: [CategoriesRepository, InitializeDefaultCategoriesService],
  exports: [CategoriesRepository, InitializeDefaultCategoriesService],
})
export class CategoriesModule {}
