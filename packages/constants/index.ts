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
export const FACTORY_ADDRESS = Address.fromString('0x86f83be9770894d8e46301b12e88e14adc6cdb5f')
export const TRADERJOE_START_BLOCK = BigInt.fromI32(8438448)

export const JOE_TOKEN_ADDRESS = Address.fromString('0x23fc76b53882d8dcab1900f0d3c1c0c504ffb8e3')

// MASTER CHEF
export const MASTER_CHEF_ADDRESS = Address.fromString('0x770b6e8a1b39f1a3ea06069cbd6d1e0b5db264f3')
export const MASTER_CHEF_V2_ADDRESS = Address.fromString('0xff6ea1c23107e0d835930612ee2f4cd975331d0d')
export const MASTER_CHEF_START_BLOCK = BigInt.fromI32(8455513)

// BAR
export const JOE_BAR_ADDRESS = Address.fromString('0x33a86afc0f728882f48e5105bc98758b3eae2081')

// MAKER
export const JOE_MAKER_ADDRESS = Address.fromString('0xbefe1d0756da706b3f0ebaea7b4ae10d0adf2f3f')

// PRICING
export const TRADERJOE_WAVAX_USDT_PAIR_ADDRESS = Address.fromString('0x6d551ad3570888d49da4d6c8b8a626c8cbfd5ac2')
export const JOE_USDT_PAIR_ADDRESS = Address.fromString('0xc23f448c7d255b4787b7e97df11f2b637f716809')

export const WAVAX_ADDRESS = Address.fromString('0xc778417e063141139fce010982780140aa0cd5ab')
export const USDT_ADDRESS = Address.fromString('0x9ad6c38be94206ca50bb0d90783181662f0cfa10 ')

export const WAVAX_STABLE_PAIRS: string[] = [
    '0x6d551ad3570888d49da4d6c8b8a626c8cbfd5ac2', // WAVAX-USDT
    '0x6d551ad3570888d49da4d6c8b8a626c8cbfd5ac2',  // WAVAX-DAI
]

export const WHITELIST: string[] = [
    '0xc778417e063141139fce010982780140aa0cd5ab', // WAVAX
    '0xc778417e063141139fce010982780140aa0cd5ab', // WETH
    '0x5af59f281b3cfd0c12770e4633e6c16dd08ea543', // WBTC
    '0x9ad6c38be94206ca50bb0d90783181662f0cfa10 ', // USDT
    '0x9ad6c38be94206ca50bb0d90783181662f0cfa10 ', // DAI
]

// LOCKUP -- TO BE DEPRECATED?
export const LOCKUP_BLOCK_NUMBER = BigInt.fromI32(10959148)

// minimum liquidity required to count towards tracked volume for pairs with small # of Lps
export const MINIMUM_USD_THRESHOLD_NEW_PAIRS = BigDecimal.fromString('0')

// minimum liquidity for price to get tracked
export const MINIMUM_LIQUIDITY_THRESHOLD_ETH = BigDecimal.fromString('5')

// MasterChefV2 precision
export const ACC_JOE_PRECISION = BigInt.fromString('1000000000000')
