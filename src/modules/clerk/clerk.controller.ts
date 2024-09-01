import {ZodValidationPipe} from '@anatine/zod-nestjs'
import {Body, Controller, Get, Post, Query, UsePipes} from '@nestjs/common'
import {ApiCreatedResponse, ApiTags} from '@nestjs/swagger'
import {
  ClerkService,
  GetAllUsersDTO,
  GetUserByUsernameDTO,
} from './clerk.service'

@Controller('clerk')
@ApiTags('clerk')
@UsePipes(ZodValidationPipe)
export class ClerkController {
  constructor(private readonly clerkService: ClerkService) {}

  @Get('user/all')
  async getAllUsers() {
    return this.clerkService.client.users.getUserList()
  }

  @Post('user/all')
  async searchUsers(@Body() params?: GetAllUsersDTO) {
    return this.clerkService.client.users.getUserList(params)
  }

  @Get('user')
  @ApiCreatedResponse({
    type: GetUserByUsernameDTO,
  })
  async getUserByUsername(@Query() params: GetUserByUsernameDTO) {
    return this.clerkService.getUserByUsername(params)
  }

  // @Get('user')
  // @ApiCreatedResponse({
  //   type: GetUserByIdDTO,
  // })
  // async getUserById(@Query() params: GetUserByIdDTO) {
  //   return this.clerkService.client.users.getUser(params.id)
  // }
}
