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
export const FACTORY_ADDRESS = Address.fromString('0x86f83be9770894d8e46301b12e88e14adc6cdb5f')
export const TRADERJOE_START_BLOCK = BigInt.fromI32(8438448)

export const JOE_TOKEN_ADDRESS = Address.fromString('0xce347e069b68c53a9ed5e7da5952529caf8accd4')

// MASTER CHEF
export const MASTER_CHEF_ADDRESS = Address.fromString('0x770b6e8a1b39f1a3ea06069cbd6d1e0b5db264f3')
export const MASTER_CHEF_V2_ADDRESS = Address.fromString('0x1f51b7697a1919cf301845c93d4843fd620ad7cc')
export const MASTER_CHEF_V3_ADDRESS = Address.fromString('0xeedf119022f1bb5f63676bbe855c82151b7198af')
export const MASTER_CHEF_START_BLOCK = BigInt.fromI32(9400000)

// BAR
export const JOE_BAR_ADDRESS = Address.fromString('0x33a86afc0f728882f48e5105bc98758b3eae2081')

// MAKER
export const JOE_MAKER_ADDRESS = Address.fromString('0xbefe1d0756da706b3f0ebaea7b4ae10d0adf2f3f')

// PRICING
export const TRADERJOE_WAVAX_USDT_PAIR_ADDRESS = Address.fromString('0x63fce17ba68c82a322fdd5a4d03aedbedbd730fd')
export const JOE_USDT_PAIR_ADDRESS = Address.fromString('0x961ef01283b7f90b2346f3dcec9d8291bdacae92')

export const WAVAX_ADDRESS = Address.fromString('0xc778417e063141139fce010982780140aa0cd5ab')
export const USDT_ADDRESS = Address.fromString('0x5b8470fbc6b31038aa07abd3010acffca6e36611')
export const USDC_ADDRESS = Address.fromString('0x5b8470fbc6b31038aa07abd3010acffca6e36611')
export const WBTC_ADDRESS = Address.fromString('0x5b8470fbc6b31038aa07abd3010acffca6e36611')
export const TIME_ADDRESS = Address.fromString('0xb54f16fb19478766a268f172c9480f8da1a7c9c3')
export const APEX_ADDRESS = Address.fromString('0xd039c9079ca7f2a87d632a9c0d7cea0137bacfb5')
export const GB_ADDRESS = Address.fromString('0x90842eb834cfd2a1db0b1512b254a18e4d396215')
export const MYAK_ADDRESS = Address.fromString('0xddaaad7366b455aff8e7c82940c43ceb5829b604')

export const WAVAX_STABLE_PAIRS: string[] = [
    '0x63fce17ba68c82a322fdd5a4d03aedbedbd730fd', // WAVAX-USDT
    '0x63fce17ba68c82a322fdd5a4d03aedbedbd730fd', // WAVAX-DAI
    '0x63fce17ba68c82a322fdd5a4d03aedbedbd730fd', // WAVAX-USDC
]

export const WHITELIST: string[] = [
    '0xc778417e063141139fce010982780140aa0cd5ab', // WAVAX
    '0xc778417e063141139fce010982780140aa0cd5ab', // WETH
    '0x5b8470fbc6b31038aa07abd3010acffca6e36611', // WBTC
    '0x5b8470fbc6b31038aa07abd3010acffca6e36611', // USDT
    '0x5b8470fbc6b31038aa07abd3010acffca6e36611', // DAI
    '0x5b8470fbc6b31038aa07abd3010acffca6e36611', // USDC
]

// LOCKUP -- TO BE DEPRECATED?
export const LOCKUP_BLOCK_NUMBER = BigInt.fromI32(10959148)

// minimum liquidity required to count towards tracked volume for pairs with small # of Lps
export const MINIMUM_USD_THRESHOLD_NEW_PAIRS = BigDecimal.fromString('0')

// minimum liquidity for price to get tracked
export const MINIMUM_LIQUIDITY_THRESHOLD_ETH = BigDecimal.fromString('5')

// MasterChefV2 precision
export const ACC_JOE_PRECISION = BigInt.fromString('1000000000000')
