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
export const FACTORY_ADDRESS = Address.fromString('0x4f8bdc85E3eec5b9dE67097c3f59B6Db025d9986')
export const TRADERJOE_START_BLOCK = BigInt.fromI32(26142762)

export const JOE_TOKEN_ADDRESS = Address.fromString('0x0000000000000000000000000000000000000000')
export const JOE_DEX_LENS_ADDRESS = Address.fromString('0x0a5077d8dc51e27ad536847b0cf558165ba9ad1b');

// MASTER CHEF
export const MASTER_CHEF_ADDRESS = Address.fromString('0x0000000000000000000000000000000000000000')
export const MASTER_CHEF_V2_ADDRESS = Address.fromString('0x0000000000000000000000000000000000000000')
export const MASTER_CHEF_V3_ADDRESS = Address.fromString('0x0000000000000000000000000000000000000000')
export const BOOSTED_MASTER_CHEF_ADDRESS = Address.fromString('0x0000000000000000000000000000000000000000')

export const MASTER_CHEF_START_BLOCK = BigInt.fromI32(26142762)

// BAR
export const JOE_BAR_ADDRESS = Address.fromString('0x0000000000000000000000000000000000000000')

// MAKER
export const JOE_MAKER_ADDRESS = Address.fromString('0x0000000000000000000000000000000000000000')
export const JOE_MAKER_V2_ADDRESS = Address.fromString('0x0000000000000000000000000000000000000000')

// PRICING
export const TRADERJOE_WAVAX_USDT_PAIR_ADDRESS = Address.fromString('0x8b566fcf22670a776796fb6de97af7f32cbfe41e')
export const JOE_USDT_PAIR_ADDRESS = Address.fromString('0x0000000000000000000000000000000000000000')

// VEJOE 
export const VEJOE_TOKEN_ADDRESS = Address.fromString('0x0000000000000000000000000000000000000000')

export const WAVAX_ADDRESS = Address.fromString('0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c')
export const USDT_ADDRESS = Address.fromString('0x55d398326f99059ff775485246999027b3197955')
export const USDC_E_ADDRESS = Address.fromString('0xe9e7cea3dedca5984780bafc599bd69add087d56')
export const USDC_ADDRESS = Address.fromString('0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d')
export const WBTC_ADDRESS = Address.fromString('0x0000000000000000000000000000000000000000')

export const WAVAX_STABLE_PAIRS: string[] = [
    '0x8b566fcf22670a776796fb6de97af7f32cbfe41e', // WAVAX-USDT
    '0x0000000000000000000000000000000000000000', // WAVAX-DAI
    '0xb784c80bfc8f8131bf8d10d4af76dffbed0adf87', // WAVAX-USDC
    '0x0000000000000000000000000000000000000000', // WAVAX-USDC
]

export const WHITELIST: string[] = [
    '0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c', // WAVAX
    '0x0000000000000000000000000000000000000000', // WETH
    '0x0000000000000000000000000000000000000000', // WBTC
    '0x55d398326f99059ff775485246999027b3197955', // USDT
    '0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d', // DAI
    '0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d', // USDC
]

// LOCKUP -- TO BE DEPRECATED?
export const LOCKUP_BLOCK_NUMBER = BigInt.fromI32(10959148)

// minimum liquidity required to count towards tracked volume for pairs with small # of Lps
export const MINIMUM_USD_THRESHOLD_NEW_PAIRS = BigDecimal.fromString('0')

// minimum liquidity providers for price to get tracked
export const MINIMUM_LIQUIDITY_PROVIDERS = BigInt.fromString('0')

// MasterChefV2 precision
export const ACC_JOE_PRECISION = BigInt.fromString('1000000000000')
