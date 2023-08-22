import {Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn} from 'typeorm';
import {TransactionSwapEntity} from '../../transaction/entities/transaction-swap.entity';
import {TaskStatus, TradeType, WalletSource} from "../../common/enum";
import {TradePairEntity} from "../../trade-pair/entities/trade-pair.entity";
import {TransactionPrepareEntity} from "../../transaction/entities/transaction-prepare.entity";
import {WalletEntity} from "../../wallet/entities/wallet.entity";
import {AdminEntity} from "../../admin/entities/admin.entity";
import {BaseEntity} from "../../common/entity/base.entity";
import {TransactionCollectEntity} from "../../transaction/entities/transaction-collect.entity";

@Entity('fa_task')
export class TaskEntity extends BaseEntity {

    @PrimaryGeneratedColumn({comment: 'swap任务ID'})
    id: number;

    @Column({comment: '订单号', default: null, nullable: true})
    order_num: string;

    @Column({comment: '任务是否启动', type: 'tinyint', default: 0, nullable: false})
    swap_switch: number;

    @Column({
        type: 'enum',
        enum: TaskStatus,
        default: TaskStatus.NEVER,
        comment: '状态:0=未执行,1=管理员授权中,2=管理员授权完成,3=打款中,4=打款完成,5=swap中,6=swap完成,7=归集中,8=归集完成',
    })
    status: TaskStatus;

    @Column({
        type: 'enum',
        enum: WalletSource,
        comment: '钱包来源:0=创建,1=选择',
    })
    wallet_source: WalletSource;

    @Column({comment: '创建钱包数量', default: null, nullable: true})
    wallet_create_counts: number;

    // @Column({comment: '钱包来源订单ID', default: null, nullable: true})
    // wallet_from_task_id: number;

    @Column({comment: '选择钱包起始专用编号', default: null, nullable: true})
    wallet_begin_num: number;

    @Column({comment: '选择钱包数量', default: null, nullable: true})
    wallet_limit_num: number;

    @Column({comment: '打款gas最小值', type: 'decimal', precision: 40, scale: 18, nullable: false})
    subsidy_gas_max: number;

    @Column({comment: '打款gas最大值', type: 'decimal', precision: 40, scale: 18, nullable: false})
    subsidy_gas_min: number;

    @Column({
        type: 'enum',
        enum: TradeType,
        comment: '交易类型:0=买入,1=卖出',
    })
    trade_type: TradeType;

    @Column({comment: '打款token最小值', type: 'decimal', precision: 40, scale: 18, nullable: false})
    subsidy_token_max: number;

    @Column({comment: '打款token最大值', type: 'decimal', precision: 40, scale: 18, nullable: false})
    subsidy_token_min: number;

    @Column({comment: 'swap最大值', type: 'decimal', precision: 40, scale: 18, nullable: false})
    swap_max: number;

    @Column({comment: 'swap最小值', type: 'decimal', precision: 40, scale: 18, nullable: false})
    swap_min: number;

    @Column({comment: '转入的token数量（计算市值）', nullable: false})
    token_in_amount: number;

    @Column({comment: '市值最大值', type: 'decimal', precision: 40, scale: 18, nullable: false})
    price_max: number;

    @Column({comment: '市值最小值', type: 'decimal', precision: 40, scale: 18, nullable: false})
    price_min: number;

    @Column({comment: '循环次数', default: 1, nullable: false})
    times: number;

    @Column({comment: '是否一次性交易', type: 'tinyint', default: 0, nullable: false})
    disposable_switch: number;

    @Column({comment: '是否密集交易', type: 'tinyint', default: 0, nullable: false})
    dense_switch: number;

    @Column({comment: '是否区间交易', type: 'tinyint', default: 1, nullable: false})
    range_switch: number;

    @Column({comment: '区间交易起始时间', type: 'bigint', default: null, nullable: true})
    rangestarttime: number;

    @Column({comment: '区间交易结束时间', type: 'bigint', default: null, nullable: true})
    rangeendtime: number;

    @Column({comment: '归集时间', type: 'bigint', default: null, nullable: true})
    collecttime: number;

    @Column({comment: '一次性交易时间', type: 'bigint', default: null, nullable: true})
    disposabletime: number;

    @Column({comment: '删除时间', type: 'bigint', default: null, nullable: true})
    deletetime: number;

    @OneToMany(() => WalletEntity, (wallet) => wallet.task)
    wallets: WalletEntity[];

    @OneToMany(() => TransactionPrepareEntity, (prepare_order) => prepare_order.task)
    prepare_orders: TransactionPrepareEntity[];

    @OneToMany(() => TransactionSwapEntity, (swap_order) => swap_order.task)
    swap_orders: TransactionSwapEntity[];

    @OneToMany(() => TransactionCollectEntity, (collect_order) => collect_order.task)
    collect_orders: TransactionCollectEntity[];

    @ManyToOne(() => AdminEntity, (admin) => admin.tasks)
    @JoinColumn({name: 'admin'})
    admin: AdminEntity;

    @ManyToOne(() => TradePairEntity, (trade_pair) => trade_pair.tasks)
    @JoinColumn({name: 'trade_pair'})
    trade_pair: TradePairEntity;

}