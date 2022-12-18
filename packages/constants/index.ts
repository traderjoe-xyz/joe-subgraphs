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

export const BIG_INT_1E12 = BigInt.fromString('1000000000000')

export const BIG_INT_1E10 = BigInt.fromString('10000000000')

export const BIG_INT_1E9 = BigInt.fromString('1000000000')

export const BIG_INT_1E6 = BigInt.fromString('1000000')

export const LOCKUP_POOL_NUMBER = BigInt.fromI32(29)

export const NULL_CALL_RESULT_VALUE = '0x0000000000000000000000000000000000000000000000000000000000000001'

// EXCHANGE
export const FACTORY_ADDRESS = Address.fromString('0x1886D09C9Ade0c5DB822D85D21678Db67B6c2982')
export const TRADERJOE_START_BLOCK = BigInt.fromI32(2371988)

export const JOE_TOKEN_ADDRESS = Address.fromString('0x0000000000000000000000000000000000000000')

// MASTER CHEF
export const MASTER_CHEF_ADDRESS = Address.fromString('0x0000000000000000000000000000000000000000')
export const MASTER_CHEF_V2_ADDRESS = Address.fromString('0x0000000000000000000000000000000000000000')
export const MASTER_CHEF_V3_ADDRESS = Address.fromString('0x0000000000000000000000000000000000000000')
export const BOOSTED_MASTER_CHEF_ADDRESS = Address.fromString('0x0000000000000000000000000000000000000000')

export const MASTER_CHEF_START_BLOCK = BigInt.fromI32(2371988)

// BAR
export const JOE_BAR_ADDRESS = Address.fromString('0x0000000000000000000000000000000000000000')

// MAKER
export const JOE_MAKER_ADDRESS = Address.fromString('0x0000000000000000000000000000000000000000')
export const JOE_MAKER_V2_ADDRESS = Address.fromString('0x0000000000000000000000000000000000000000')

// PRICING
export const TRADERJOE_WAVAX_USDT_PAIR_ADDRESS = Address.fromString('0x94eb5d9f3eb76e76a6d889d9e67a13d30467dcbf')
export const JOE_USDT_PAIR_ADDRESS = Address.fromString('0x0000000000000000000000000000000000000000')

// VEJOE 
export const VEJOE_TOKEN_ADDRESS = Address.fromString('0x0000000000000000000000000000000000000000')

export const WAVAX_ADDRESS = Address.fromString('0xae4ec9901c3076d0ddbe76a520f9e90a6227acb7')
export const USDT_ADDRESS = Address.fromString('0xf450749aea1c5fef27ae0237c56fecc43f6be244')
export const USDC_E_ADDRESS = Address.fromString('0xb3482a25a12e5261b02e0acc5b96c656358a4086')
export const USDC_ADDRESS = Address.fromString('0xb3482a25a12e5261b02e0acc5b96c656358a4086')
export const WBTC_ADDRESS = Address.fromString('0x0000000000000000000000000000000000000000')
export const MIM_ADDRESS = Address.fromString('0x0000000000000000000000000000000000000000')

export const WAVAX_STABLE_PAIRS: string[] = [
    '0x94eb5d9f3eb76e76a6d889d9e67a13d30467dcbf', // WAVAX-USDT
    '0x94eb5d9f3eb76e76a6d889d9e67a13d30467dcbf', // WAVAX-DAI
    '0x94eb5d9f3eb76e76a6d889d9e67a13d30467dcbf', // WAVAX-USDC
    '0x94eb5d9f3eb76e76a6d889d9e67a13d30467dcbf', // WAVAX-USDC
]

export const WHITELIST: string[] = [
    '0xae4ec9901c3076d0ddbe76a520f9e90a6227acb7', // WAVAX
    '0x0000000000000000000000000000000000000000', // WETH
    '0x0000000000000000000000000000000000000000', // WBTC
    '0xf450749aea1c5fef27ae0237c56fecc43f6be244', // USDT
    '0xb3482a25a12e5261b02e0acc5b96c656358a4086', // DAI
    '0xb3482a25a12e5261b02e0acc5b96c656358a4086', // USDC
    '0x0000000000000000000000000000000000000000', // MIM
]

// LOCKUP -- TO BE DEPRECATED?
export const LOCKUP_BLOCK_NUMBER = BigInt.fromI32(10959148)

// minimum liquidity required to count towards tracked volume for pairs with small # of Lps
export const MINIMUM_USD_THRESHOLD_NEW_PAIRS = BigDecimal.fromString('0')

// minimum liquidity providers for price to get tracked
export const MINIMUM_LIQUIDITY_PROVIDERS = BigInt.fromString('0')

// MasterChefV2 precision
export const ACC_JOE_PRECISION = BigInt.fromString('1000000000000')
