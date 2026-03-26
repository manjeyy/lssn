import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Role } from '../auth/decorators/roles.decorator';
import { Roles } from '../auth/enums/roles.enum';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { CreateLssnDto } from './dto/create-lssn.dto';
import { UpdateLssnDto } from './dto/update-lssn.dto';
import { ReactionDto } from './dto/reaction.dto';
import { LssnsService } from './lssns.service';

interface RequestWithUser extends Request {
  user: JwtPayload;
}

@Controller('lssns')
@UseGuards(JwtAuthGuard, RolesGuard)
export class LssnsController {
  constructor(private readonly lssnsService: LssnsService) {}

  @Get()
  listPublished(
    @Query('mine') mine?: string,
    @Query('all') all?: string,
    @Req() request?: RequestWithUser,
  ) {
    if (all === 'true' && request?.user?.role === Roles.Admin) {
      return this.lssnsService.listAll();
    }

    if (mine === 'true' && request?.user) {
      return this.lssnsService.listMine(request.user.sub);
    }

    return this.lssnsService.listPublished();
  }

  @Get('stats/me')
  @Role(Roles.Creator, Roles.Admin)
  stats(@Req() request: RequestWithUser) {
    return this.lssnsService.statsForUser(request.user.sub);
  }

  @Post()
  @Role(Roles.Creator, Roles.Admin)
  create(@Body() dto: CreateLssnDto, @Req() request: RequestWithUser) {
    return this.lssnsService.createLssn(request.user.sub, dto);
  }

  @Get(':id')
  getLssn(@Param('id') id: string, @Req() request: RequestWithUser) {
    return this.lssnsService.getLssn(Number(id), request.user.sub, request.user.role);
  }

  @Put(':id')
  @Role(Roles.Creator, Roles.Admin)
  update(@Param('id') id: string, @Body() dto: UpdateLssnDto, @Req() request: RequestWithUser) {
    return this.lssnsService.updateLssn(Number(id), request.user.sub, request.user.role, dto);
  }

  @Delete(':id')
  @Role(Roles.Creator, Roles.Admin)
  delete(@Param('id') id: string, @Req() request: RequestWithUser) {
    return this.lssnsService.deleteLssn(Number(id), request.user.sub, request.user.role);
  }

  @Post(':id/slides/:slideIndex/reactions')
  @Role(Roles.Viewer, Roles.Creator, Roles.Admin)
  react(
    @Param('id') id: string,
    @Param('slideIndex') slideIndex: string,
    @Body() dto: ReactionDto,
    @Req() request: RequestWithUser,
  ) {
    return this.lssnsService.reactToSlide(
      Number(id),
      Number(slideIndex),
      request.user.sub,
      dto.reaction,
    );
  }
}
