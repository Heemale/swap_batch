import {Controller} from "@nestjs/common";
import {Crud, CrudController} from "@nestjsx/crud";
import {TaskEntity} from "./entities/task.entity";
import {TaskService} from "./task.service";
import {ApiTags} from "@nestjs/swagger";

@Crud({
    model: {
        type: TaskEntity,
    },
    query: {
        exclude: ['id'], // fix https://github.com/nestjsx/crud/issues/788
        join: {
            admin: {
                eager: true, // 使用 eager 加载关联数据
                exclude: ['id'], // fix https://github.com/nestjsx/crud/issues/788
            },
            trade_pair: {
                eager: true, // 使用 eager 加载关联数据
                exclude: ['id'], // fix https://github.com/nestjsx/crud/issues/788
            },
        },
    },
})
@ApiTags('任务')
@Controller("tasks")
export class TaskController implements CrudController<TaskEntity> {
    constructor(public service: TaskService) {
    }
}