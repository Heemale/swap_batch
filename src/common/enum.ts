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
    NEVER = '0', //未执行
    PREPARE_ING = '1', // 准备中
    PREPARE_DONE = '2', // 准备完毕
    SWAP_ING = '3', // swap中
    SWAP_DONE = '4', // swap完毕
    COLLECT_ING = '5', // 归集中
    COLLECT_DONE = '6', // 归集完毕
}

export enum WalletSource {
    CREATE = '0', // 创建
    PICK = '1' // 选择
}

export enum PrepareType {
    GAS = '0', // 打款gas
    TOKEN = '1', // 打款token
    APPROVE = '2' // 授权
}

export enum SwitchEnum {
    CLOSE = '0', // 关闭
    OPEN = '1' // 打开
}