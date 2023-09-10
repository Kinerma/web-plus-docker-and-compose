import { IsBoolean, IsNotEmpty, IsNumber, IsPositive } from 'class-validator';

export class CreateOfferDto {
  @IsPositive()
  @IsNotEmpty()
  @IsNumber()
  amount: number;

  @IsBoolean()
  @IsNotEmpty()
  hidden: boolean;

  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  itemId: number;
}
