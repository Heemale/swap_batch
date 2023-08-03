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

    get_admin_special_num_max = async (admin_id: number): Promise<number> => {

        const existingWallets = await this.transactionPrepareEntityRepository.find({
            where: {admin_id},
            order: {admin_special_num: 'DESC'},
            take: 1,
        });

        return existingWallets.length > 0 ? existingWallets[0].admin_special_num : 0;
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

    get = async (task): Promise<Array<TransactionPrepareEntity>> => {

        return await this.dataSource.getRepository(TransactionPrepareEntity)
            .createQueryBuilder('orders')
            .where('task = :task', {task})
            .andWhere('(status = :status1 OR status = :status2)', {
                status1: StatusEnum.NEVER,
                status2: StatusEnum.FAILURE
            })
            .getMany();
    }

}