import {Injectable} from '@nestjs/common';
import {timestamp} from '../../common/util';
import {pool} from "../../config";
import {InjectRepository} from "@nestjs/typeorm";
import {DataSource, Repository} from "typeorm";
import {TaskEntity} from "../entities/task.entity";

@Injectable()
export class TaskDao {

    constructor(
        @InjectRepository(TaskEntity)
        private readonly taskEntityRepository: Repository<TaskEntity>,
        private dataSource: DataSource,
    ) {
    }

    async create(task: TaskEntity) {
        return await this.dataSource
            .createQueryBuilder()
            .insert()
            .into(TaskEntity)
            .values(task)
            .execute();
    }

    async update_disposabletime(task_id) {

        try {
            let values = [timestamp(), timestamp(), task_id];
            let sql = `update fa_task set disposabletime = ? , updatetime = ? where id = ?;`;
            let rows, fields;
            try {
                [rows, fields] = await pool.query(sql, [...values]);
            } catch (e) {
                console.log('update_disposabletime 异常 => ', e.message);
                return {status: -1, msg: e};
            }
            return {status: 0, msg: rows};
        } catch (e) {
            return e;
        }
    }

}

export async function get_tasks() {
    let sql = `select * from fa_task_swap where swap_switch = '1' and deletetime is null and disposabletime is null;`;
    let rows, fields;
    try {
        [rows, fields] = await pool.query(sql, []);
    } catch (e) {
        return {status: -1, msg: e};
    }
    return {status: 0, msg: rows};
}