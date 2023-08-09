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
            .leftJoinAndSelect('tasks.admin', 'admin')
            .where('tasks.status = :status', {status})
            .andWhere('swap_switch = :swap_switch', {swap_switch: SwitchEnum.OPEN})
            .andWhere('deletetime is :deletetime', {deletetime: null})
            .andWhere('disposabletime is :disposabletime', {disposabletime: null})
            .getMany();
    }


    get_collect = async () => {
        return await this.dataSource.getRepository(TaskEntity)
            .createQueryBuilder('tasks')
            .leftJoinAndSelect('tasks.admin', 'admin')
            .leftJoinAndSelect('tasks.trade_pair', 'trade_pair')
            .where('tasks.collecttime <= :timestamp', {timestamp: timestamp()})
            .andWhere('(tasks.status != :status1 AND tasks.status != :status2)', {
                status1: TaskStatus.COLLECT_ING,
                status2: TaskStatus.COLLECT_DONE
            })
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