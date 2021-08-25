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

export const LOCKUP_POOL_NUMBER = BigInt.fromI32(29)

export const NULL_CALL_RESULT_VALUE = '0x0000000000000000000000000000000000000000000000000000000000000001'

// EXCHANGE
export const FACTORY_ADDRESS = Address.fromString('0x9ad6c38be94206ca50bb0d90783181662f0cfa10')
export const TRADERJOE_START_BLOCK = BigInt.fromI32(2486000)

export const JOE_TOKEN_ADDRESS = Address.fromString('0x6e84a6216ea6dacc71ee8e6b0a5b7322eebc0fdd')

// MASTER CHEF
export const MASTER_CHEF_ADDRESS = Address.fromString('0x0000000000000000000000000000000000000000')
export const MASTER_CHEF_V2_ADDRESS = Address.fromString('0xd6a4f121ca35509af06a0be99093d08462f53052')
export const MASTER_CHEF_START_BLOCK = BigInt.fromI32(2486000)

// BAR
export const JOE_BAR_ADDRESS = Address.fromString('0x57319d41f71e81f3c65f2a47ca4e001ebafd4f33')

// MAKER
export const JOE_MAKER_ADDRESS = Address.fromString('0x861726bfe27931a4e22a7277bde6cb8432b65856')

// PRICING
export const TRADERJOE_WAVAX_USDT_PAIR_ADDRESS = Address.fromString('0xed8cbd9f0ce3c6986b22002f03c6475ceb7a6256')
export const JOE_USDT_PAIR_ADDRESS = Address.fromString('0x1643de2efb8e35374d796297a9f95f64c082a8ce')

export const WAVAX_ADDRESS = Address.fromString('0xb31f66aa3c1e785363f0875a1b74e27b85fd66c7')
export const USDT_ADDRESS = Address.fromString('0xc7198437980c041c805a1edcba50c1ce5db95118')
export const USDC_ADDRESS = Address.fromString('0xA7D7079b0FEaD91F3e65f86E8915Cb59c1a4C664')
export const WBTC_ADDRESS = Address.fromString('0x50b7545627a5162F82A992c33b87aDc75187B218')



export const WAVAX_STABLE_PAIRS: string[] = [
    '0xed8cbd9f0ce3c6986b22002f03c6475ceb7a6256', // WAVAX-USDT
    '0xed8cbd9f0ce3c6986b22002f03c6475ceb7a6256',  // WAVAX-DAI
]

export const WHITELIST: string[] = [
    '0xb31f66aa3c1e785363f0875a1b74e27b85fd66c7', // WAVAX
    '0x49d5c2bdffac6ce2bfdb6640f4f80f226bc10bab', // WETH
    '0x50b7545627a5162f82a992c33b87adc75187b218', // WBTC
    '0xc7198437980c041c805a1edcba50c1ce5db95118', // USDT
    '0xd586e7f844cea2f87f50152665bcbc2c279d8d70', // DAI
]

// LOCKUP -- TO BE DEPRECATED?
export const LOCKUP_BLOCK_NUMBER = BigInt.fromI32(10959148)

// minimum liquidity required to count towards tracked volume for pairs with small # of Lps
export const MINIMUM_USD_THRESHOLD_NEW_PAIRS = BigDecimal.fromString('0')

// minimum liquidity for price to get tracked
export const MINIMUM_LIQUIDITY_THRESHOLD_ETH = BigDecimal.fromString('5')

// MasterChefV2 precision
export const ACC_JOE_PRECISION = BigInt.fromString('1000000000000')
