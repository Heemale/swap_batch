export enum StatusEnum {
  NEVER = '0',//未打款
  FAILURE = '1',//打款失败
  CHECK_WAITING = '2',//待核验
  CHECK_FAILURE = '3',//核验失败
  CHECK_SUCCESS = '4',//校验成功
}