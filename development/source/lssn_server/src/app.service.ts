import { Inject, Injectable } from '@nestjs/common';
import { DB, type typeDB } from './db/db.provider';

@Injectable()
export class AppService {

  constructor(
    @Inject(DB) private readonly db: typeDB
  ) { }

  async getHello(): Promise<string> {
    return 'Hello World!';
  }
}
