import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
} from 'typeorm';
import {StatusEnum} from '../../common/enum';

@Entity('fa_transaction_subsidy')
export class TransactionSubsidyEntity {

    @PrimaryGeneratedColumn({comment: '打款记录ID'})
    id: number;

    @Column({comment: '订单号'})
    order_num: string;

    @Column({comment: '起始编号'})
    begin_num: number;

    @Column({comment: '选取数量'})
    limit_num: number;

    @Column({
        type: 'enum',
        enum: StatusEnum,
        default: StatusEnum.NEVER,
        comment: '状态:0=未交易,1=交易失败,2=待核验,3=核验失败,4=校验成功,5=待交易',
    })
    status: StatusEnum;

    @Column({comment: '打款最大金额', type: 'decimal', precision: 40, scale: 18, nullable: true})
    value_max: number;

    @Column({comment: '打款最小金额', type: 'decimal', precision: 40, scale: 18, nullable: true})
    value_min: number;

    @Column({comment: 'token地址'})
    token_address: string;

    @Column({comment: '交易hash', default: null})
    hash: string;

    @Column({comment: '备注', default: null})
    remark: string;

    @Column({comment: '创建时间', type: 'bigint', default: null, nullable: true})
    createtime: number;

    @Column({comment: '更新时间', type: 'bigint', default: null, nullable: true})
    updatetime: number;

}