import {Injectable} from '@nestjs/common';
import {timestamp} from '../../common/util';
import {InjectRepository} from "@nestjs/typeorm";
import {DataSource, Repository} from "typeorm";
import {TaskEntity} from "../entities/task.entity";
import {SwitchEnum, TaskStatus} from "../../common/enum";

@Injectable()
export class TaskDao {

    constructor(
        @InjectRepository(TaskEntity)
        private readonly taskEntityRepository: Repository<TaskEntity>,
        private dataSource: DataSource,
    ) {
    }

    create = async (task: TaskEntity) => {

        return await this.dataSource
            .createQueryBuilder()
            .insert()
            .into(TaskEntity)
            .values(task)
            .execute();
    }

    update_disposabletime = async (id) => {

        try {
            await this.dataSource
                .createQueryBuilder()
                .update(TaskEntity)
                .set({
                    disposabletime: timestamp(),
                    'updatetime': timestamp(),
                })
                .where('id = :id', {id})
                .execute();
        } catch (e) {
            return e;
        }
    }

    get = async (status: TaskStatus) => {

        return await this.dataSource.getRepository(TaskEntity)
            .createQueryBuilder('tasks')
            .leftJoinAndSelect('tasks.trade_pair', 'trade_pair')
            .where('status = :status', {status})
            .andWhere('swap_switch = :swap_switch', {swap_switch: SwitchEnum.OPEN})
            .andWhere('deletetime = :deletetime', {deletetime: null})
            .andWhere('disposabletime = :disposabletime', {disposabletime: null})
            .getMany();
    }

    update_status = async (id: number, status: TaskStatus) => {

        try {
            await this.dataSource
                .createQueryBuilder()
                .update(TaskEntity)
                .set({
                    status,
                    'updatetime': timestamp(),
                })
                .where('id = :id', {id})
                .execute();
        } catch (e) {
            return e;
        }
    }
}