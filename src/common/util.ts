import BigNumber from "bignumber.js";

const bip39 = require('bip39');
const HDWallet = require('ethereum-hdwallet');

export const uint256_max = '115792089237316195423570985008687907853269984665640564039457584007913129639935';

export const getRandom = (n, m) => {
    return Math.floor(Math.random() * (m - n + 1) + n);
}

export const random = (max: string, min: string): string => {
    // 类型转化
    const minValue = new BigNumber(min);
    const maxValue = new BigNumber(max);
    // 计算值的范围
    const range = maxValue.minus(minValue);
    // 生成随机值
    const randomValue = minValue.plus(range.times(Math.random()));
    // 限制小数位数为最多18位
    return randomValue.toFixed(18);
}

export const timestamp = () => {
    return Math.round((new Date()).valueOf() / 1000);
}

export const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp * 1000);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

export const convertToTimestamp = (datetimeString) => {

    const [datePart, timePart] = datetimeString.split(' ');
    const [year, month, day] = datePart.split('-');
    const [hours, minutes, seconds] = timePart.split(':');

    return new Date(year, month - 1, day, hours, minutes, seconds).getTime() / 1000;
};

export const generateWallet = async () => {

    let mnemonic = await generateMnemonic();
    while (!bip39.validateMnemonic(mnemonic)) {
        mnemonic = await generateMnemonic();
    }

    const seedBuffer = await bip39.mnemonicToSeed(mnemonic);
    const wallet = HDWallet.fromSeed(seedBuffer);
    const key = wallet.derive('m/44\'/60\'/0\'/0/' + 0);
    const privateKey = key.getPrivateKey().toString('hex');
    const address = '0x' + key.getAddress().toString('hex');

    return {address, privateKey, mnemonic};
}

export const generateMnemonic = async () => {
    return bip39.generateMnemonic(256);
}

export const generate_number_array = (begin_num: number, limit_num: number): number[] => {
    const number_array: number[] = [];
    for (let i = 0; i < limit_num; i++) {
        number_array.push(begin_num + i);
    }
    return number_array;
}