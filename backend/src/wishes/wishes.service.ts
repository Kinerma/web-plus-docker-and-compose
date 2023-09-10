import { Wish } from './entities/wish.entity';
import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateWishDto } from './dto/create-wish.dto';
import { UpdateWishDto } from './dto/update-wish.dto';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class WishesService {
  constructor(
    @InjectRepository(Wish)
    private readonly wishRepository: Repository<Wish>,
  ) {}

  async create(user: User, createWishDto: CreateWishDto) {
    return await this.wishRepository.save({
      ...createWishDto,
      owner: user,
    });
  }

  findLastWishes() {
    return this.wishRepository.find({
      order: { createdAt: 'DESC' },
      skip: 0,
      take: 40,
    });
  }

  findTopWishes() {
    return this.wishRepository.find({
      order: { copied: 'DESC' },
      skip: 10,
      take: 10,
    });
  }

  async findById(id: number) {
    const wish = await this.wishRepository.findOne({
      where: { id: id },
      relations: ['owner', 'offers'],
    });
    if (wish) {
      return wish;
    }
    throw new NotFoundException('Такого подарка не существует');
  }

  async update(userId: number, wishId: number, updateWishDto: UpdateWishDto) {
    const wish = await this.findById(wishId);
    if (userId !== wish.owner.id) {
      throw new ForbiddenException('Вы не можете изменить чужой подарок');
    }
    if (wish.raised !== 0) {
      throw new ForbiddenException(
        'Нельзя изменять стоимость подарка, если уже есть желающие скинуться',
      );
    }
    return this.wishRepository.update(wishId, updateWishDto);
  }

  async remove(userId: number, wishId: number) {
    const wish = await this.findById(wishId);
    if (userId !== wish.owner.id) {
      throw new ForbiddenException('Нельзя удалять чужие подарки');
    }
    return await this.wishRepository.delete(wishId);
  }

  async copy(user: User, wishId: number) {
    const wish = await this.findById(wishId);
    const wishCopy = {
      name: wish.name,
      image: wish.image,
      link: wish.link,
      price: wish.price,
      description: wish.description,
    };
    const hasCopy = !!(await this.wishRepository.findOne({
      where: {
        name: wish.name,
        link: wish.link,
        price: wish.price,
        owner: { id: user.id },
      },
      relations: { owner: true },
    }));
    if (hasCopy) {
      throw new ForbiddenException('Вы уже добавили себе этот подарок');
    }
    await this.wishRepository.update(wishId, { copied: wish.copied + 1 });
    return this.create(user, wishCopy);
  }
}
