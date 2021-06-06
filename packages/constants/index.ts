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
export const FACTORY_ADDRESS = Address.fromString('0xE2eCc226Fd2D5CEad96F3f9f00eFaE9fAfe75eB8')
export const TRADERJOE_START_BLOCK = BigInt.fromI32(8438448)

export const JOE_TOKEN_ADDRESS = Address.fromString('0x8b405c4464e75Da7b1f91B1f7695b6b72059D6C7')

// MASTER CHEF
export const MASTER_CHEF_ADDRESS = Address.fromString('0xDa78543E5202216684734fBC003E578fd32c3869')
export const MASTER_CHEF_V2_ADDRESS = Address.fromString('0x30D906965307B6deE13737c3FD550e95D9f3b8b3')
export const MASTER_CHEF_START_BLOCK = BigInt.fromI32(8455513)

// BAR
export const JOE_BAR_ADDRESS = Address.fromString('0x9B8536B0710196865b7bbc2BF2b448eC014C637b')

// MAKER
export const JOE_MAKER_ADDRESS = Address.fromString('0xA1688d70F98a5802b50aAc71D8c03ac385cc9fA5')

// PRICING
export const TRADERJOE_WAVAX_USDT_PAIR_ADDRESS = Address.fromString('0xbf21027fbf3e6fff156e9f2464881898e4672713')
export const JOE_USDT_PAIR_ADDRESS = Address.fromString('0xdb5109f6006bcefee2458a010dce3796bff79489')

export const WAVAX_ADDRESS = Address.fromString('0xc778417e063141139fce010982780140aa0cd5ab')
export const USDT_ADDRESS = Address.fromString('0xd92e713d051c37ebb2561803a3b5fbabc4962431')

export const WAVAX_STABLE_PAIRS: string[] = [
    '0xbf21027fbf3e6fff156e9f2464881898e4672713', // WAVAX-USDT
    '0xbf21027fbf3e6fff156e9f2464881898e4672713',  // WAVAX-DAI
]

export const WHITELIST: string[] = [
    '0xc778417e063141139fce010982780140aa0cd5ab', // WAVAX
    '0x5af59f281b3cfd0c12770e4633e6c16dd08ea543', // WBTC
    '0xd92e713d051c37ebb2561803a3b5fbabc4962431', // USDT
    '0x1521e5c11bdd02ca6cd1b35a34e176d87d9bdcd2', // DAI
]

// LOCKUP -- TO BE DEPRECATED?
export const LOCKUP_BLOCK_NUMBER = BigInt.fromI32(10959148)

// minimum liquidity required to count towards tracked volume for pairs with small # of Lps
export const MINIMUM_USD_THRESHOLD_NEW_PAIRS = BigDecimal.fromString('0')

// minimum liquidity for price to get tracked
export const MINIMUM_LIQUIDITY_THRESHOLD_ETH = BigDecimal.fromString('0')

// MasterChefV2 precision
export const ACC_JOE_PRECISION = BigInt.fromString('1000000000000')
