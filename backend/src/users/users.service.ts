import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async userPassword(username: string) {
    const user = await this.usersRepository.findOne({
      select: [
        'id',
        'createdAt',
        'updatedAt',
        'username',
        'about',
        'avatar',
        'email',
        'password',
      ],
      where: { username: username },
    });
    if (user) {
      return user;
    }
    throw new NotFoundException('Такого пользователя не существует');
  }

  async create(payload: CreateUserDto): Promise<User> {
    const { username, email } = payload;
    if (await this.findOne({ where: [{ email }, { username }] })) {
      throw new ConflictException('Такой пользователь уже зарегистрирован');
    }
    const hash = await bcrypt.hash(payload.password, 10);
    return await this.usersRepository.save({
      ...payload,
      password: hash,
    });
  }

  async findByUsername(username: string) {
    const user = await this.usersRepository.findOne({
      where: { username: username },
    });
    if (!user) {
      throw new NotFoundException('Такого пользователя не существует');
    }
    return user;
  }

  findMany(query: FindManyOptions<User>) {
    return this.usersRepository.find(query);
  }

  findByQuery(query: string) {
    return this.findMany({
      where: [{ username: query }, { email: query }],
    });
  }

  findOne(query) {
    return this.usersRepository.findOne(query);
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const isHasUser =
      (updateUserDto?.username || updateUserDto?.email) &&
      (await this.findOne({
        where: [
          { username: updateUserDto.username },
          { email: updateUserDto.email },
        ],
      }));

    if (isHasUser) {
      throw new ConflictException('Такой пользователь уже существует');
    }
    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    }
    await this.usersRepository.update(id, updateUserDto);
    return await this.usersRepository.findOne({ where: { id } });
  }

  async getMyWishes(userId: number) {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
      relations: ['wishes'],
    });
    return user.wishes;
  }

  async getUserWishes(username: string) {
    const user = await this.usersRepository.findOne({
      where: { username },
      relations: ['wishes'],
    });

    return user.wishes;
  }
}
