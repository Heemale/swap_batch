import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    JoinColumn, ManyToOne, Unique,
} from 'typeorm';
import {StatusEnum} from '../../common/enum';
import {WalletEntity} from '../../address/entities/wallet.entity';

@Entity('fa_transaction_approve')
@Unique('unique_token_wallet', ['token_address', 'wallet'])
export class TransactionApproveEntity {

    @PrimaryGeneratedColumn({comment: '授权记录ID'})
    id: number;

    @Column({comment: '订单号'})
    order_num: string;

    @Column({
        type: 'enum',
        enum: StatusEnum,
        default: StatusEnum.NEVER,
        comment: '状态:0=未交易,1=交易失败,2=待核验,3=核验失败,4=校验成功,5=待交易',
    })
    status: StatusEnum;

    @Column({comment: '金额', type: 'decimal', precision: 40, scale: 18, nullable: true})
    amount: number;

    @Column({comment: 'token地址'})
    token_address: string;

    @Column({comment: '使用人地址'})
    spender: string;

    @Column({comment: '交易hash', default: null})
    hash: string;

    @Column({comment: '备注', default: null})
    remark: string;

    @Column({comment: '创建时间', type: 'bigint', default: null, nullable: true})
    createtime: number;

    @Column({comment: '更新时间', type: 'bigint', default: null, nullable: true})
    updatetime: number;

    @ManyToOne(() => WalletEntity, (wallet) => wallet.approve_orders)
    @JoinColumn({name: 'wallet_id'})
    wallet: WalletEntity;

}