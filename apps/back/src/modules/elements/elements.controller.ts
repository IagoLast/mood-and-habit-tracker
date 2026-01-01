import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { User, AuthenticatedUser } from '../../common/decorators/user.decorator';
import { CreateElementDto } from './dto/create-element.dto';
import { UpdateElementDto } from './dto/update-element.dto';
import { ListElementsService } from './services/list-elements.service';
import { CreateElementService } from './services/create-element.service';
import { GetElementService } from './services/get-element.service';
import { UpdateElementService } from './services/update-element.service';
import { DeleteElementService } from './services/delete-element.service';

@Controller('elements')
@UseGuards(JwtAuthGuard)
export class ElementsController {
  constructor(
    private readonly listElementsService: ListElementsService,
    private readonly createElementService: CreateElementService,
    private readonly getElementService: GetElementService,
    private readonly updateElementService: UpdateElementService,
    private readonly deleteElementService: DeleteElementService,
  ) {}

  @Get()
  async list(
    @User() user: AuthenticatedUser,
    @Query('categoryId', ParseIntPipe) categoryId: number,
  ) {
    return this.listElementsService.execute({ user, categoryId });
  }

  @Post()
  async create(@User() user: AuthenticatedUser, @Body() dto: CreateElementDto) {
    return this.createElementService.execute({ user, dto });
  }

  @Get(':id')
  async get(@User() user: AuthenticatedUser, @Param('id', ParseIntPipe) id: number) {
    return this.getElementService.execute({ user, id });
  }

  @Put(':id')
  async update(
    @User() user: AuthenticatedUser,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateElementDto,
  ) {
    return this.updateElementService.execute({ user, id, dto });
  }

  @Delete(':id')
  async delete(@User() user: AuthenticatedUser, @Param('id', ParseIntPipe) id: number) {
    return this.deleteElementService.execute({ user, id });
  }
}
