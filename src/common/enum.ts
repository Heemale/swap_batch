export enum StatusEnum {
    NEVER = '0', // 未交易
    FAILURE = '1', // 交易失败
    CHECK_WAITING = '2', //待核验
    CHECK_FAILURE = '3', //核验失败
    CHECK_SUCCESS = '4', //校验成功
    PENDING = '5', // 待交易
}