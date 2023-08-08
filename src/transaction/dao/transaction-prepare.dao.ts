import {Injectable} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import {DataSource, Repository} from "typeorm";
import {TransactionPrepareEntity} from "../entities/transaction-prepare.entity";
import {PrepareType, StatusEnum} from "../../common/enum";
import {timestamp} from "../../common/util";
import {SubsidyUpdateDto} from "../dto/subsidy/subsidy-update.dto";

@Injectable()
export class TransactionPrepareDao {

    constructor(
        @InjectRepository(TransactionPrepareEntity)
        private readonly transactionPrepareEntityRepository: Repository<TransactionPrepareEntity>,
        private dataSource: DataSource,
    ) {
    }

    create = async (order_list) => {
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

    update = async (subsidyUpdateDto: SubsidyUpdateDto, prepare_type: PrepareType) => {

        const {id, amount, status, hash, remark} = subsidyUpdateDto;

        let content: object;

        if (prepare_type === PrepareType.GAS) {
            content = {
                gas_amount: amount,
                gas_status: status,
                gas_hash: hash,
                gas_remark: remark,
            }
        } else if (prepare_type === PrepareType.TOKEN) {
            content = {
                token_amount: amount,
                token_status: status,
                token_hash: hash,
                token_remark: remark,
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
            .where('task_id = :task_id', {task_id})
            .andWhere('(gas_status = :status1 OR gas_status = :status2 OR token_status = :status1 OR token_status = :status2)', {
                status1: StatusEnum.NEVER,
                status2: StatusEnum.FAILURE
            })
            .limit(1)
            .getMany();
    }

}