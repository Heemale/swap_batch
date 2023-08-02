import {Entity, Column, PrimaryGeneratedColumn} from 'typeorm';
import {AdminEntity} from "../../common/entity/admin.entity";

@Entity('fa_admin_trade_pair')
export class AdminTradePairEntity extends AdminEntity {

    @PrimaryGeneratedColumn({comment: '开放交易对ID'})
    id: number;

    @Column({comment: '交易对ID'})
    trade_pair_id: number;

}