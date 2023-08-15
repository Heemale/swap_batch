import {NestFactory} from '@nestjs/core';
import {AppModule} from './app.module';
import {DocumentBuilder, SwaggerModule} from '@nestjs/swagger';
import {ValidationPipe} from '@nestjs/common';
import {HttpExceptionFilter} from './common/HttpExceptionFilter';
import {TransformInterceptor} from './common/TransformInterceptor';
import {env, update_env} from './config';

async function bootstrap() {

    await update_env();

    const app = await NestFactory.create(AppModule);

    // 设置前缀、Pipe、异常过滤、数据转化
    app.setGlobalPrefix('api/v1/');
    // app.useGlobalPipes(new ValidationPipe({forbidUnknownValues: false}));
    // app.useGlobalFilters(new HttpExceptionFilter());
    // app.useGlobalInterceptors(new TransformInterceptor());

    // 设置swagger文档
    const config = new DocumentBuilder()
        .setTitle('swap刷量3')
        .setDescription('swap刷量3 接口文档')
        .setVersion('1.0')
        .addBearerAuth()
        .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('docs', app, document);

    // 设置跨域
    app.enableCors();

    await app.listen(env.PORT);
}

bootstrap();