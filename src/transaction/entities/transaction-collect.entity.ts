import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    ManyToOne,
    JoinColumn, Unique,
} from 'typeorm';
import {WalletEntity} from '../../wallet/entities/wallet.entity';
import {TransactionEntity} from "../../common/entity/transaction.entity";

@Entity('fa_transaction_collect')
@Unique(['admin_id', 'admin_special_num'])
export class TransactionCollectEntity extends TransactionEntity {

    @PrimaryGeneratedColumn({comment: '归集记录ID'})
    id: number;

    @Column({comment: '金额', type: 'decimal', precision: 40, scale: 18, nullable: true})
    amount: number;

    @Column({comment: 'token地址'})
    token_address: string;

    @ManyToOne(() => WalletEntity, (wallet) => wallet.collect_orders)
    @JoinColumn({name: 'wallet_id'})
    wallet: WalletEntity;

}