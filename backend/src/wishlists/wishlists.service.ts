import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateWishlistDto } from './dto/create-wishlist.dto';
import { Wishlist } from './entities/wishlist.entity';

@Injectable()
export class WishlistsService {
  constructor(
    @InjectRepository(Wishlist)
    private readonly wishlistRepository: Repository<Wishlist>,
  ) {}

  create(createWishlistDto: CreateWishlistDto, ownerId: number) {
    const { itemsId, ...rest } = createWishlistDto;
    const items = itemsId.map((id) => ({ id }));
    const wishList = this.wishlistRepository.create({
      ...rest,
      items,
      owner: { id: ownerId },
    });
    return this.wishlistRepository.save(wishList);
  }

  async findAll() {
    const wishlists = await this.wishlistRepository.find({
      relations: ['owner', 'items'],
    });
    if (!wishlists) {
      throw new NotFoundException('Списки подарков не найдены');
    }
    return wishlists;
  }

  async findById(id: number) {
    const wishlist = await this.wishlistRepository.findOne({
      relations: ['owner', 'items'],
      where: { id: id },
    });

    if (wishlist) {
      return wishlist;
    }
    throw new NotFoundException('Список подарков не найдены');
  }

  async remove(userId: number, wishlistId: number) {
    const wishlist = await this.findById(wishlistId);
    if (userId !== wishlist.owner.id) {
      throw new ForbiddenException('Вы не можете удалить чужую коллекцию');
    }
    return this.wishlistRepository.delete(wishlistId);
  }
}
