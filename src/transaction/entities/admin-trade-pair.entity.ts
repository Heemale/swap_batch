import {Entity, Column, PrimaryGeneratedColumn} from 'typeorm';
import {BaseEntity} from "../../common/entity/base.entity";

@Entity('fa_admin_trade_pair')
export class AdminTradePairEntity extends BaseEntity {

    @PrimaryGeneratedColumn({comment: '开放交易对ID'})
    id: number;

    @Column({comment: '管理员ID'})
    admin_id: number;

    @Column({comment: '交易对ID'})
    trade_pair_id: number;

}