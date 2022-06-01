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
export const FACTORY_ADDRESS = Address.fromString('0xF5c7d9733e5f53abCC1695820c4818C59B457C2C')
export const TRADERJOE_START_BLOCK = BigInt.fromI32(10220115)

export const JOE_TOKEN_ADDRESS = Address.fromString('0x477Fd10Db0D80eAFb773cF623B258313C3739413')

// MASTER CHEF
export const MASTER_CHEF_ADDRESS = Address.fromString('0x0000000000000000000000000000000000000000')
export const MASTER_CHEF_V2_ADDRESS = Address.fromString('0xEAA9637E54D4Da88d7A56E797C2EAa4950111033')
export const MASTER_CHEF_V3_ADDRESS = Address.fromString('0x47e4B09651D76609e902183c2315b0638fa8375E')
export const BOOSTED_MASTER_CHEF_ADDRESS = Address.fromString('0x25431a19250a8f5Bbbdee18E687C2c027966dC10')

export const MASTER_CHEF_START_BLOCK = BigInt.fromI32(9539146)

// BAR
export const JOE_BAR_ADDRESS = Address.fromString('0x200BdB3Ed6bF347421329FdbF1813dE87F1A456a')

// MAKER
export const JOE_MAKER_ADDRESS = Address.fromString('0x5b57Fef4e7f82f6c57a7Aca851Bc8c02F9AD3Bc5')
export const JOE_MAKER_V2_ADDRESS = Address.fromString('0x5b57Fef4e7f82f6c57a7Aca851Bc8c02F9AD3Bc5')

// PRICING
export const TRADERJOE_WAVAX_USDT_PAIR_ADDRESS = Address.fromString('0x7b6cba61a3a5fad18fde457d8dce869c86c31cb1')
export const JOE_USDT_PAIR_ADDRESS = Address.fromString('0x306df814844A902409D0126Da0D1220A7E734216')

// VEJOE 
export const VEJOE_TOKEN_ADDRESS = Address.fromString('0x5a00A25a85ee298b871168BcE3FCC22B101087D3')

export const WAVAX_ADDRESS = Address.fromString('0xd00ae08403B9bbb9124bB305C09058E32C39A48c')
export const USDT_ADDRESS = Address.fromString('0x3A82897FBa87e73aB4c5785E42f6a9F910b2C942')
export const USDC_E_ADDRESS = Address.fromString('0x3A82897FBa87e73aB4c5785E42f6a9F910b2C942')
export const USDC_ADDRESS = Address.fromString('0x3A82897FBa87e73aB4c5785E42f6a9F910b2C942')
export const WBTC_ADDRESS = Address.fromString('0x106Dc78d638527b84572e5B077B76250adD0A988')
export const MIM_ADDRESS = Address.fromString('0x3A82897FBa87e73aB4c5785E42f6a9F910b2C942')

export const WAVAX_STABLE_PAIRS: string[] = [
    '0x7b6cba61a3a5fad18fde457d8dce869c86c31cb1', // WAVAX-USDT
    '0x7b6cba61a3a5fad18fde457d8dce869c86c31cb1', // WAVAX-DAI
    '0x7b6cba61a3a5fad18fde457d8dce869c86c31cb1', // WAVAX-USDC
    '0x7b6cba61a3a5fad18fde457d8dce869c86c31cb1', // WAVAX-USDC
]

export const WHITELIST: string[] = [
    '0xd00ae08403B9bbb9124bB305C09058E32C39A48c', // WAVAX
    '0xc778417e063141139fce010982780140aa0cd5ab', // WETH
    '0x106Dc78d638527b84572e5B077B76250adD0A988', // WBTC
    '0x3A82897FBa87e73aB4c5785E42f6a9F910b2C942', // USDT
    '0x3A82897FBa87e73aB4c5785E42f6a9F910b2C942', // DAI
    '0x3A82897FBa87e73aB4c5785E42f6a9F910b2C942', // USDC
    '0x3A82897FBa87e73aB4c5785E42f6a9F910b2C942', // MIM
]

// LOCKUP -- TO BE DEPRECATED?
export const LOCKUP_BLOCK_NUMBER = BigInt.fromI32(10959148)

// minimum liquidity required to count towards tracked volume for pairs with small # of Lps
export const MINIMUM_USD_THRESHOLD_NEW_PAIRS = BigDecimal.fromString('0')

// minimum liquidity for price to get tracked
export const MINIMUM_LIQUIDITY_THRESHOLD_ETH = BigDecimal.fromString('5')

// MasterChefV2 precision
export const ACC_JOE_PRECISION = BigInt.fromString('1000000000000')
