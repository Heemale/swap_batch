import {Controller} from "@nestjs/common";
import {Crud, CrudController} from "@nestjsx/crud";
import {ApiTags} from "@nestjs/swagger";
import {ConfigEntity} from "./entities/config.entity";
import {ConfigService} from "./config.service";

@Crud({
    model: {
        type: ConfigEntity,
    },
})
@ApiTags('配置')
@Controller("configs")
export class ConfigController implements CrudController<ConfigEntity> {
    constructor(public service: ConfigService) {
    }
}