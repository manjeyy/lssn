import { Module } from '@nestjs/common';
import { LssnsController } from './lssns.controller';
import { LssnsService } from './lssns.service';

@Module({
  controllers: [LssnsController],
  providers: [LssnsService],
})
export class LssnsModule {}
