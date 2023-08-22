import {Column, Entity, OneToMany, PrimaryGeneratedColumn} from "typeorm";
import {BaseEntity} from "../../common/entity/base.entity";
import {AdminEntity} from "../../admin/entities/admin.entity";

@Entity("fa_auth_group")
export class AuthGroupEntity extends BaseEntity {

  @PrimaryGeneratedColumn({comment: '分组表ID'})
  id: number;

  @Column("varchar", {
    name: "name",
    nullable: true,
    comment: "组名",
    length: 100,
  })
  name: string | null;

  @OneToMany(() => AdminEntity, (admin) => admin.auth_group)
  admins: AdminEntity[];

}
