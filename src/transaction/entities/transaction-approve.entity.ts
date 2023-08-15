import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    JoinColumn,
    ManyToOne,
    Unique,
} from 'typeorm';
import {WalletEntity} from '../../wallet/entities/wallet.entity';
import {TransactionBaseEntity} from "../../common/entity/transaction-base.entity";

@Entity('fa_transaction_approve')
@Unique(['token_address', 'spender', 'wallet'])
export class TransactionApproveEntity extends TransactionBaseEntity {

    @PrimaryGeneratedColumn({comment: '授权记录ID'})
    id: number;

    @Column({comment: '金额', type: 'decimal', precision: 40, scale: 18, nullable: true})
    amount: number;

    @Column({comment: 'token地址'})
    token_address: string;

    @Column({comment: '使用人地址'})
    spender: string;

    @ManyToOne(() => WalletEntity, (wallet) => wallet.approve_orders)
    @JoinColumn({name: 'wallet'})
    wallet: WalletEntity;

}