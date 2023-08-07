import {Injectable} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {DataSource, Repository} from 'typeorm';
import {timestamp} from '../../common/util';
import {TransactionCollectEntity} from '../entities/transaction-collect.entity';
import {CollectUpdateDto} from '../dto/collect/collect-update.dto';
import {StatusEnum} from "../../common/enum";
import {pool} from "../../config";

@Injectable()
export class TransactionCollectDao {

    constructor(
        @InjectRepository(TransactionCollectEntity)
        private readonly transactionCollectEntityRepository: Repository<TransactionCollectEntity>,
        private dataSource: DataSource,
    ) {
    }

    async create(order_list: Array<TransactionCollectEntity>) {
        try {
            return await this.dataSource
                .createQueryBuilder()
                .insert()
                .into(TransactionCollectEntity)
                .values(order_list)
                .execute()
                .then((result) => {
                    return {
                        affectedRows: result.raw.affectedRows,
                    };
                });
        } catch ({message}) {
            return message;
        }

    }

    async update(collectUpdateDto: CollectUpdateDto) {

        let {id, status, remark, hash, amount} = collectUpdateDto;

        try {
            await this.dataSource
                .createQueryBuilder()
                .update(TransactionCollectEntity)
                .set({
                    status,
                    remark,
                    hash,
                    amount,
                    'updatetime': timestamp(),
                })
                .where('id = :id', {id})
                .execute();
        } catch ({message}) {
            return message;
        }
    }

    async get_by_order_num(order_num: any) {
        return await this.dataSource.getRepository(TransactionCollectEntity)
            .createQueryBuilder('orders')
            .leftJoinAndSelect('orders.wallet', 'wallet')
            .where('order_num = :order_num', {order_num})
            .getMany();
    }

    async get_wrong() {

        let values = [
            StatusEnum.NEVER,
            StatusEnum.FAILURE,
            StatusEnum.NEVER,
            StatusEnum.FAILURE
        ];

        let sql = `
        SELECT orders.*,wallet.address,wallet.private_key FROM (
        \tSELECT * FROM (
        \t\tSELECT * FROM fa_transaction_collect
        \t\tWHERE token_address <> '' AND (status = ? OR status = ?)
        \t\tGROUP BY wallet_id
        \t\t
        \t\tUNION ALL
        \t\t
        \t\tSELECT * FROM fa_transaction_collect
        \t\tWHERE token_address = '' AND (status = ? OR status = ?)
        \t\tGROUP BY wallet_id
        \t\t
        \t) t1
        \tGROUP BY wallet_id) orders
        LEFT JOIN fa_wallet wallet
        ON orders.wallet_id = wallet.id;
        `

        let [rows,] = await pool.query(sql, [...values]);
        return rows
    }

}