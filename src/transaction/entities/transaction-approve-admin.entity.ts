import {
    Entity,
    Column,
    PrimaryGeneratedColumn, Unique,
} from 'typeorm';
import {TransactionBaseEntity} from "../../common/entity/transaction-base.entity";

@Entity('fa_transaction_approve_admin')
export class TransactionApproveAdminEntity extends TransactionBaseEntity {

    @PrimaryGeneratedColumn({comment: '授权记录ID'})
    id: number;

    @Column({comment: '钱包地址'})
    wallet : string;

    @Column({comment: '金额', type: 'decimal', precision: 40, scale: 18, nullable: true})
    amount: number;

    @Column({comment: 'token地址'})
    token_address: string;

    @Column({comment: '使用人地址'})
    spender: string;

}