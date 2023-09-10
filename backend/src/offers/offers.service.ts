import { Injectable, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateOfferDto } from './dto/create-offer.dto';
import { Offer } from './entities/offer.entity';
import { Wish } from '../wishes/entities/wish.entity';

@Injectable()
export class OffersService {
  constructor(
    @InjectRepository(Offer)
    private offersRepository: Repository<Offer>,
    @InjectRepository(Wish)
    private wishRepository: Repository<Wish>,
  ) {}

  async create(user, createOfferDto: CreateOfferDto) {
    const wish = await this.wishRepository.findOne({
      where: { id: createOfferDto.itemId },
      relations: ['owner'],
    });
    if (user.id === wish.owner.id) {
      throw new ForbiddenException('Вы не можете поддержать свой подарок');
    }
    if (+wish.raised === +wish.price) {
      throw new ForbiddenException(
        'Нельзя скинуться на подарки, на которые уже собраны деньги',
      );
    }
    if (+wish.price - +wish.raised < createOfferDto.amount) {
      throw new ForbiddenException(
        'Вы не можете внести сумму больше стоимости подарка',
      );
    }
    wish.raised = +wish.raised + createOfferDto.amount;
    await this.wishRepository.update(wish.id, wish);

    return this.offersRepository.save({
      ...createOfferDto,
      item: wish,
      user: user,
    });
  }

  findAll() {
    return this.offersRepository.find({
      relations: {
        item: true,
        user: true,
      },
    });
  }

  findById(id: number) {
    return this.offersRepository.findOne({
      where: { id },
      relations: { user: true, item: true },
    });
  }
}
