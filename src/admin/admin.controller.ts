import {Controller} from "@nestjs/common";
import {Crud, CrudController} from "@nestjsx/crud";
import {ApiTags} from "@nestjs/swagger";
import {AdminEntity} from "./entities/admin.entity";
import {AdminService} from "./admin.service";

@Crud({
    model: {
        type: AdminEntity,
    },
    query: {
        exclude: ['id'], // fix https://github.com/nestjsx/crud/issues/788
        join: {
            auth_group: {
                eager: true, // 使用 eager 加载关联数据
                exclude: ['id'], // fix https://github.com/nestjsx/crud/issues/788
            },
        },
    },
})
@ApiTags('管理员')
@Controller("admins")
export class AdminController implements CrudController<AdminEntity> {
    constructor(public service: AdminService) {
    }
}