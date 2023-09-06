import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateProductDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  access_token: string;
}
