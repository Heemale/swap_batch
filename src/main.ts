import {NestFactory} from '@nestjs/core';
import {AppModule} from './app.module';
import {DocumentBuilder, SwaggerModule} from '@nestjs/swagger';
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
        .setTitle('swap刷量4')
        .setDescription('swap刷量4 接口文档')
        .setVersion('1.0')
        .addBearerAuth()
        .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('docs', app, document);

    // 设置跨域
    app.enableCors({
        origin: '*', // 指定允许跨域的域名
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE', // 指定允许的 HTTP 方法
        credentials: true, // 允许携带身份凭证，如 cookies
        allowedHeaders: 'Content-Type,Authorization', // 允许的请求头
    });

    await app.listen(env.PORT);
}

bootstrap();