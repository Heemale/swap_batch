import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    ManyToOne,
    JoinColumn
} from 'typeorm';
import {WalletEntity} from '../../wallet/entities/wallet.entity';
import {TransactionBaseEntity} from "../../common/entity/transaction-base.entity";
import {TaskEntity} from "../../task/entities/task.entity";

@Entity('fa_transaction_collect')
export class TransactionCollectEntity extends TransactionBaseEntity {

    @PrimaryGeneratedColumn({comment: '归集记录ID'})
    id: number;

    @Column({comment: '金额', type: 'decimal', precision: 40, scale: 18, nullable: true})
    amount: number;

    @Column({comment: 'token地址'})
    token_address: string;

    @ManyToOne(() => WalletEntity, (wallet) => wallet.collect_orders)
    @JoinColumn({name: 'wallet'})
    wallet: WalletEntity;

    @ManyToOne(() => TaskEntity, (task) => task.collect_orders)
    @JoinColumn({name: 'task'})
    task:TaskEntity;

}