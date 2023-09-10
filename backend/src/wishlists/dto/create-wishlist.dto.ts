import { IsArray, IsOptional, IsString, IsUrl, Length } from 'class-validator';

export class CreateWishlistDto {
  @Length(1, 250)
  @IsString()
  name: string;

  @Length(0, 1500)
  @IsOptional()
  description: string;

  @IsUrl()
  image: string;

  @IsArray()
  itemsId: number[];
}
