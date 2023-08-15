import { Controller } from "@nestjs/common";
import { Crud, CrudController } from "@nestjsx/crud";
import {TaskEntity} from "./entities/task.entity";
import {TaskService} from "./task.service";
import {ApiTags} from "@nestjs/swagger";

@Crud({
    model: {
        type: TaskEntity,
    },
})
@ApiTags('任务')
@Controller("tasks")
export class TaskController implements CrudController<TaskEntity> {
    constructor(public service: TaskService) {}
}