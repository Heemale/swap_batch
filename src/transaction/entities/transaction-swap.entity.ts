import {Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, Unique} from 'typeorm';
import {WalletEntity} from '../../wallet/entities/wallet.entity';
import {TaskEntity} from './task.entity';
import {TransactionEntity} from "../../common/entity/transaction.entity";

@Entity('fa_transaction_swap')
@Unique(['admin_id', 'admin_special_num'])
export class TransactionSwapEntity extends TransactionEntity {

    @PrimaryGeneratedColumn({comment: 'swap记录ID'})
    id: number;

    @Column({comment: '第几次循环', default: 1})
    times: number;

    @Column({comment: '间隔时间', nullable: true})
    interval_num: number;

    @Column({comment: '执行时间', type: 'bigint', nullable: true})
    executetime: number;

    @Column({comment: '区间起始时间', type: 'bigint', default: null, nullable: true})
    rangestarttime: number;

    @Column({comment: '区间结束时间', type: 'bigint', default: null, nullable: true})
    rangeendtime: number;

    @Column({comment: 'swap转入金额', type: 'decimal', precision: 40, scale: 18, nullable: true})
    amount_in: number;

    @Column({comment: 'swap转出金额', type: 'decimal', precision: 40, scale: 18, nullable: true})
    amount_out: number;

    @Column({comment: '转入的token'})
    token_in: string;

    @Column({comment: '转出的token'})
    token_out: string;

    @Column({comment: '失败次数', nullable: false ,default : 0})
    failed_counts: number;

    @ManyToOne(() => WalletEntity, (wallet) => wallet.swap_orders)
    @JoinColumn({name: 'wallet_id'})
    wallet: WalletEntity;

    @ManyToOne(() => TaskEntity, (task) => task.swap_orders)
    @JoinColumn({name: 'task_id'})
    task: TaskEntity;

}