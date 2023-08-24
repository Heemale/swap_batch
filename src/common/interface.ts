export interface env_type {
    HTTP_PROVIDER: string,
    ROUTER_ADDRESS: string,
    TRANSFER_ETH_HELPER_ADDRESS: string,
    TRANSFER_HELPER_ADDRESS: string,
    ERC20_ABI: Array<any>,
    ROUTER_ABI: Array<any>,
    TRANSFER_ETH_HELPER_ABI: Array<any>,
    TRANSFER_HELPER_ABI: Array<any>,
    DB: {
        HOST: string,
        USERNAME: string,
        PASSWORD: string,
        DATABASE: string,
    },
    SWAP_SWITCH: number,
    CREATE_TIME: number,
    CREATE_TIME_LAST: number,
    PORT: number,
}

export interface timesType {
    start: number,
    end: number,
    counts: number
}