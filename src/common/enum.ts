export enum StatusEnum {
    NEVER = '0', // 未交易
    PENDING = '1', // 待交易
    FAILURE = '2', // 交易失败
    CHECK_WAITING = '3', //待核验
    CHECK_FAILURE = '4', //核验失败
    CHECK_SUCCESS = '5', //校验成功
}

export enum TradeType {
    BUY = '0', // 买入
    SELL = '1', // 卖出
}

export enum TaskStatus {
    PREPARE_ING = '0', // 准备中
    PREPARE_DONE = '1', // 准备完毕
    SWAP_ING = '2', // swap中
    SWAP_DONE = '3', // swap完毕
    COLLECT_ING = '4', // 归集中
    COLLECT_DONE = '5', // 归集完毕
}

export enum WalletSource {
    CREATE = '0', // 创建
    PICK = '1' // 选择
}