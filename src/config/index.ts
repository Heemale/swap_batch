import {env_type} from "../common/interface";

const mysql = require('mysql2/promise');
import "dotenv/config";

const DB_HOST = process.env.DB_HOST || "localhost";
const DB_USERNAME = process.env.DB_USERNAME || "root";
const DB_PASSWORD = process.env.DB_PASSWORD || "root";
const DB_DATABASE = process.env.DB_DATABASE || "swapbatch3";
const PORT = parseInt(process.env.PORT) || 3000;

export let env: env_type = {
    HTTP_PROVIDER: '',
    ROUTER_ADDRESS: '',
    TRANSFER_ETH_HELPER_ADDRESS: '',
    TRANSFER_HELPER_ADDRESS: '',
    ERC20_ABI: [
        {
            'inputs': [
                {
                    'internalType': 'uint256',
                    'name': 'initialSupply',
                    'type': 'uint256',
                },
            ],
            'stateMutability': 'nonpayable',
            'type': 'constructor',
        },
        {
            'anonymous': false,
            'inputs': [
                {
                    'indexed': true,
                    'internalType': 'address',
                    'name': 'owner',
                    'type': 'address',
                },
                {
                    'indexed': true,
                    'internalType': 'address',
                    'name': 'spender',
                    'type': 'address',
                },
                {
                    'indexed': false,
                    'internalType': 'uint256',
                    'name': 'value',
                    'type': 'uint256',
                },
            ],
            'name': 'Approval',
            'type': 'event',
        },
        {
            'anonymous': false,
            'inputs': [
                {
                    'indexed': true,
                    'internalType': 'address',
                    'name': 'from',
                    'type': 'address',
                },
                {
                    'indexed': true,
                    'internalType': 'address',
                    'name': 'to',
                    'type': 'address',
                },
                {
                    'indexed': false,
                    'internalType': 'uint256',
                    'name': 'value',
                    'type': 'uint256',
                },
            ],
            'name': 'Transfer',
            'type': 'event',
        },
        {
            'inputs': [
                {
                    'internalType': 'address',
                    'name': 'owner',
                    'type': 'address',
                },
                {
                    'internalType': 'address',
                    'name': 'spender',
                    'type': 'address',
                },
            ],
            'name': 'allowance',
            'outputs': [
                {
                    'internalType': 'uint256',
                    'name': '',
                    'type': 'uint256',
                },
            ],
            'stateMutability': 'view',
            'type': 'function',
        },
        {
            'inputs': [
                {
                    'internalType': 'address',
                    'name': 'spender',
                    'type': 'address',
                },
                {
                    'internalType': 'uint256',
                    'name': 'amount',
                    'type': 'uint256',
                },
            ],
            'name': 'approve',
            'outputs': [
                {
                    'internalType': 'bool',
                    'name': '',
                    'type': 'bool',
                },
            ],
            'stateMutability': 'nonpayable',
            'type': 'function',
        },
        {
            'inputs': [
                {
                    'internalType': 'address',
                    'name': 'account',
                    'type': 'address',
                },
            ],
            'name': 'balanceOf',
            'outputs': [
                {
                    'internalType': 'uint256',
                    'name': '',
                    'type': 'uint256',
                },
            ],
            'stateMutability': 'view',
            'type': 'function',
        },
        {
            'inputs': [],
            'name': 'decimals',
            'outputs': [
                {
                    'internalType': 'uint8',
                    'name': '',
                    'type': 'uint8',
                },
            ],
            'stateMutability': 'view',
            'type': 'function',
        },
        {
            'inputs': [
                {
                    'internalType': 'address',
                    'name': 'spender',
                    'type': 'address',
                },
                {
                    'internalType': 'uint256',
                    'name': 'subtractedValue',
                    'type': 'uint256',
                },
            ],
            'name': 'decreaseAllowance',
            'outputs': [
                {
                    'internalType': 'bool',
                    'name': '',
                    'type': 'bool',
                },
            ],
            'stateMutability': 'nonpayable',
            'type': 'function',
        },
        {
            'inputs': [
                {
                    'internalType': 'address',
                    'name': 'spender',
                    'type': 'address',
                },
                {
                    'internalType': 'uint256',
                    'name': 'addedValue',
                    'type': 'uint256',
                },
            ],
            'name': 'increaseAllowance',
            'outputs': [
                {
                    'internalType': 'bool',
                    'name': '',
                    'type': 'bool',
                },
            ],
            'stateMutability': 'nonpayable',
            'type': 'function',
        },
        {
            'inputs': [],
            'name': 'name',
            'outputs': [
                {
                    'internalType': 'string',
                    'name': '',
                    'type': 'string',
                },
            ],
            'stateMutability': 'view',
            'type': 'function',
        },
        {
            'inputs': [],
            'name': 'symbol',
            'outputs': [
                {
                    'internalType': 'string',
                    'name': '',
                    'type': 'string',
                },
            ],
            'stateMutability': 'view',
            'type': 'function',
        },
        {
            'inputs': [],
            'name': 'totalSupply',
            'outputs': [
                {
                    'internalType': 'uint256',
                    'name': '',
                    'type': 'uint256',
                },
            ],
            'stateMutability': 'view',
            'type': 'function',
        },
        {
            'inputs': [
                {
                    'internalType': 'address',
                    'name': 'to',
                    'type': 'address',
                },
                {
                    'internalType': 'uint256',
                    'name': 'amount',
                    'type': 'uint256',
                },
            ],
            'name': 'transfer',
            'outputs': [
                {
                    'internalType': 'bool',
                    'name': '',
                    'type': 'bool',
                },
            ],
            'stateMutability': 'nonpayable',
            'type': 'function',
        },
        {
            'inputs': [
                {
                    'internalType': 'address',
                    'name': 'from',
                    'type': 'address',
                },
                {
                    'internalType': 'address',
                    'name': 'to',
                    'type': 'address',
                },
                {
                    'internalType': 'uint256',
                    'name': 'amount',
                    'type': 'uint256',
                },
            ],
            'name': 'transferFrom',
            'outputs': [
                {
                    'internalType': 'bool',
                    'name': '',
                    'type': 'bool',
                },
            ],
            'stateMutability': 'nonpayable',
            'type': 'function',
        },
    ],
    ROUTER_ABI: [
        {
            'inputs': [
                {
                    'internalType': 'address',
                    'name': '_factory',
                    'type': 'address',
                },
                {
                    'internalType': 'address',
                    'name': '_WETH',
                    'type': 'address',
                },
            ],
            'stateMutability': 'nonpayable',
            'type': 'constructor',
        },
        {
            'inputs': [],
            'name': 'WETH',
            'outputs': [
                {
                    'internalType': 'address',
                    'name': '',
                    'type': 'address',
                },
            ],
            'stateMutability': 'view',
            'type': 'function',
        },
        {
            'inputs': [
                {
                    'internalType': 'address',
                    'name': 'tokenA',
                    'type': 'address',
                },
                {
                    'internalType': 'address',
                    'name': 'tokenB',
                    'type': 'address',
                },
                {
                    'internalType': 'uint256',
                    'name': 'amountADesired',
                    'type': 'uint256',
                },
                {
                    'internalType': 'uint256',
                    'name': 'amountBDesired',
                    'type': 'uint256',
                },
                {
                    'internalType': 'uint256',
                    'name': 'amountAMin',
                    'type': 'uint256',
                },
                {
                    'internalType': 'uint256',
                    'name': 'amountBMin',
                    'type': 'uint256',
                },
                {
                    'internalType': 'address',
                    'name': 'to',
                    'type': 'address',
                },
                {
                    'internalType': 'uint256',
                    'name': 'deadline',
                    'type': 'uint256',
                },
            ],
            'name': 'addLiquidity',
            'outputs': [
                {
                    'internalType': 'uint256',
                    'name': 'amountA',
                    'type': 'uint256',
                },
                {
                    'internalType': 'uint256',
                    'name': 'amountB',
                    'type': 'uint256',
                },
                {
                    'internalType': 'uint256',
                    'name': 'liquidity',
                    'type': 'uint256',
                },
            ],
            'stateMutability': 'nonpayable',
            'type': 'function',
        },
        {
            'inputs': [
                {
                    'internalType': 'address',
                    'name': 'token',
                    'type': 'address',
                },
                {
                    'internalType': 'uint256',
                    'name': 'amountTokenDesired',
                    'type': 'uint256',
                },
                {
                    'internalType': 'uint256',
                    'name': 'amountTokenMin',
                    'type': 'uint256',
                },
                {
                    'internalType': 'uint256',
                    'name': 'amountETHMin',
                    'type': 'uint256',
                },
                {
                    'internalType': 'address',
                    'name': 'to',
                    'type': 'address',
                },
                {
                    'internalType': 'uint256',
                    'name': 'deadline',
                    'type': 'uint256',
                },
            ],
            'name': 'addLiquidityETH',
            'outputs': [
                {
                    'internalType': 'uint256',
                    'name': 'amountToken',
                    'type': 'uint256',
                },
                {
                    'internalType': 'uint256',
                    'name': 'amountETH',
                    'type': 'uint256',
                },
                {
                    'internalType': 'uint256',
                    'name': 'liquidity',
                    'type': 'uint256',
                },
            ],
            'stateMutability': 'payable',
            'type': 'function',
        },
        {
            'inputs': [],
            'name': 'factory',
            'outputs': [
                {
                    'internalType': 'address',
                    'name': '',
                    'type': 'address',
                },
            ],
            'stateMutability': 'view',
            'type': 'function',
        },
        {
            'inputs': [
                {
                    'internalType': 'uint256',
                    'name': 'amountOut',
                    'type': 'uint256',
                },
                {
                    'internalType': 'uint256',
                    'name': 'reserveIn',
                    'type': 'uint256',
                },
                {
                    'internalType': 'uint256',
                    'name': 'reserveOut',
                    'type': 'uint256',
                },
            ],
            'name': 'getAmountIn',
            'outputs': [
                {
                    'internalType': 'uint256',
                    'name': 'amountIn',
                    'type': 'uint256',
                },
            ],
            'stateMutability': 'pure',
            'type': 'function',
        },
        {
            'inputs': [
                {
                    'internalType': 'uint256',
                    'name': 'amountIn',
                    'type': 'uint256',
                },
                {
                    'internalType': 'uint256',
                    'name': 'reserveIn',
                    'type': 'uint256',
                },
                {
                    'internalType': 'uint256',
                    'name': 'reserveOut',
                    'type': 'uint256',
                },
            ],
            'name': 'getAmountOut',
            'outputs': [
                {
                    'internalType': 'uint256',
                    'name': 'amountOut',
                    'type': 'uint256',
                },
            ],
            'stateMutability': 'pure',
            'type': 'function',
        },
        {
            'inputs': [
                {
                    'internalType': 'uint256',
                    'name': 'amountOut',
                    'type': 'uint256',
                },
                {
                    'internalType': 'address[]',
                    'name': 'path',
                    'type': 'address[]',
                },
            ],
            'name': 'getAmountsIn',
            'outputs': [
                {
                    'internalType': 'uint256[]',
                    'name': 'amounts',
                    'type': 'uint256[]',
                },
            ],
            'stateMutability': 'view',
            'type': 'function',
        },
        {
            'inputs': [
                {
                    'internalType': 'uint256',
                    'name': 'amountIn',
                    'type': 'uint256',
                },
                {
                    'internalType': 'address[]',
                    'name': 'path',
                    'type': 'address[]',
                },
            ],
            'name': 'getAmountsOut',
            'outputs': [
                {
                    'internalType': 'uint256[]',
                    'name': 'amounts',
                    'type': 'uint256[]',
                },
            ],
            'stateMutability': 'view',
            'type': 'function',
        },
        {
            'inputs': [
                {
                    'internalType': 'uint256',
                    'name': 'amountA',
                    'type': 'uint256',
                },
                {
                    'internalType': 'uint256',
                    'name': 'reserveA',
                    'type': 'uint256',
                },
                {
                    'internalType': 'uint256',
                    'name': 'reserveB',
                    'type': 'uint256',
                },
            ],
            'name': 'quote',
            'outputs': [
                {
                    'internalType': 'uint256',
                    'name': 'amountB',
                    'type': 'uint256',
                },
            ],
            'stateMutability': 'pure',
            'type': 'function',
        },
        {
            'inputs': [
                {
                    'internalType': 'address',
                    'name': 'tokenA',
                    'type': 'address',
                },
                {
                    'internalType': 'address',
                    'name': 'tokenB',
                    'type': 'address',
                },
                {
                    'internalType': 'uint256',
                    'name': 'liquidity',
                    'type': 'uint256',
                },
                {
                    'internalType': 'uint256',
                    'name': 'amountAMin',
                    'type': 'uint256',
                },
                {
                    'internalType': 'uint256',
                    'name': 'amountBMin',
                    'type': 'uint256',
                },
                {
                    'internalType': 'address',
                    'name': 'to',
                    'type': 'address',
                },
                {
                    'internalType': 'uint256',
                    'name': 'deadline',
                    'type': 'uint256',
                },
            ],
            'name': 'removeLiquidity',
            'outputs': [
                {
                    'internalType': 'uint256',
                    'name': 'amountA',
                    'type': 'uint256',
                },
                {
                    'internalType': 'uint256',
                    'name': 'amountB',
                    'type': 'uint256',
                },
            ],
            'stateMutability': 'nonpayable',
            'type': 'function',
        },
        {
            'inputs': [
                {
                    'internalType': 'address',
                    'name': 'token',
                    'type': 'address',
                },
                {
                    'internalType': 'uint256',
                    'name': 'liquidity',
                    'type': 'uint256',
                },
                {
                    'internalType': 'uint256',
                    'name': 'amountTokenMin',
                    'type': 'uint256',
                },
                {
                    'internalType': 'uint256',
                    'name': 'amountETHMin',
                    'type': 'uint256',
                },
                {
                    'internalType': 'address',
                    'name': 'to',
                    'type': 'address',
                },
                {
                    'internalType': 'uint256',
                    'name': 'deadline',
                    'type': 'uint256',
                },
            ],
            'name': 'removeLiquidityETH',
            'outputs': [
                {
                    'internalType': 'uint256',
                    'name': 'amountToken',
                    'type': 'uint256',
                },
                {
                    'internalType': 'uint256',
                    'name': 'amountETH',
                    'type': 'uint256',
                },
            ],
            'stateMutability': 'nonpayable',
            'type': 'function',
        },
        {
            'inputs': [
                {
                    'internalType': 'address',
                    'name': 'token',
                    'type': 'address',
                },
                {
                    'internalType': 'uint256',
                    'name': 'liquidity',
                    'type': 'uint256',
                },
                {
                    'internalType': 'uint256',
                    'name': 'amountTokenMin',
                    'type': 'uint256',
                },
                {
                    'internalType': 'uint256',
                    'name': 'amountETHMin',
                    'type': 'uint256',
                },
                {
                    'internalType': 'address',
                    'name': 'to',
                    'type': 'address',
                },
                {
                    'internalType': 'uint256',
                    'name': 'deadline',
                    'type': 'uint256',
                },
            ],
            'name': 'removeLiquidityETHSupportingFeeOnTransferTokens',
            'outputs': [
                {
                    'internalType': 'uint256',
                    'name': 'amountETH',
                    'type': 'uint256',
                },
            ],
            'stateMutability': 'nonpayable',
            'type': 'function',
        },
        {
            'inputs': [
                {
                    'internalType': 'address',
                    'name': 'token',
                    'type': 'address',
                },
                {
                    'internalType': 'uint256',
                    'name': 'liquidity',
                    'type': 'uint256',
                },
                {
                    'internalType': 'uint256',
                    'name': 'amountTokenMin',
                    'type': 'uint256',
                },
                {
                    'internalType': 'uint256',
                    'name': 'amountETHMin',
                    'type': 'uint256',
                },
                {
                    'internalType': 'address',
                    'name': 'to',
                    'type': 'address',
                },
                {
                    'internalType': 'uint256',
                    'name': 'deadline',
                    'type': 'uint256',
                },
                {
                    'internalType': 'bool',
                    'name': 'approveMax',
                    'type': 'bool',
                },
                {
                    'internalType': 'uint8',
                    'name': 'v',
                    'type': 'uint8',
                },
                {
                    'internalType': 'bytes32',
                    'name': 'r',
                    'type': 'bytes32',
                },
                {
                    'internalType': 'bytes32',
                    'name': 's',
                    'type': 'bytes32',
                },
            ],
            'name': 'removeLiquidityETHWithPermit',
            'outputs': [
                {
                    'internalType': 'uint256',
                    'name': 'amountToken',
                    'type': 'uint256',
                },
                {
                    'internalType': 'uint256',
                    'name': 'amountETH',
                    'type': 'uint256',
                },
            ],
            'stateMutability': 'nonpayable',
            'type': 'function',
        },
        {
            'inputs': [
                {
                    'internalType': 'address',
                    'name': 'token',
                    'type': 'address',
                },
                {
                    'internalType': 'uint256',
                    'name': 'liquidity',
                    'type': 'uint256',
                },
                {
                    'internalType': 'uint256',
                    'name': 'amountTokenMin',
                    'type': 'uint256',
                },
                {
                    'internalType': 'uint256',
                    'name': 'amountETHMin',
                    'type': 'uint256',
                },
                {
                    'internalType': 'address',
                    'name': 'to',
                    'type': 'address',
                },
                {
                    'internalType': 'uint256',
                    'name': 'deadline',
                    'type': 'uint256',
                },
                {
                    'internalType': 'bool',
                    'name': 'approveMax',
                    'type': 'bool',
                },
                {
                    'internalType': 'uint8',
                    'name': 'v',
                    'type': 'uint8',
                },
                {
                    'internalType': 'bytes32',
                    'name': 'r',
                    'type': 'bytes32',
                },
                {
                    'internalType': 'bytes32',
                    'name': 's',
                    'type': 'bytes32',
                },
            ],
            'name': 'removeLiquidityETHWithPermitSupportingFeeOnTransferTokens',
            'outputs': [
                {
                    'internalType': 'uint256',
                    'name': 'amountETH',
                    'type': 'uint256',
                },
            ],
            'stateMutability': 'nonpayable',
            'type': 'function',
        },
        {
            'inputs': [
                {
                    'internalType': 'address',
                    'name': 'tokenA',
                    'type': 'address',
                },
                {
                    'internalType': 'address',
                    'name': 'tokenB',
                    'type': 'address',
                },
                {
                    'internalType': 'uint256',
                    'name': 'liquidity',
                    'type': 'uint256',
                },
                {
                    'internalType': 'uint256',
                    'name': 'amountAMin',
                    'type': 'uint256',
                },
                {
                    'internalType': 'uint256',
                    'name': 'amountBMin',
                    'type': 'uint256',
                },
                {
                    'internalType': 'address',
                    'name': 'to',
                    'type': 'address',
                },
                {
                    'internalType': 'uint256',
                    'name': 'deadline',
                    'type': 'uint256',
                },
                {
                    'internalType': 'bool',
                    'name': 'approveMax',
                    'type': 'bool',
                },
                {
                    'internalType': 'uint8',
                    'name': 'v',
                    'type': 'uint8',
                },
                {
                    'internalType': 'bytes32',
                    'name': 'r',
                    'type': 'bytes32',
                },
                {
                    'internalType': 'bytes32',
                    'name': 's',
                    'type': 'bytes32',
                },
            ],
            'name': 'removeLiquidityWithPermit',
            'outputs': [
                {
                    'internalType': 'uint256',
                    'name': 'amountA',
                    'type': 'uint256',
                },
                {
                    'internalType': 'uint256',
                    'name': 'amountB',
                    'type': 'uint256',
                },
            ],
            'stateMutability': 'nonpayable',
            'type': 'function',
        },
        {
            'inputs': [
                {
                    'internalType': 'uint256',
                    'name': 'amountOut',
                    'type': 'uint256',
                },
                {
                    'internalType': 'address[]',
                    'name': 'path',
                    'type': 'address[]',
                },
                {
                    'internalType': 'address',
                    'name': 'to',
                    'type': 'address',
                },
                {
                    'internalType': 'uint256',
                    'name': 'deadline',
                    'type': 'uint256',
                },
            ],
            'name': 'swapETHForExactTokens',
            'outputs': [
                {
                    'internalType': 'uint256[]',
                    'name': 'amounts',
                    'type': 'uint256[]',
                },
            ],
            'stateMutability': 'payable',
            'type': 'function',
        },
        {
            'inputs': [
                {
                    'internalType': 'uint256',
                    'name': 'amountOutMin',
                    'type': 'uint256',
                },
                {
                    'internalType': 'address[]',
                    'name': 'path',
                    'type': 'address[]',
                },
                {
                    'internalType': 'address',
                    'name': 'to',
                    'type': 'address',
                },
                {
                    'internalType': 'uint256',
                    'name': 'deadline',
                    'type': 'uint256',
                },
            ],
            'name': 'swapExactETHForTokens',
            'outputs': [
                {
                    'internalType': 'uint256[]',
                    'name': 'amounts',
                    'type': 'uint256[]',
                },
            ],
            'stateMutability': 'payable',
            'type': 'function',
        },
        {
            'inputs': [
                {
                    'internalType': 'uint256',
                    'name': 'amountOutMin',
                    'type': 'uint256',
                },
                {
                    'internalType': 'address[]',
                    'name': 'path',
                    'type': 'address[]',
                },
                {
                    'internalType': 'address',
                    'name': 'to',
                    'type': 'address',
                },
                {
                    'internalType': 'uint256',
                    'name': 'deadline',
                    'type': 'uint256',
                },
            ],
            'name': 'swapExactETHForTokensSupportingFeeOnTransferTokens',
            'outputs': [],
            'stateMutability': 'payable',
            'type': 'function',
        },
        {
            'inputs': [
                {
                    'internalType': 'uint256',
                    'name': 'amountIn',
                    'type': 'uint256',
                },
                {
                    'internalType': 'uint256',
                    'name': 'amountOutMin',
                    'type': 'uint256',
                },
                {
                    'internalType': 'address[]',
                    'name': 'path',
                    'type': 'address[]',
                },
                {
                    'internalType': 'address',
                    'name': 'to',
                    'type': 'address',
                },
                {
                    'internalType': 'uint256',
                    'name': 'deadline',
                    'type': 'uint256',
                },
            ],
            'name': 'swapExactTokensForETH',
            'outputs': [
                {
                    'internalType': 'uint256[]',
                    'name': 'amounts',
                    'type': 'uint256[]',
                },
            ],
            'stateMutability': 'nonpayable',
            'type': 'function',
        },
        {
            'inputs': [
                {
                    'internalType': 'uint256',
                    'name': 'amountIn',
                    'type': 'uint256',
                },
                {
                    'internalType': 'uint256',
                    'name': 'amountOutMin',
                    'type': 'uint256',
                },
                {
                    'internalType': 'address[]',
                    'name': 'path',
                    'type': 'address[]',
                },
                {
                    'internalType': 'address',
                    'name': 'to',
                    'type': 'address',
                },
                {
                    'internalType': 'uint256',
                    'name': 'deadline',
                    'type': 'uint256',
                },
            ],
            'name': 'swapExactTokensForETHSupportingFeeOnTransferTokens',
            'outputs': [],
            'stateMutability': 'nonpayable',
            'type': 'function',
        },
        {
            'inputs': [
                {
                    'internalType': 'uint256',
                    'name': 'amountIn',
                    'type': 'uint256',
                },
                {
                    'internalType': 'uint256',
                    'name': 'amountOutMin',
                    'type': 'uint256',
                },
                {
                    'internalType': 'address[]',
                    'name': 'path',
                    'type': 'address[]',
                },
                {
                    'internalType': 'address',
                    'name': 'to',
                    'type': 'address',
                },
                {
                    'internalType': 'uint256',
                    'name': 'deadline',
                    'type': 'uint256',
                },
            ],
            'name': 'swapExactTokensForTokens',
            'outputs': [
                {
                    'internalType': 'uint256[]',
                    'name': 'amounts',
                    'type': 'uint256[]',
                },
            ],
            'stateMutability': 'nonpayable',
            'type': 'function',
        },
        {
            'inputs': [
                {
                    'internalType': 'uint256',
                    'name': 'amountIn',
                    'type': 'uint256',
                },
                {
                    'internalType': 'uint256',
                    'name': 'amountOutMin',
                    'type': 'uint256',
                },
                {
                    'internalType': 'address[]',
                    'name': 'path',
                    'type': 'address[]',
                },
                {
                    'internalType': 'address',
                    'name': 'to',
                    'type': 'address',
                },
                {
                    'internalType': 'uint256',
                    'name': 'deadline',
                    'type': 'uint256',
                },
            ],
            'name': 'swapExactTokensForTokensSupportingFeeOnTransferTokens',
            'outputs': [],
            'stateMutability': 'nonpayable',
            'type': 'function',
        },
        {
            'inputs': [
                {
                    'internalType': 'uint256',
                    'name': 'amountOut',
                    'type': 'uint256',
                },
                {
                    'internalType': 'uint256',
                    'name': 'amountInMax',
                    'type': 'uint256',
                },
                {
                    'internalType': 'address[]',
                    'name': 'path',
                    'type': 'address[]',
                },
                {
                    'internalType': 'address',
                    'name': 'to',
                    'type': 'address',
                },
                {
                    'internalType': 'uint256',
                    'name': 'deadline',
                    'type': 'uint256',
                },
            ],
            'name': 'swapTokensForExactETH',
            'outputs': [
                {
                    'internalType': 'uint256[]',
                    'name': 'amounts',
                    'type': 'uint256[]',
                },
            ],
            'stateMutability': 'nonpayable',
            'type': 'function',
        },
        {
            'inputs': [
                {
                    'internalType': 'uint256',
                    'name': 'amountOut',
                    'type': 'uint256',
                },
                {
                    'internalType': 'uint256',
                    'name': 'amountInMax',
                    'type': 'uint256',
                },
                {
                    'internalType': 'address[]',
                    'name': 'path',
                    'type': 'address[]',
                },
                {
                    'internalType': 'address',
                    'name': 'to',
                    'type': 'address',
                },
                {
                    'internalType': 'uint256',
                    'name': 'deadline',
                    'type': 'uint256',
                },
            ],
            'name': 'swapTokensForExactTokens',
            'outputs': [
                {
                    'internalType': 'uint256[]',
                    'name': 'amounts',
                    'type': 'uint256[]',
                },
            ],
            'stateMutability': 'nonpayable',
            'type': 'function',
        },
        {
            'stateMutability': 'payable',
            'type': 'receive',
        },
    ],
    TRANSFER_ETH_HELPER_ABI: [{
        "type": "function",
        "stateMutability": "payable",
        "outputs": [],
        "name": "transferETH",
        "inputs": [{"type": "address[]", "name": "accounts", "internalType": "address[]"}, {
            "type": "uint256[]",
            "name": "amounts",
            "internalType": "uint256[]"
        }]
    }],
    TRANSFER_HELPER_ABI: [{
        "type": "function",
        "stateMutability": "nonpayable",
        "outputs": [{"type": "bool", "name": "", "internalType": "bool"}],
        "name": "multiTransfer",
        "inputs": [{"type": "address", "name": "token", "internalType": "address"}, {
            "type": "address[]",
            "name": "addrs",
            "internalType": "address[]"
        }, {"type": "uint256[]", "name": "nums", "internalType": "uint256[]"}]
    }],
    DB: {
        HOST: DB_HOST,
        USERNAME: DB_USERNAME,
        PASSWORD: DB_PASSWORD,
        DATABASE: DB_DATABASE,
    },
    SWAP_SWITCH: 0,
    CREATE_TIME: 86400,
    CREATE_TIME_LAST: 86400,
    PORT: PORT,
};

