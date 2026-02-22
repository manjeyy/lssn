import { IsIn } from 'class-validator';

export class ReactionDto {
  @IsIn(['like', 'dislike'])
  reaction: 'like' | 'dislike';
}
