import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

import { TaskStatus } from '../../generated/prisma/enums.js';

export class TaskQueryDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus;

  @IsOptional()
  @IsString()
  search?: string;
}