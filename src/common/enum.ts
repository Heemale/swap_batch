export enum StatusEnum {
    NEVER = '0', // 未交易
    FAILURE = '1', // 交易失败
    CHECK_WAITING = '2', //待核验
    CHECK_FAILURE = '3', //核验失败
    CHECK_SUCCESS = '4', //校验成功
    PENDING = '5', // 待交易
}

export enum TradeType {
    BUY = '0',
    SELL = '1',
}

export enum TaskStatus {
    PREPARE_ING = '0',
    PREPARE_DONE = '1',
    SWAP_ING = '2',
    SWAP_DONE = '3',
    COLLECT_ING = '4',
    COLLECT_DONE = '5',
}

export enum WalletSource {
    CREATE = '0',
    PICK = '1'
}