import { Injectable, UnauthorizedException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { compare, hash } from 'bcrypt';
import { SECRET_KEY } from 'src/jwt/auth';
import * as jwt from "jsonwebtoken";

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const hashed = await hash(createUserDto.password, 10);
    const user = await this.usersRepository.create({
      email: createUserDto.email,
      password: hashed,
    });
    return await this.usersRepository.save(user);
  }

  async auth(createUserDto: CreateUserDto) {
    const user = await this.usersRepository.findOne({
      where: { email: createUserDto.email },
      relations: ['products']
    });
    if (!user) {
      throw new UnauthorizedException('unauthorized');
    }
    const isMatchPassword = await compare(
      createUserDto.password,
      user.password,
    );
    const token = jwt.sign({ id: user.id?.toString() }, SECRET_KEY ,{
      expiresIn: '2 days',
    });
    if (isMatchPassword) {
      return {
        user: user,
        token: token
      }}
       else {
      throw new UnauthorizedException('unauthorized');
    }
  }

}
