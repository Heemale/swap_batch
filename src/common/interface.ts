export interface env_type {
    USER_ADDRESS: string,
    PRIVATE_KEY: string,
    HTTP_PROVIDER: string,
    ROUTER_CONTRACT_ADDRESS: string,
    TRANSFER_ETH_HELPER_ADDRESS: string,
    TRANSFER_HELPER_ADDRESS: string,
    DB: {
        HOST: string,
        USERNAME: string,
        PASSWORD: string,
        DATABASE: string,
    },
    ERC20_ABI: Array<any>,
    PANCAKE_ROUTER_ABI: Array<any>,
    TRANSFER_ETH_HELPER_ABI: Array<any>,
    TRANSFER_HELPER_ABI: Array<any>,
    SWAP_SWITCH: string,
    COllECT_SWITCH: string,
    CREATE_TIME: number,
    CREATE_TIME_LAST: number,
    PORT: number,
}

export interface timesType {
    start: number,
    end: number,
    counts: number
}