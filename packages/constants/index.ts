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
export const FACTORY_ADDRESS = Address.fromString('0x9Ad6C38BE94206cA50bb0d90783181662f0Cfa10')
export const TRADERJOE_START_BLOCK = BigInt.fromI32(2486000)

export const JOE_TOKEN_ADDRESS = Address.fromString('0x6e84a6216ea6dacc71ee8e6b0a5b7322eebc0fdd')

// MASTER CHEF
export const MASTER_CHEF_ADDRESS = Address.fromString('0x0000000000000000000000000000000000000000')
export const MASTER_CHEF_V2_ADDRESS = Address.fromString('0xd6a4F121CA35509aF06A0Be99093d08462f53052')
export const MASTER_CHEF_START_BLOCK = BigInt.fromI32(2486000)

// BAR
export const JOE_BAR_ADDRESS = Address.fromString('0x931B5dFfeBF156B3c295f0C50bbAd494d35989BA')

// MAKER
export const JOE_MAKER_ADDRESS = Address.fromString('0xE8A191026e71C303b0f40F15be93403f7D529707')

// PRICING
export const TRADERJOE_WAVAX_USDT_PAIR_ADDRESS = Address.fromString('0xe4b9865c0866346ba3613ec122040a365637fb46')
export const JOE_USDT_PAIR_ADDRESS = Address.fromString('0x0000000000000000000000000000000000000000')

export const WAVAX_ADDRESS = Address.fromString('0xb31f66aa3c1e785363f0875a1b74e27b85fd66c7')
export const USDT_ADDRESS = Address.fromString('0xde3a24028580884448a5397872046a019649b084')

export const WAVAX_STABLE_PAIRS: string[] = [
    '0xe4b9865c0866346ba3613ec122040a365637fb46', // WAVAX-USDT
    '0x43b9c8dec26c2d21146466caacabf94fdbeac473',  // WAVAX-DAI
    '0x9ee0a4e21bd333a6bb2ab298194320b8daa26516',  // PNG WAVAX-DAI
    '0x17a2e8275792b4616befb02eb9ae699aa0dcb94b',  // PNG WAVAX-DAI
]

export const WHITELIST: string[] = [
    '0xb31f66aa3c1e785363f0875a1b74e27b85fd66c7', // WAVAX
    '0x408d4cd0adb7cebd1f1a1c33a0ba2098e1295bab', // WBTC
    '0xde3a24028580884448a5397872046a019649b084', // USDT
    '0xba7deebbfc5fa1100fb055a87773e1e99cd3507a', // DAI
]

// LOCKUP -- TO BE DEPRECATED?
export const LOCKUP_BLOCK_NUMBER = BigInt.fromI32(10959148)

// minimum liquidity required to count towards tracked volume for pairs with small # of Lps
export const MINIMUM_USD_THRESHOLD_NEW_PAIRS = BigDecimal.fromString('0')

// minimum liquidity for price to get tracked
export const MINIMUM_LIQUIDITY_THRESHOLD_ETH = BigDecimal.fromString('0')

// MasterChefV2 precision
export const ACC_JOE_PRECISION = BigInt.fromString('1000000000000')
