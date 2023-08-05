import {Column} from 'typeorm';
import {BaseEntity} from "./base.entity";

export class AdminBaseEntity extends BaseEntity {

    @Column({comment: '管理员ID'})
    admin_id: number;

}