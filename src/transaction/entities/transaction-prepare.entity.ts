import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    JoinColumn, ManyToOne, Unique,
} from 'typeorm';
import {AdminBaseEntity} from "../../common/entity/admin-base.entity";
import {StatusEnum} from "../../common/enum";
import {TaskEntity} from "./task.entity";

@Entity('fa_transaction_prepare')
export class TransactionPrepareEntity extends AdminBaseEntity {

    @PrimaryGeneratedColumn({comment: '准备记录ID'})
    id: number;

    @Column({comment: '钱包起始编号', default: null, nullable: true})
    begin_num: number;

    @Column({comment: '钱包数量', default: null, nullable: true})
    limit_num: number;

    @Column({comment: '打款gas数量', type: 'decimal', precision: 40, scale: 18, nullable: true})
    gas_amount: number;

    @Column({comment: '打款gas交易hash', default: null})
    gas_hash: string;

    @Column({comment: '打款gas交易备注', default: null})
    gas_remark: string;

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

    @Column({comment: '打款token交易备注', default: null})
    token_remark: string;

    @Column({
        type: 'enum',
        enum: StatusEnum,
        default: StatusEnum.NEVER,
        comment: '打款token状态:0=未交易,1=待交易,2=交易失败,3=待核验,4=核验失败,5=校验成功',
    })
    token_status: StatusEnum;

    @ManyToOne(() => TaskEntity, (task) => task.prepare_orders)
    @JoinColumn({name: 'task_id'})
    task: TaskEntity;

}