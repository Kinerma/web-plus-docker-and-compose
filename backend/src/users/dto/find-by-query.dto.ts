import { IsString } from 'class-validator';

export class FindByDto {
  @IsString()
  query: string;
}
