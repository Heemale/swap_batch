import {BaseEntity, Column} from 'typeorm';
import {StatusEnum} from "../enum";

export class TransactionEntity extends BaseEntity {

    @Column({comment: '订单号'})
    order_num: string;

    @Column({
        type: 'enum',
        enum: StatusEnum,
        default: StatusEnum.NEVER,
        comment: '状态:0=未交易,1=待交易,2=交易失败,3=待核验,4=核验失败,5=校验成功',
    })
    status: StatusEnum;

    @Column({comment: '交易hash', default: null})
    hash: string;

    @Column({comment: '备注', default: null})
    remark: string;

}