import {Entity, Column, PrimaryGeneratedColumn} from 'typeorm';
import {BaseEntity} from "../../common/entity/base.entity";

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

}