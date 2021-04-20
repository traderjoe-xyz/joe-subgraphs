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

export const JOE_TOKEN_ADDRESS = Address.fromString('0x60aE616a2155Ee3d9A68541Ba4544862310933d4')

// MASTER CHEF
export const MASTER_CHEF_ADDRESS = Address.fromString('0x1Af353148F2316487b5311Fcd522c037842D232c')
export const MASTER_CHEF_START_BLOCK = BigInt.fromI32(8443458)

// BAR
export const JOE_BAR_ADDRESS = Address.fromString('0x1C4b41bA54492F551e98eD0A9A59B952a962C452')

// PRICING
export const TRADERJOE_WAVAX_USDT_PAIR_ADDRESS = Address.fromString('0x0000000000000000000000000000000000000000')
export const JOE_USDT_PAIR_ADDRESS = Address.fromString('0x0000000000000000000000000000000000000000')

export const WAVAX_ADDRESS = Address.fromString('0xc778417e063141139fce010982780140aa0cd5ab')
export const USDT_ADDRESS = Address.fromString('0xd92e713d051c37ebb2561803a3b5fbabc4962431')

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



