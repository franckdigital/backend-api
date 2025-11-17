import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsEnum } from 'class-validator';

export enum FeedbackType {
  EMPLOYER = 'employer',
  CANDIDATE = 'candidate',
  NGO = 'ngo'
}

export class AddFeedbackDto {
  @ApiProperty({
    description: 'The feedback text',
    example: 'Great interview, candidate showed excellent technical skills.',
  })
  @IsString()
  @IsNotEmpty()
  feedback: string;

  @ApiProperty({
    description: 'Type of feedback being added',
    enum: FeedbackType,
    example: FeedbackType.EMPLOYER,
  })
  @IsEnum(FeedbackType)
  feedbackType: FeedbackType;
} 