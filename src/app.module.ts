import {Module, ValidationError, ValidationPipe} from '@nestjs/common'
import {AppController} from './app.controller'
import {AppService} from './app.service'
import {APP_FILTER, APP_PIPE} from '@nestjs/core'
import {
  AllExceptionsFilter,
  ValidationExceptionFilter,
  BadRequestExceptionFilter,
  UnauthorizedExceptionFilter,
  ForbiddenExceptionFilter,
  NotFoundExceptionFilter,
} from './core/filters'
import {ConfigModule} from '@nestjs/config'
import {NestDrizzleModule} from './modules/drizzle/drizzle.module'
import {ClerkService} from './modules/clerk/clerk.service'
import * as schema from './modules/drizzle/schema'
import {ClerkModule} from './modules/clerk/clerk.module'
import {ClerkController} from './modules/clerk/clerk.controller'
import {ListService} from './modules/list/list.service'
import {ListModule} from './modules/list/list.module'

@Module({
  imports: [
    ClerkModule,
    ListModule,
    ConfigModule.forRoot({isGlobal: true}),
    NestDrizzleModule.forRootAsync({
      useFactory: () => {
        return {
          driver: 'postgres-js',
          url: process.env.DATABASE_URL,
          options: {schema},
          migrationOptions: {migrationsFolder: './migration'},
        }
      },
    }),
  ],
  controllers: [AppController, ClerkController],
  providers: [
    AppService,
    ClerkService,
    ListService,

    {provide: APP_FILTER, useClass: AllExceptionsFilter},
    {provide: APP_FILTER, useClass: ValidationExceptionFilter},
    {provide: APP_FILTER, useClass: BadRequestExceptionFilter},
    {provide: APP_FILTER, useClass: UnauthorizedExceptionFilter},
    {provide: APP_FILTER, useClass: ForbiddenExceptionFilter},
    {provide: APP_FILTER, useClass: NotFoundExceptionFilter},
    {
      provide: APP_PIPE,
      useFactory: () =>
        new ValidationPipe({
          exceptionFactory: (errors: ValidationError[]) => {
            return errors[0]
          },
        }),
    },
  ],
})
export class AppModule {}
