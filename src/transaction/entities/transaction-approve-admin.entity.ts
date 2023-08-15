import {
    Entity,
    Column,
    PrimaryGeneratedColumn, Unique, ManyToOne, JoinColumn,
} from 'typeorm';
import {TransactionBaseEntity} from "../../common/entity/transaction-base.entity";
import {AdminEntity} from "../../admin/entities/admin.entity";

@Entity('fa_transaction_approve_admin')
@Unique(['token_address', 'spender', 'admin'])
export class TransactionApproveAdminEntity extends TransactionBaseEntity {

    @PrimaryGeneratedColumn({comment: '授权记录ID'})
    id: number;

    @Column({comment: '金额', type: 'decimal', precision: 40, scale: 18, nullable: true})
    amount: number;

    @Column({comment: 'token地址'})
    token_address: string;

    @Column({comment: '使用人地址'})
    spender: string;

    @ManyToOne(() => AdminEntity, (admin) => admin.approve_orders)
    @JoinColumn({name: 'admin'})
    admin: AdminEntity;

}