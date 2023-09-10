import {
  IsString,
  IsEmail,
  IsUrl,
  IsOptional,
  Length,
  NotEquals,
} from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @NotEquals('')
  @Length(2, 30)
  username: string;

  @IsOptional()
  @IsEmail()
  @NotEquals('')
  email: string;

  @IsOptional()
  @IsString()
  @NotEquals('')
  password: string;

  @IsOptional()
  @IsString()
  @IsUrl()
  avatar: string;

  @IsOptional()
  @IsString()
  @Length(2, 200)
  about: string;
}
