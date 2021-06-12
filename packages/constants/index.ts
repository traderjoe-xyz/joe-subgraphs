import { Address, BigDecimal, BigInt } from '@graphprotocol/graph-ts'

// consts
export const ADDRESS_ZERO = Address.fromString('0x0000000000000000000000000000000000000000')

export const BIG_DECIMAL_1E6 = BigDecimal.fromString('1e6')

export const BIG_DECIMAL_1E12 = BigDecimal.fromString('1e12')

export const BIG_DECIMAL_1E18 = BigDecimal.fromString('1e18')

export const BIG_DECIMAL_ZERO = BigDecimal.fromString('0')

export const BIG_DECIMAL_ONE = BigDecimal.fromString('1')

export const BIG_INT_ONE = BigInt.fromI32(1)

export const BIG_INT_ONE_DAY_SECONDS = BigInt.fromI32(86400)

export const BIG_INT_ZERO = BigInt.fromI32(0)

export const LOCKUP_POOL_NUMBER = BigInt.fromI32(29)

export const NULL_CALL_RESULT_VALUE = '0x0000000000000000000000000000000000000000000000000000000000000001'

// EXCHANGE
export const FACTORY_ADDRESS = Address.fromString('0xBB95aa2089A3494e466D3CBE6d6c21eEEFD7b337')
export const TRADERJOE_START_BLOCK = BigInt.fromI32(8438448)

export const JOE_TOKEN_ADDRESS = Address.fromString('0xDDF06D89C908bC38e03067d65408D632fDA4fd9d')

// MASTER CHEF
export const MASTER_CHEF_ADDRESS = Address.fromString('0x4D0b7302D7aD0B0f9eFDF16CAed64868eD377313')
export const MASTER_CHEF_V2_ADDRESS = Address.fromString('0x927bE1425F2C3599Ced2146459f6491eE450848b')
export const MASTER_CHEF_START_BLOCK = BigInt.fromI32(8455513)

// BAR
export const JOE_BAR_ADDRESS = Address.fromString('0x0CC47Aa1252f25FD95b65F19C2fd6dB33366A557')

// MAKER
export const JOE_MAKER_ADDRESS = Address.fromString('0x1FCFDEe3aB694032255Cd5ffe24d66b6c85501ad')

// PRICING
export const TRADERJOE_WAVAX_USDT_PAIR_ADDRESS = Address.fromString('0xbf21027fbf3e6fff156e9f2464881898e4672713')
export const JOE_USDT_PAIR_ADDRESS = Address.fromString('0x4C69f41eee459C98F7CbC82573F5E1055010F8CC')

export const WAVAX_ADDRESS = Address.fromString('0xc778417e063141139fce010982780140aa0cd5ab')
export const USDT_ADDRESS = Address.fromString('0x9Ad6C38BE94206cA50bb0d90783181662f0Cfa10 ')

export const WAVAX_STABLE_PAIRS: string[] = [
    '0xbf21027fbf3e6fff156e9f2464881898e4672713', // WAVAX-USDT
    '0xbf21027fbf3e6fff156e9f2464881898e4672713',  // WAVAX-DAI
]

export const WHITELIST: string[] = [
    '0xc778417e063141139fce010982780140aa0cd5ab', // WAVAX
    '0x5af59f281b3cfd0c12770e4633e6c16dd08ea543', // WBTC
    '0x9Ad6C38BE94206cA50bb0d90783181662f0Cfa10 ', // USDT
    '0x9Ad6C38BE94206cA50bb0d90783181662f0Cfa10 ', // DAI
]

// LOCKUP -- TO BE DEPRECATED?
export const LOCKUP_BLOCK_NUMBER = BigInt.fromI32(10959148)

// minimum liquidity required to count towards tracked volume for pairs with small # of Lps
export const MINIMUM_USD_THRESHOLD_NEW_PAIRS = BigDecimal.fromString('0')

// minimum liquidity for price to get tracked
export const MINIMUM_LIQUIDITY_THRESHOLD_ETH = BigDecimal.fromString('0')

// MasterChefV2 precision
export const ACC_JOE_PRECISION = BigInt.fromString('1000000000000')
