import { Column, Entity, Index, PrimaryGeneratedColumn } from "typeorm";

@Index("name", ["name"], { unique: true })
@Entity("fa_config", { schema: "swapbatch4" })
export class ConfigEntity {
  @PrimaryGeneratedColumn({ type: "int", name: "id", unsigned: true })
  id: number;

  @Column("varchar", {
    name: "name",
    nullable: true,
    unique: true,
    comment: "变量名",
    length: 30,
  })
  name: string | null;

  @Column("varchar", {
    name: "group",
    nullable: true,
    comment: "分组",
    length: 30,
  })
  group: string | null;

  @Column("varchar", {
    name: "title",
    nullable: true,
    comment: "变量标题",
    length: 100,
  })
  title: string | null;

  @Column("varchar", {
    name: "tip",
    nullable: true,
    comment: "变量描述",
    length: 100,
  })
  tip: string | null;

  @Column("varchar", {
    name: "type",
    nullable: true,
    comment: "类型:string,text,int,bool,array,datetime,date,file",
    length: 30,
  })
  type: string | null;

  @Column("varchar", {
    name: "visible",
    nullable: true,
    comment: "可见条件",
    length: 255,
  })
  visible: string | null;

  @Column("text", { name: "value", nullable: true, comment: "变量值" })
  value: string | null;

  @Column("text", { name: "content", nullable: true, comment: "变量字典数据" })
  content: string | null;

  @Column("varchar", {
    name: "rule",
    nullable: true,
    comment: "验证规则",
    length: 100,
  })
  rule: string | null;

  @Column("varchar", {
    name: "extend",
    nullable: true,
    comment: "扩展属性",
    length: 255,
  })
  extend: string | null;

  @Column("varchar", {
    name: "setting",
    nullable: true,
    comment: "配置",
    length: 255,
  })
  setting: string | null;
}
