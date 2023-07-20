import {Column, Entity, OneToMany, PrimaryGeneratedColumn} from 'typeorm';
import {TransactionSwapEntity} from './transaction-swap.entity';

@Entity('fa_task')
export class TaskEntity {

    constructor(
        swap_switch: number,
        disposable_switch: number,
        dense_switch: number,
        range_switch: number,
        begin_num: number,
        limit_num: number,
        max_num: number,
        min_num: number,
        token_in_amount: number,
        max_price: number,
        min_price: number,
        token_in: string,
        token_out: string,
        times: number,
        rangestarttime: number,
        rangeendtime: number,
        disposabletime: number,
        createtime: number
    ) {
        this.swap_switch = swap_switch;
        this.disposable_switch = disposable_switch;
        this.dense_switch = dense_switch;
        this.range_switch = range_switch;
        this.begin_num = begin_num;
        this.limit_num = limit_num;
        this.max_num = max_num;
        this.min_num = min_num;
        this.token_in_amount = token_in_amount;
        this.max_price = max_price;
        this.min_price = min_price;
        this.token_in = token_in;
        this.token_out = token_out;
        this.times = times;
        this.rangestarttime = rangestarttime;
        this.rangeendtime = rangeendtime;
        this.disposabletime = disposabletime;
        this.createtime = createtime;
    }

    @PrimaryGeneratedColumn({comment: 'swap任务ID'})
    id: number;

    @Column({comment: '任务是否启动', type: 'tinyint', default: 0, nullable: false})
    swap_switch: number;

    @Column({comment: '是否一次性交易', type: 'tinyint', default: 0, nullable: false})
    disposable_switch: number;

    @Column({comment: '是否密集交易', type: 'tinyint', default: 0, nullable: false})
    dense_switch: number;

    @Column({comment: '是否区间交易', type: 'tinyint', default: 1, nullable: false})
    range_switch: number;

    @Column({comment: '起始编号', default: 1, nullable: false})
    begin_num: number;

    @Column({comment: '编号数量', default: 1, nullable: false})
    limit_num: number;

    @Column({comment: '交易最大值', default: 0, nullable: false})
    max_num: number;

    @Column({comment: '交易最小值', default: 0, nullable: false})
    min_num: number;

    @Column({comment: '转入的token数量（计算市值）', nullable: false})
    token_in_amount: number;

    @Column({comment: '市值最大值', type: 'decimal', precision: 40, scale: 18, nullable: false})
    max_price: number;

    @Column({comment: '市值最小值', type: 'decimal', precision: 40, scale: 18, nullable: false})
    min_price: number;

    @Column({comment: '转入的token', nullable: false})
    token_in: string;

    @Column({comment: '转出的token', nullable: false})
    token_out: string;

    @Column({comment: '循环次数', default: 1, nullable: false})
    times: number;

    @Column({comment: '区间起始时间', type: 'bigint', default: null, nullable: true})
    rangestarttime: number;

    @Column({comment: '区间结束时间', type: 'bigint', default: null, nullable: true})
    rangeendtime: number;

    @Column({comment: '一次性交易时间', type: 'bigint', default: null, nullable: true})
    disposabletime: number;

    @Column({comment: '创建时间', type: 'bigint', default: null, nullable: true})
    createtime: number;

    @Column({comment: '更新时间', type: 'bigint', default: null, nullable: true})
    updatetime: number;

    @Column({comment: '删除时间', type: 'bigint', default: null, nullable: true})
    deletetime: number;

    @OneToMany(() => TransactionSwapEntity, (swap_order) => swap_order.task)
    swap_orders: TransactionSwapEntity[];

}