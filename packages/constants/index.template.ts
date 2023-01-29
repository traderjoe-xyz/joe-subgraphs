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
export const FACTORY_ADDRESS = Address.fromString('{{ factory_address }}')
export const TRADERJOE_START_BLOCK = BigInt.fromI32({{ trader_joe_start_block }})

export const JOE_TOKEN_ADDRESS = Address.fromString('{{ joe_token_address }}')
export const JOE_DEX_LENS_ADDRESS = Address.fromString('{{ joe_dex_lens_address }}');

// MASTER CHEF
export const MASTER_CHEF_ADDRESS = Address.fromString('{{ masterchef_address }}')
export const MASTER_CHEF_V2_ADDRESS = Address.fromString('{{ masterchefV2_address }}')
export const MASTER_CHEF_V3_ADDRESS = Address.fromString('{{ masterchefV3_address }}')
export const BOOSTED_MASTER_CHEF_ADDRESS = Address.fromString('{{ boostedMasterChef_address }}')

export const MASTER_CHEF_START_BLOCK = BigInt.fromI32({{ master_chef_start_block }})

// BAR
export const JOE_BAR_ADDRESS = Address.fromString('{{ joe_bar_address }}')

// MAKER
export const JOE_MAKER_ADDRESS = Address.fromString('{{ joe_maker_address }}')
export const JOE_MAKER_V2_ADDRESS = Address.fromString('{{ joe_makerV2_address }}')

// PRICING
export const TRADERJOE_WAVAX_USDT_PAIR_ADDRESS = Address.fromString('{{ wavax_usdt_pair_address }}')
export const JOE_USDT_PAIR_ADDRESS = Address.fromString('{{ joe_usdt_pair_address }}')

// VEJOE 
export const VEJOE_TOKEN_ADDRESS = Address.fromString('{{ vejoeToken_address }}')

export const WAVAX_ADDRESS = Address.fromString('{{ wavax_address }}')
export const USDT_ADDRESS = Address.fromString('{{ usdt_address }}')
export const USDC_E_ADDRESS = Address.fromString('{{ usdc_e_address }}')
export const USDC_ADDRESS = Address.fromString('{{ usdc_address }}')
export const WBTC_ADDRESS = Address.fromString('{{ wbtc_address }}')

export const WAVAX_STABLE_PAIRS: string[] = [
    '{{ wavax_usdt_pair_address }}', // WAVAX-USDT
    '{{ wavax_dai_pair_address }}', // WAVAX-DAI
    '{{ wavax_usdc_pair_address }}', // WAVAX-USDC
    '{{ wavax_mim_pair_address }}', // WAVAX-USDC
]

export const WHITELIST: string[] = [
    '{{ wavax_address }}', // WAVAX
    '{{ weth_address }}', // WETH
    '{{ wbtc_address }}', // WBTC
    '{{ usdt_address }}', // USDT
    '{{ dai_address }}', // DAI
    '{{ usdc_address }}', // USDC
]

// LOCKUP -- TO BE DEPRECATED?
export const LOCKUP_BLOCK_NUMBER = BigInt.fromI32(10959148)

// minimum liquidity required to count towards tracked volume for pairs with small # of Lps
export const MINIMUM_USD_THRESHOLD_NEW_PAIRS = BigDecimal.fromString('{{ min_usd_threshold_new_pairs }}')

// minimum liquidity providers for price to get tracked
export const MINIMUM_LIQUIDITY_PROVIDERS = BigInt.fromString('{{ min_liquidity_providers }}')

// MasterChefV2 precision
export const ACC_JOE_PRECISION = BigInt.fromString('1000000000000')
