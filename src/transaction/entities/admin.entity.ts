import {Column, Entity, Index, OneToMany, PrimaryGeneratedColumn} from "typeorm";
import {TaskEntity} from "./task.entity";
import {TransactionApproveAdminEntity} from "./transaction-approve-admin.entity";

@Entity("fa_admin")
export class AdminEntity {
    @PrimaryGeneratedColumn({
        type: "int",
        name: "id",
        comment: "ID",
        unsigned: true,
    })
    id: number;

    @Index("username", {unique: true})
    @Column("varchar", {
        name: "username",
        nullable: true,
        comment: "用户名",
        length: 20,
        default: "",
    })
    username: string | null;

    @Column("varchar", {
        name: "nickname",
        nullable: true,
        comment: "昵称",
        length: 50,
        default: "",
    })
    nickname: string | null;

    @Column("varchar", {
        name: "password",
        nullable: true,
        comment: "密码",
        length: 32,
        default: "",
    })
    password: string | null;

    @Column("varchar", {
        name: "salt",
        nullable: true,
        comment: "密码盐",
        length: 30,
        default: "",
    })
    salt: string | null;

    @Column("varchar", {
        name: "avatar",
        nullable: true,
        comment: "头像",
        length: 255,
        default: "",
    })
    avatar: string | null;

    @Column("varchar", {
        name: "email",
        nullable: true,
        comment: "电子邮箱",
        length: 100,
        default: "",
    })
    email: string | null;

    @Column("varchar", {
        name: "mobile",
        nullable: true,
        comment: "手机号码",
        length: 11,
        default: "",
    })
    mobile: string | null;

    @Column("tinyint", {
        name: "loginfailure",
        comment: "失败次数",
        unsigned: true,
        default: () => "'0'",
    })
    loginfailure: number;

    @Column("bigint", {name: "logintime", nullable: true, comment: "登录时间"})
    logintime: string | null;

    @Column("varchar", {
        name: "loginip",
        nullable: true,
        comment: "登录IP",
        length: 50,
    })
    loginip: string | null;

    @Column("bigint", {name: "createtime", nullable: true, comment: "创建时间"})
    createtime: string | null;

    @Column("bigint", {name: "updatetime", nullable: true, comment: "更新时间"})
    updatetime: string | null;

    @Column("varchar", {
        name: "token",
        nullable: true,
        comment: "Session标识",
        length: 59,
        default: "",
    })
    token: string | null;

    @Column("varchar", {
        name: "status",
        comment: "状态",
        length: 30,
        default: () => "'normal'",
    })
    status: string;

    @Column("varchar", {
        name: "address",
        nullable: true,
        comment: "地址",
        length: 255,
    })
    admin_address: string | null;

    @Column("varchar", {
        name: "private_key",
        nullable: true,
        comment: "私钥",
        length: 255,
    })
    admin_private_key: string | null;

    @OneToMany(() => TaskEntity, (task) => task.admin)
    tasks: TaskEntity[];

    @OneToMany(() => TransactionApproveAdminEntity, (approve_order) => approve_order.admin)
    approve_orders: TransactionApproveAdminEntity[];
}
