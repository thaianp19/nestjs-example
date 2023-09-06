import { Body, Controller, Get, Post, Req } from "@nestjs/common";
import { UserService } from "./user.service";
import { CreateUserDto } from "./dto/create-user.dto";


@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('/sign-up')
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Post('/sign-in')
  auth(@Body() createUserDto: CreateUserDto){
    return this.userService.auth(createUserDto)
  }
 
}
