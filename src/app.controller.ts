import {Controller, Get, Query, ValidationPipe} from '@nestjs/common'
import {IsNotEmpty, IsString} from 'class-validator'
import {AppService} from './app.service'

export class IName {
  @IsNotEmpty()
  @IsString()
  name: string
}

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  async getHello(
    @Query(new ValidationPipe({transform: true})) query: IName,
  ): Promise<string> {
    return this.appService.getHello(query.name)
  }
}
