import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Role } from '../auth/decorators/roles.decorator';
import { Roles } from '../auth/enums/roles.enum';
import { TopicsService } from './topics.service';
import { CreateTopicDto } from './dto/create-topic.dto';
import { UpdateTopicDto } from './dto/update-topic.dto';

@Controller('topics')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TopicsController {
  constructor(private readonly topicsService: TopicsService) {}

  @Get()
  list() {
    return this.topicsService.list();
  }

  @Post()
  @Role(Roles.Admin)
  create(@Body() dto: CreateTopicDto) {
    return this.topicsService.create(dto);
  }

  @Put(':id')
  @Role(Roles.Admin)
  update(@Param('id') id: string, @Body() dto: UpdateTopicDto) {
    return this.topicsService.update(Number(id), dto);
  }

  @Delete(':id')
  @Role(Roles.Admin)
  remove(@Param('id') id: string) {
    return this.topicsService.remove(Number(id));
  }
}
