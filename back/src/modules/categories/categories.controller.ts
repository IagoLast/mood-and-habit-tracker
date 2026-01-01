import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { User, AuthenticatedUser } from '../../common/decorators/user.decorator';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { ListCategoriesService } from './services/list-categories.service';
import { CreateCategoryService } from './services/create-category.service';
import { GetCategoryService } from './services/get-category.service';
import { UpdateCategoryService } from './services/update-category.service';
import { DeleteCategoryService } from './services/delete-category.service';

@Controller('categories')
@UseGuards(JwtAuthGuard)
export class CategoriesController {
  constructor(
    private readonly listCategoriesService: ListCategoriesService,
    private readonly createCategoryService: CreateCategoryService,
    private readonly getCategoryService: GetCategoryService,
    private readonly updateCategoryService: UpdateCategoryService,
    private readonly deleteCategoryService: DeleteCategoryService,
  ) {}

  @Get()
  async list(@User() user: AuthenticatedUser) {
    return this.listCategoriesService.execute({ user });
  }

  @Post()
  async create(@User() user: AuthenticatedUser, @Body() dto: CreateCategoryDto) {
    return this.createCategoryService.execute({ user, dto });
  }

  @Get(':id')
  async get(@User() user: AuthenticatedUser, @Param('id', ParseIntPipe) id: number) {
    return this.getCategoryService.execute({ user, id });
  }

  @Put(':id')
  async update(
    @User() user: AuthenticatedUser,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCategoryDto,
  ) {
    return this.updateCategoryService.execute({ user, id, dto });
  }

  @Delete(':id')
  async delete(@User() user: AuthenticatedUser, @Param('id', ParseIntPipe) id: number) {
    return this.deleteCategoryService.execute({ user, id });
  }
}
