import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    JoinColumn, ManyToOne, Unique,
} from 'typeorm';
import {WalletEntity} from '../../wallet/entities/wallet.entity';
import {AdminEntity} from "../../common/entity/admin.entity";
import {StatusEnum} from "../../common/enum";

@Entity('fa_transaction_prepare')
@Unique(['admin_id', 'admin_special_num'])
export class TransactionApproveEntity extends AdminEntity {

    @PrimaryGeneratedColumn({comment: '准备记录ID'})
    id: number;

    @Column({comment: '打款gas数量', type: 'decimal', precision: 40, scale: 18, nullable: true})
    gas_amount: number;

    @Column({comment: '打款gas交易hash', default: null})
    gas_hash: string;

    @Column({
        type: 'enum',
        enum: StatusEnum,
        default: StatusEnum.NEVER,
        comment: '打款gas状态:0=未交易,1=待交易,2=交易失败,3=待核验,4=核验失败,5=校验成功',
    })
    gas_status: StatusEnum;

    @Column({comment: 'token地址'})
    token_address: string;

    @Column({comment: '打款token数量', type: 'decimal', precision: 40, scale: 18, nullable: true})
    token_amount: number;

    @Column({comment: '打款token交易hash', default: null})
    token_hash: string;

    @Column({
        type: 'enum',
        enum: StatusEnum,
        default: StatusEnum.NEVER,
        comment: '打款token状态:0=未交易,1=待交易,2=交易失败,3=待核验,4=核验失败,5=校验成功',
    })
    token_status: StatusEnum;

    @Column({comment: '使用人地址'})
    spender: string;

    @Column({
        type: 'enum',
        enum: StatusEnum,
        default: StatusEnum.NEVER,
        comment: '授权状态:0=未交易,1=待交易,2=交易失败,3=待核验,4=核验失败,5=校验成功',
    })
    approve_status: StatusEnum;

    @ManyToOne(() => WalletEntity, (wallet) => wallet.approve_orders)
    @JoinColumn({name: 'wallet_id'})
    wallet: WalletEntity;

}