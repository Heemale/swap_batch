import {Entity, Column, PrimaryGeneratedColumn, OneToMany, JoinColumn, OneToOne} from 'typeorm';
import {TransactionSwapEntity} from '../../transaction/entities/transaction-swap.entity';
import {TransactionApproveEntity} from '../../transaction/entities/transaction-approve.entity';
import {TransactionCollectEntity} from "../../transaction/entities/transaction-collect.entity";

@Entity('fa_wallet')
export class WalletEntity {

    @PrimaryGeneratedColumn({comment: '钱包ID'})
    id: number;

    @Column({comment: '地址', nullable: true})
    address: string;

    @Column({comment: '私钥', nullable: true})
    private_key: string;

    @Column({comment: '助记词', type: 'text', nullable: true})
    mnemonic: string;

    @Column({comment: '间隔最大值', default: 180, nullable: false})
    interval_max: number;

    @Column({comment: '间隔最小值', default: 120, nullable: false})
    interval_min: number;

    @Column({comment: '创建时间', type: 'bigint', default: null, nullable: true})
    createtime: number;

    @Column({comment: '更新时间', type: 'bigint', default: null, nullable: true})
    updatetime: number;

    @OneToMany(() => TransactionApproveEntity, (approve_order) => approve_order.wallet)
    approve_orders: TransactionApproveEntity[];

    @OneToMany(() => TransactionSwapEntity, (swap_order) => swap_order.wallet)
    swap_orders: TransactionSwapEntity[];

    @OneToMany(() => TransactionCollectEntity, (collect_order) => collect_order.wallet)
    collect_orders: TransactionCollectEntity[];

}