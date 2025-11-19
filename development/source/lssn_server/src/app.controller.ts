import { Controller, Get, Inject } from '@nestjs/common';
import { AppService } from './app.service';
import { type typeDB, DB } from './db/db.provider';

@Controller()
export class AppController {

  constructor(
    private readonly appService: AppService,
    @Inject(DB) private readonly db: typeDB
  ) { }

  @Get()
  async getHello(): Promise<string> {
    return this.appService.getHello();
  }
}
