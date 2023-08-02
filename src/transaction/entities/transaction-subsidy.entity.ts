import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
} from 'typeorm';
import {TransactionEntity} from "../../common/entity/transaction.entity";

@Entity('fa_transaction_subsidy')
export class TransactionSubsidyEntity extends TransactionEntity {

    @PrimaryGeneratedColumn({comment: '打款记录ID'})
    id: number;

    @Column({comment: '起始编号'})
    begin_num: number;

    @Column({comment: '选取数量'})
    limit_num: number;

    @Column({comment: '打款最大金额', type: 'decimal', precision: 40, scale: 18, nullable: true})
    value_max: number;

    @Column({comment: '打款最小金额', type: 'decimal', precision: 40, scale: 18, nullable: true})
    value_min: number;

    @Column({comment: 'token地址'})
    token_address: string;

}