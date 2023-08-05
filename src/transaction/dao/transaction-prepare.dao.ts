import {Injectable} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import {DataSource, Repository} from "typeorm";
import {TransactionPrepareEntity} from "../entities/transaction-prepare.entity";
import {PrepareType, StatusEnum} from "../../common/enum";
import {timestamp} from "../../common/util";

@Injectable()
export class TransactionPrepareDao {

    constructor(
        @InjectRepository(TransactionPrepareEntity)
        private readonly transactionPrepareEntityRepository: Repository<TransactionPrepareEntity>,
        private dataSource: DataSource,
    ) {
    }

    create = async (order_list: Array<any>) => {
        try {
            return await this.dataSource
                .createQueryBuilder()
                .insert()
                .into(TransactionPrepareEntity)
                .values(order_list)
                .execute();
        } catch (e) {
            return e;
        }

    }

    update = async (id, status, hash, remark, prepare_type: PrepareType) => {

        let content: object;

        if (prepare_type === PrepareType.GAS) {
            content = {
                gas_status: status,
                gas_hash: hash,
                gas_remark: remark,
            }
        } else if (prepare_type === PrepareType.TOKEN) {
            content = {
                token_status: status,
                token_hash: hash,
                token_remark: remark,
            }
        } else if (prepare_type === PrepareType.APPROVE) {
            content = {
                approve_status: status,
                approve_hash: hash,
            }
        } else {
            return;
        }

        try {
            await this.dataSource
                .createQueryBuilder()
                .update(TransactionPrepareEntity)
                .set({
                    ...content,
                    updatetime: timestamp(),
                })
                .where('id = :id', {id})
                .execute();
        } catch (e) {
            return e;
        }

    }

    get = async (task_id: number): Promise<Array<TransactionPrepareEntity>> => {

        return await this.dataSource.getRepository(TransactionPrepareEntity)
            .createQueryBuilder('orders')
            .where('task = :task', {task: task_id})
            .andWhere('(gas_status = :status1 OR gas_status = :status2 OR token_status = :status1 OR token_status = :status2)', {
                status1: StatusEnum.NEVER,
                status2: StatusEnum.FAILURE
            })
            .limit(1)
            .getMany();
    }

}