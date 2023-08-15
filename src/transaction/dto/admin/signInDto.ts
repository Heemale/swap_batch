import {ApiProperty} from '@nestjs/swagger';

export class SignInDto {

    constructor(username: string, password: string) {
        this.username = username;
        this.password = password;
    }

    @ApiProperty({description: '用户名'})
    username: string;

    @ApiProperty({description: '密码'})
    password: string;

}