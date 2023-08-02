import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    JoinColumn, ManyToOne, Unique,
} from 'typeorm';
import {WalletEntity} from '../../wallet/entities/wallet.entity';
import {TransactionEntity} from "../../common/entity/transaction.entity";

@Entity('fa_transaction_approve')
@Unique('unique_token_wallet', ['token_address', 'wallet'])
@Unique(['admin_id', 'admin_special_num'])
export class TransactionApproveEntity extends TransactionEntity {

    @PrimaryGeneratedColumn({comment: '授权记录ID'})
    id: number;

    @Column({comment: '金额', type: 'decimal', precision: 40, scale: 18, nullable: true})
    amount: number;

    @Column({comment: 'token地址'})
    token_address: string;

    @Column({comment: '使用人地址'})
    spender: string;

    @ManyToOne(() => WalletEntity, (wallet) => wallet.approve_orders)
    @JoinColumn({name: 'wallet_id'})
    wallet: WalletEntity;

}