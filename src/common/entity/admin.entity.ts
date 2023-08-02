import {Column} from 'typeorm';
import {BaseEntity} from "./base.entity";

export class AdminEntity extends BaseEntity {

    @Column({comment: '管理员ID'})
    admin_id: number;

    @Column({comment: '编号'})
    admin_special_num: number;

}