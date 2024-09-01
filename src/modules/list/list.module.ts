import {Module} from '@nestjs/common'
import {ListController} from './list.controller'
import {ListService} from './list.service'
import {ClerkModule} from '../clerk/clerk.module'

@Module({
  controllers: [ListController],
  imports: [ClerkModule],
  providers: [ListService],
})
export class ListModule {}
