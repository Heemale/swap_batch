import {Entity, Column, PrimaryGeneratedColumn, OneToMany, Unique} from 'typeorm';
import {TransactionSwapEntity} from '../../transaction/entities/transaction-swap.entity';
import {TransactionApproveEntity} from '../../transaction/entities/transaction-approve.entity';
import {TransactionCollectEntity} from "../../transaction/entities/transaction-collect.entity";
import {BaseEntity} from "../../common/entity/base.entity";

@Entity('fa_wallet')
@Unique(['admin_id', 'admin_wallet_num'])
export class WalletEntity extends BaseEntity {

    @PrimaryGeneratedColumn({comment: '钱包ID'})
    id: number;

    @Column({comment: '钱包编号'})
    admin_wallet_num: number;

    @Column({comment: '管理员ID'})
    admin_id: number;

    @Column({comment: '来源任务ID', nullable: true})
    task_id: number;

    @Column({comment: '地址', nullable: true})
    address: string;

    @Column({comment: '私钥', nullable: true})
    private_key: string;

    @Column({comment: '助记词', type: 'text', nullable: true})
    mnemonic: string;

    @Column({comment: '交易时间间隔最大值（分钟）', default: 180, nullable: false})
    interval_max: number;

    @Column({comment: '交易时间间隔最小值（分钟）', default: 120, nullable: false})
    interval_min: number;

    @OneToMany(() => TransactionApproveEntity, (approve_order) => approve_order.wallet)
    approve_orders: TransactionApproveEntity[];

    @OneToMany(() => TransactionSwapEntity, (swap_order) => swap_order.wallet)
    swap_orders: TransactionSwapEntity[];

    @OneToMany(() => TransactionCollectEntity, (collect_order) => collect_order.wallet)
    collect_orders: TransactionCollectEntity[];

}