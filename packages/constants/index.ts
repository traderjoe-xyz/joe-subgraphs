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
export const FACTORY_ADDRESS = Address.fromString('0x86f83be9770894d8e46301b12E88e14AdC6cdb5F')
export const TRADERJOE_START_BLOCK = BigInt.fromI32(8438448)

export const JOE_TOKEN_ADDRESS = Address.fromString('0x4bCa851F272B1a3DAdb077e86AFa94910160d03E')

// MASTER CHEF
export const MASTER_CHEF_ADDRESS = Address.fromString('0x770B6E8a1b39F1a3ea06069cbd6d1e0b5dB264f3')
export const MASTER_CHEF_V2_ADDRESS = Address.fromString('0x30e112880b60Cc8046653B246b147EB681BC2D79')
export const MASTER_CHEF_START_BLOCK = BigInt.fromI32(8455513)

// BAR
export const JOE_BAR_ADDRESS = Address.fromString('0xd7FeB56CAc77d610b0ab006eF2a0511b7EbF4a3E')

// MAKER
export const JOE_MAKER_ADDRESS = Address.fromString('0x5B29eb224f30Cf3d9a91149167cd761F1975CF9a')

// PRICING
export const TRADERJOE_WAVAX_USDT_PAIR_ADDRESS = Address.fromString('0x6d551ad3570888d49da4d6c8b8a626c8cbfd5ac2')
export const JOE_USDT_PAIR_ADDRESS = Address.fromString('0x7246a837cf85135bc2759f870431cbf9eca408d2')

export const WAVAX_ADDRESS = Address.fromString('0xc778417e063141139fce010982780140aa0cd5ab')
export const USDT_ADDRESS = Address.fromString('0x9Ad6C38BE94206cA50bb0d90783181662f0Cfa10 ')

export const WAVAX_STABLE_PAIRS: string[] = [
    '0x6d551ad3570888d49da4d6c8b8a626c8cbfd5ac2', // WAVAX-USDT
    '0x6d551ad3570888d49da4d6c8b8a626c8cbfd5ac2',  // WAVAX-DAI
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
