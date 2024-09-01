import {createZodDto} from '@anatine/zod-nestjs'
import {Clerk} from '@clerk/backend'
import {User} from '@clerk/clerk-sdk-node'
import {ClerkClient} from '@clerk/clerk-sdk-node/dist/types/types'
import {Injectable, Logger} from '@nestjs/common'
import * as dotenv from 'dotenv'
import {Webhook} from 'svix'
import {z} from 'zod'
dotenv.config()

export const GetUserById = z.object({
  id: z.string().min(1),
})
export class GetUserByIdDTO extends createZodDto(GetUserById) {}

export const GetUserByUsername = z.object({
  username: z.string().min(1).trim(),
})
export class GetUserByUsernameDTO extends createZodDto(GetUserByUsername) {}

export const GetAllUsers = z
  .object({
    username: z.string().array().optional(),

    limit: z.number().default(10).optional(),
    offset: z.number().default(0).optional(),
  })
  .optional()
export class GetAllUsersDTO extends createZodDto(GetAllUsers) {}

@Injectable()
export class ClerkService {
  public client: ClerkClient
  public webhook: Webhook

  constructor() {
    const CLERK_SECRET_KEY = process.env.CLERK_SECRET_KEY
    const CLERK_WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET

    if (CLERK_SECRET_KEY) {
      this.client = Clerk({
        secretKey: process.env.CLERK_SECRET_KEY,
      })
    }
    if (CLERK_WEBHOOK_SECRET) {
      this.webhook = new Webhook(process.env.CLERK_WEBHOOK_SECRET)
    }
  }

  async getUserByUsername(params: GetUserByUsernameDTO) {
    Logger.log(`ClerkService/isValidUsername`, params)
    const users = await this.client.users.getUserList(
      GetAllUsers.parse({
        username: [params.username],
      }),
    )

    let user: User = undefined
    if (users.length) user = users[0]
    return user
  }
}
