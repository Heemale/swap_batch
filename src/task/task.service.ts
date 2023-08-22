import {Injectable} from '@nestjs/common';
import {TaskEntity} from "./entities/task.entity";
import {InjectRepository} from "@nestjs/typeorm";
import {TypeOrmCrudService} from "@nestjsx/crud-typeorm";

@Injectable()
export class TaskService extends TypeOrmCrudService<TaskEntity> {
    constructor(@InjectRepository(TaskEntity) repo) {
        super(repo);
    }
}