export const pool = mysql.createPool({
    host: env.DB.HOST,
    user: env.DB.USERNAME,
    password: env.DB.PASSWORD,
    database: env.DB.DATABASE,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
});

export const get_config = async () => {

    let values = [
        'HTTP_PROVIDER',
        'ROUTER_ADDRESS',
        'TRANSFER_ETH_HELPER_ADDRESS',
        'TRANSFER_HELPER_ADDRESS',
        'ERC20_ABI',
        'ROUTER_ABI',
        'TRANSFER_ETH_HELPER_ABI',
        'TRANSFER_HELPER_ABI',
        'SWAP_SWITCH',
        'CREATE_TIME',
    ];
    let sql = `select * from fa_config where name in (?);`;
    let rows;
    try {
        [rows,] = await pool.query(sql, [values]);
    } catch (e) {
        return {status: -1, msg: e};
    }
    return {status: 0, msg: rows};
}

export const update_env = async () => {

    let _config = await get_config();
    if (_config.status === -1) return '读取配置失败';

    let HTTP_PROVIDER,
        ROUTER_ADDRESS,
        TRANSFER_ETH_HELPER_ADDRESS,
        TRANSFER_HELPER_ADDRESS,
        ERC20_ABI,
        ROUTER_ABI,
        TRANSFER_ETH_HELPER_ABI,
        TRANSFER_HELPER_ABI,
        SWAP_SWITCH,
        CREATE_TIME;

    for (let i = 0; i < _config.msg.length; i++) {
        let item = _config.msg[i];
        if (item.name === 'HTTP_PROVIDER') HTTP_PROVIDER = item.value;
        if (item.name === 'ROUTER_ADDRESS') ROUTER_ADDRESS = item.value;
        if (item.name === 'TRANSFER_ETH_HELPER_ADDRESS') TRANSFER_ETH_HELPER_ADDRESS = item.value;
        if (item.name === 'TRANSFER_HELPER_ADDRESS') TRANSFER_HELPER_ADDRESS = item.value;
        if (item.name === 'ERC20_ABI') ERC20_ABI = item.value;
        if (item.name === 'ROUTER_ABI') ROUTER_ABI = item.value;
        if (item.name === 'TRANSFER_ETH_HELPER_ABI') TRANSFER_ETH_HELPER_ABI = item.value;
        if (item.name === 'TRANSFER_HELPER_ABI') TRANSFER_HELPER_ABI = item.value;
        if (item.name === 'SWAP_SWITCH') SWAP_SWITCH = parseInt(item.value);
        if (item.name === 'CREATE_TIME') CREATE_TIME = parseInt(item.value);
    }

    if (HTTP_PROVIDER !== undefined) env.HTTP_PROVIDER = HTTP_PROVIDER;
    if (ROUTER_ADDRESS !== undefined) env.ROUTER_ADDRESS = ROUTER_ADDRESS;
    if (TRANSFER_ETH_HELPER_ADDRESS !== undefined) env.TRANSFER_ETH_HELPER_ADDRESS = TRANSFER_ETH_HELPER_ADDRESS;
    if (TRANSFER_HELPER_ADDRESS !== undefined) env.TRANSFER_HELPER_ADDRESS = TRANSFER_HELPER_ADDRESS;
    if (ERC20_ABI !== undefined) env.ERC20_ABI = eval('(' + ERC20_ABI + ')');
    if (ROUTER_ABI !== undefined) env.ROUTER_ABI = eval('(' + ROUTER_ABI + ')');
    if (TRANSFER_ETH_HELPER_ABI !== undefined) env.TRANSFER_ETH_HELPER_ABI = eval('(' + TRANSFER_ETH_HELPER_ABI + ')');
    if (TRANSFER_HELPER_ABI !== undefined) env.TRANSFER_HELPER_ABI = eval('(' + TRANSFER_HELPER_ABI + ')');
    if (SWAP_SWITCH !== undefined) env.SWAP_SWITCH = SWAP_SWITCH;
    if (CREATE_TIME !== undefined) env.CREATE_TIME = CREATE_TIME;

}
