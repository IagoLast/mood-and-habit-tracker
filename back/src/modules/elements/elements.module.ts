import { Module, forwardRef } from '@nestjs/common';
import { ElementsRepository } from './repositories/elements.repository';
import { CategoriesModule } from '../categories/categories.module';

@Module({
  imports: [forwardRef(() => CategoriesModule)],
  providers: [ElementsRepository],
  exports: [ElementsRepository],
})
export class ElementsModule {}
