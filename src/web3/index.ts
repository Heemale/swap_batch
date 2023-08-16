import {env} from '../config';
import {AllowanceDto} from './dto/allowance.dto';
import {ApproveDto} from './dto/approve.dto';
import {SwapDto} from './dto/swap.dto';
import {TransactionDto} from './dto/transaction.dto';
import BigNumber from 'bignumber.js';
import {TransferDto} from './dto/transfer.dto';
import {TransferBatchDto} from './dto/transfer-batch.dto';
import {GetAmountsOutDto} from "./dto/get-amounts-out.dto";

export const Web3 = require('web3');

export async function transfer_ETH_batch(transferBatchDto: TransferBatchDto) {

    const web3 = new Web3(new Web3.providers.HttpProvider(env.HTTP_PROVIDER));
    const {accounts, amounts} = transferBatchDto;
    const my_contract = new web3.eth.Contract(env.TRANSFER_ETH_HELPER_ABI, env.TRANSFER_ETH_HELPER_ADDRESS);
    let transaction = my_contract.methods.transferETH(accounts, amounts);

    let data = '';
    try {
        data = transaction.encodeABI();
    } catch (error) {
        throw new Error(error);
    }
    return data;
}

export async function transfer_ERC20_batch(transferBatchDto: TransferBatchDto) {

    const web3 = new Web3(new Web3.providers.HttpProvider(env.HTTP_PROVIDER));
    const {token, accounts, amounts} = transferBatchDto;
    const my_contract = new web3.eth.Contract(env.TRANSFER_HELPER_ABI, env.TRANSFER_HELPER_ADDRESS);
    let transaction = my_contract.methods.multiTransfer(token, accounts, amounts);

    let data = '';
    try {
        data = transaction.encodeABI();
    } catch (error) {
        throw new Error(error);
    }
    return data;
}

export async function get_nonce(address: string): Promise<bigint> {

    const web3 = new Web3(new Web3.providers.HttpProvider(env.HTTP_PROVIDER));
    return await web3.eth.getTransactionCount(address);
}

export async function get_allowance(getAllowanceDto: AllowanceDto): Promise<string> {

    const web3 = new Web3(new Web3.providers.HttpProvider(env.HTTP_PROVIDER));
    let {owner, spender, contract_address} = getAllowanceDto;
    const my_contract = new web3.eth.Contract(env.ERC20_ABI, contract_address);
    return my_contract.methods.allowance(owner, spender).call();
}

export async function transfer(transferDto: TransferDto) {

    const web3 = new Web3(new Web3.providers.HttpProvider(env.HTTP_PROVIDER));
    let {to, amount, contract_address} = transferDto;
    const my_contract = new web3.eth.Contract(env.ERC20_ABI, contract_address);
    let transaction = my_contract.methods.transfer(to, amount);

    let data = '';
    try {
        data = transaction.encodeABI();
    } catch (error) {
        throw new Error(error);
    }
    return data;
}

export async function approve(approveDto: ApproveDto) {

    const web3 = new Web3(new Web3.providers.HttpProvider(env.HTTP_PROVIDER));
    let {spender, amount, contract_address} = approveDto;
    const my_contract = new web3.eth.Contract(env.ERC20_ABI, contract_address);
    let transaction = my_contract.methods.approve(spender, amount);

    let data = '';
    try {
        data = transaction.encodeABI();
    } catch (error) {
        throw new Error(error);
    }
    return data;
}

export async function swap(swapDto: SwapDto) {

    const web3 = new Web3(new Web3.providers.HttpProvider(env.HTTP_PROVIDER));
    let {amountIn, amountOutMin, path, to, deadline, contract_address} = swapDto;
    const my_contract = new web3.eth.Contract(env.ROUTER_ABI, contract_address);
    let transaction = my_contract.methods.swapExactTokensForTokensSupportingFeeOnTransferTokens(amountIn, new BigNumber(amountOutMin).toString(10), path, to, deadline);

    let data = '';
    try {
        data = transaction.encodeABI();
    } catch (error) {
        throw new Error(error);
    }
    return data;
}

export async function send_transaction(transactionDto: TransactionDto) {

    const web3 = new Web3(new Web3.providers.HttpProvider(env.HTTP_PROVIDER));
    let {from, to, value, data, private_key, nonce} = transactionDto;
    let transaction_config;

    if (data == '') {
        transaction_config = {from, to, value};
    } else {
        transaction_config = {from, to, value, data};
    }

    //预估gas
    let gas = 21000;
    try {
        gas = await web3.eth.estimateGas({...transaction_config});
    } catch (error) {
        throw new Error(error);
    }

    //配置交易信息
    let tx = {...transaction_config, gas, nonce};
    //签署交易
    return await web3.eth.accounts.signTransaction(tx, private_key);
}

export async function get_receipt(hash) {
    const web3 = new Web3(new Web3.providers.HttpProvider(env.HTTP_PROVIDER));
    return web3.eth.getTransaction(hash);
}

export async function get_balance(address) {
    const web3 = new Web3(new Web3.providers.HttpProvider(env.HTTP_PROVIDER));
    return web3.eth.getBalance(address);
}

export async function get_token_balance(address, contract_address) {
    const web3 = new Web3(new Web3.providers.HttpProvider(env.HTTP_PROVIDER));
    const my_contract = new web3.eth.Contract(env.ERC20_ABI, contract_address);
    return my_contract.methods.balanceOf(address).call();
}

export async function get_gas_price() {
    const web3 = new Web3(new Web3.providers.HttpProvider(env.HTTP_PROVIDER));
    return web3.eth.getGasPrice();
}

export async function remove_pad(pad_address) {
    const web3 = new Web3(new Web3.providers.HttpProvider(env.HTTP_PROVIDER));
    return '0x' + pad_address.slice(-40);
}

//16进制转number字符串
export async function hex_to_number_string(hex) {
    const web3 = new Web3(new Web3.providers.HttpProvider(env.HTTP_PROVIDER));
    return web3.utils.hexToNumberString(hex);
}

//wei转成ether
export async function from_wei(number) {
    const web3 = new Web3(new Web3.providers.HttpProvider(env.HTTP_PROVIDER));
    return web3.utils.fromWei(number, 'ether');
}

//ether转成wei
export async function to_wei(number) {
    const web3 = new Web3(new Web3.providers.HttpProvider(env.HTTP_PROVIDER));
    return web3.utils.toWei(number, 'ether');
}

export async function get_token_price(getAmountsOutDto: GetAmountsOutDto) {

    const {amount_in, tokens, contract_address} = getAmountsOutDto;

    const web3 = new Web3(new Web3.providers.HttpProvider(env.HTTP_PROVIDER));
    const my_contract = new web3.eth.Contract(env.ROUTER_ABI, contract_address);
    const result = await my_contract.methods.getAmountsOut(amount_in, tokens).call();

    return result[result.length - 1];
}
