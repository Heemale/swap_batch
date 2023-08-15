import {
    Entity,
    Column,
    PrimaryGeneratedColumn, ManyToOne, JoinColumn, Unique,
} from 'typeorm';
import {BaseEntity} from "../../common/entity/base.entity";
import {WalletEntity} from "../../wallet/entities/wallet.entity";

@Entity('fa_balance')
@Unique(['wallet', 'token_address'])
export class BalanceEntity extends BaseEntity {

    @PrimaryGeneratedColumn({comment: '余额信息ID'})
    id: number;

    @Column("varchar", {
        nullable: true,
        comment: "token地址",
        length: 42,
        default: null,
    })
    token_address: string;

    @Column({comment: '余额', type: 'decimal', precision: 40, scale: 18, nullable: true})
    balance: number;

    @ManyToOne(() => WalletEntity, (wallet) => wallet.balances)
    @JoinColumn({name: 'wallet_id'})
    wallet: WalletEntity;

}