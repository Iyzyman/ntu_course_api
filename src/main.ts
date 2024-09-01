import {NestFactory} from '@nestjs/core'
import {AppModule} from './app.module'
import {patchNestjsSwagger} from '@anatine/zod-nestjs'
import {Logger} from '@nestjs/common'
import {DocumentBuilder, SwaggerModule} from '@nestjs/swagger'
import {DocumentInfo, GlobalPrefix} from './core/constants/app.constants'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  app.setGlobalPrefix(GlobalPrefix)

  const config = new DocumentBuilder()
    .setTitle(DocumentInfo.title)
    .setDescription(DocumentInfo.description)
    .setVersion(DocumentInfo.version)
    .build()
  patchNestjsSwagger() // <--- This is the hacky patch using prototypes (for now)
  const document = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup('api', app, document)
  const port = process.env.PORT || 3333

  app.enableCors({
    origin: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    // allowed headers
    allowedHeaders: [
      'Content-Type',
      'Origin',
      'X-Requested-With',
      'Accept',
      'Authorization',
    ],
    // headers exposed to the client
    exposedHeaders: ['Authorization'],
    credentials: true, // Enable credentials (cookies, authorization headers) cross-origin
  })

  await app.listen(port, '0.0.0.0', () => {
    Logger.log('Listening at http://localhost:' + port + '/' + GlobalPrefix)
  })
}
bootstrap()
