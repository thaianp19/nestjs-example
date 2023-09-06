import { IsNotEmpty, IsString } from 'class-validator';

export class AuthUserDto {
  @IsString()
  @IsNotEmpty()
  access_token: string;
}
