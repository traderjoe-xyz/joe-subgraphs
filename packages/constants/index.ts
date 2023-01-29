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
export const FACTORY_ADDRESS = Address.fromString('0xaE4EC9901c3076D0DdBe76A520F9E90a6227aCB7')
export const TRADERJOE_START_BLOCK = BigInt.fromI32(47838075)

export const JOE_TOKEN_ADDRESS = Address.fromString('0x0000000000000000000000000000000000000000')
export const JOE_DEX_LENS_ADDRESS = Address.fromString('0xf450749aeA1c5feF27Ae0237C56FecC43f6bE244');

// MASTER CHEF
export const MASTER_CHEF_ADDRESS = Address.fromString('0x0000000000000000000000000000000000000000')
export const MASTER_CHEF_V2_ADDRESS = Address.fromString('0x0000000000000000000000000000000000000000')
export const MASTER_CHEF_V3_ADDRESS = Address.fromString('0x0000000000000000000000000000000000000000')
export const BOOSTED_MASTER_CHEF_ADDRESS = Address.fromString('0x0000000000000000000000000000000000000000')

export const MASTER_CHEF_START_BLOCK = BigInt.fromI32(47838075)

// BAR
export const JOE_BAR_ADDRESS = Address.fromString('0x0000000000000000000000000000000000000000')

// MAKER
export const JOE_MAKER_ADDRESS = Address.fromString('0x0000000000000000000000000000000000000000')
export const JOE_MAKER_V2_ADDRESS = Address.fromString('0x0000000000000000000000000000000000000000')

// PRICING
export const TRADERJOE_WAVAX_USDT_PAIR_ADDRESS = Address.fromString('0xbba7b8ce3e88e3ee765e896353a3fedd69974626')
export const JOE_USDT_PAIR_ADDRESS = Address.fromString('0x0000000000000000000000000000000000000000')

// VEJOE 
export const VEJOE_TOKEN_ADDRESS = Address.fromString('0x0000000000000000000000000000000000000000')

export const WAVAX_ADDRESS = Address.fromString('0x82af49447d8a07e3bd95bd0d56f35241523fbab1')
export const USDT_ADDRESS = Address.fromString('0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9')
export const USDC_E_ADDRESS = Address.fromString('0x0000000000000000000000000000000000000000')
export const USDC_ADDRESS = Address.fromString('0xff970a61a04b1ca14834a43f5de4533ebddb5cc8')
export const WBTC_ADDRESS = Address.fromString('0x0000000000000000000000000000000000000000')

export const WAVAX_STABLE_PAIRS: string[] = [
    '0xbba7b8ce3e88e3ee765e896353a3fedd69974626', // WAVAX-USDT
    '0x0000000000000000000000000000000000000000', // WAVAX-DAI
    '0xa98e516ed8c66b580aad6103858b69467db5f13a', // WAVAX-USDC
    '0x0000000000000000000000000000000000000000', // WAVAX-USDC
]

export const WHITELIST: string[] = [
    '0x82af49447d8a07e3bd95bd0d56f35241523fbab1', // WAVAX
    '0x0000000000000000000000000000000000000000', // WETH
    '0x0000000000000000000000000000000000000000', // WBTC
    '0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9', // USDT
    '0xda10009cbd5d07dd0cecc66161fc93d7c9000da1', // DAI
    '0xff970a61a04b1ca14834a43f5de4533ebddb5cc8', // USDC
]

// LOCKUP -- TO BE DEPRECATED?
export const LOCKUP_BLOCK_NUMBER = BigInt.fromI32(10959148)

// minimum liquidity required to count towards tracked volume for pairs with small # of Lps
export const MINIMUM_USD_THRESHOLD_NEW_PAIRS = BigDecimal.fromString('0')

// minimum liquidity providers for price to get tracked
export const MINIMUM_LIQUIDITY_PROVIDERS = BigInt.fromString('0')

// MasterChefV2 precision
export const ACC_JOE_PRECISION = BigInt.fromString('1000000000000')
