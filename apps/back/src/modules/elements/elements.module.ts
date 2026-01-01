import { Module } from '@nestjs/common';
import { ElementsController } from './elements.controller';
import { ListElementsService } from './services/list-elements.service';
import { CreateElementService } from './services/create-element.service';
import { GetElementService } from './services/get-element.service';
import { UpdateElementService } from './services/update-element.service';
import { DeleteElementService } from './services/delete-element.service';

@Module({
  controllers: [ElementsController],
  providers: [
    ListElementsService,
    CreateElementService,
    GetElementService,
    UpdateElementService,
    DeleteElementService,
  ],
})
export class ElementsModule {}
