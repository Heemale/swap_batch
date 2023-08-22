import {Controller} from "@nestjs/common";
import {Crud, CrudController} from "@nestjsx/crud";
import {ApiTags} from "@nestjs/swagger";
import {AuthGroupEntity} from "./entities/auth-group.entity";
import {AuthGroupService} from "./auth-group.service";

@Crud({
    model: {
        type: AuthGroupEntity,
    },
    query: {
        exclude: ['id'], // fix https://github.com/nestjsx/crud/issues/788
    },
})
@ApiTags('分组')
@Controller("auth-groups")
export class AuthGroupController implements CrudController<AuthGroupEntity> {
    constructor(public service: AuthGroupService) {
    }
}