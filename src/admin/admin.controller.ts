import {Controller} from "@nestjs/common";
import {Crud, CrudController} from "@nestjsx/crud";
import {ApiTags} from "@nestjs/swagger";
import {AdminEntity} from "./entities/admin.entity";
import {AdminService} from "./admin.service";

@Crud({
    model: {
        type: AdminEntity,
    },
})
@ApiTags('管理员')
@Controller("admins")
export class AdminController implements CrudController<AdminEntity> {
    constructor(public service: AdminService) {
    }
}