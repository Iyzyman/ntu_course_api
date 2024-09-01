import {Module} from '@nestjs/common'
import {ClerkController} from './clerk.controller'
import {ClerkService} from './clerk.service'

@Module({
  controllers: [ClerkController],
  imports: [],
  providers: [ClerkService],
  exports: [ClerkService],
})
export class ClerkModule {}
