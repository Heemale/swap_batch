import {Entity, Column, PrimaryGeneratedColumn, OneToMany} from 'typeorm';
import {BaseEntity} from "../../common/entity/base.entity";
import {TaskEntity} from "../../task/entities/task.entity";

@Entity('fa_trade_pair')
export class TradePairEntity extends BaseEntity {

    @PrimaryGeneratedColumn({comment: '交易对ID'})
    id: number;

    @Column({comment: 'token0地址'})
    token0_address: string;

    @Column({comment: 'token1地址'})
    token1_address: string;

    @Column({comment: 'token0名称'})
    token0_name: string;

    @Column({comment: 'token1名称'})
    token1_name: string;

    @Column({comment: '是否开放', type: 'tinyint', default: 0, nullable: false})
    open_switch: number;

    @Column({comment: '每次提交交易数', default: 0, nullable: false})
    limits: number;

    @OneToMany(() => TaskEntity, (task) => task.trade_pair)
    tasks: TaskEntity[];

}