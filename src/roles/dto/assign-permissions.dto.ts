
import {
  IsArray,
  IsInt,
  IsNotEmpty,
  Min,
} from 'class-validator';

export class AssignPermissionsDto {
  @IsArray()
  @IsInt({ each: true })
  @Min(1, { each: true })
  permissionIds: number[];
}