import {
  ADDRESS_ZERO,
  BIG_DECIMAL_1E18,
  BIG_DECIMAL_ONE,
  BIG_DECIMAL_ZERO,
  // DAI_WETH_PAIR,
  FACTORY_ADDRESS,
  MINIMUM_LIQUIDITY_THRESHOLD_ETH,
  // SUSHI_USDT_PAIR,
  // USDC_WETH_PAIR,
  // USDT_WETH_PAIR,
  // WETH_ADDRESS,
  // WHITELIST,
  BAMBOOV2_TOKEN_ADDRESS,
  BAMBOOV2_USDT_PAIR_ADDRESS,
  PANDASWAP_START_BLOCK, 
  PANDASWAP_WAVAX_USDT_PAIR_ADDRESS,
  USDT_ADDRESS,
  WAVAX_ADDRESS,
} from 'const'
import { Address, BigDecimal, BigInt, ethereum, log } from '@graphprotocol/graph-ts'
import { Pair, Token } from '../../generated/schema'

import { Factory as FactoryContract } from '../../generated/Factory/Factory'
import { Pair as PairContract } from '../../generated/Factory/Pair'

// export const uniswapFactoryContract = FactoryContract.bind(Address.fromString("0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f"))

export const factoryContract = FactoryContract.bind(FACTORY_ADDRESS)

export function getBambooV2Price(): BigDecimal {
  
  const pair = Pair.load(BAMBOOV2_USDT_PAIR_ADDRESS.toString())

  if (pair) {
    return pair.token1Price
  }

  return BIG_DECIMAL_ZERO
}

export function getAvaxPrice(block: ethereum.Block = null): BigDecimal {

  // TODO: fallback to e.g. pangolin
  if (block !== null && block.number.le(PANDASWAP_START_BLOCK)) {
    return BIG_DECIMAL_ZERO
  }

  // TODO: get weighted average prices across many avax/stable pairs
  const avaxUsdtPair = Pair.load(PANDASWAP_WAVAX_USDT_PAIR_ADDRESS.toString()) 
  
  if (avaxUsdtPair == null) {
    log.warning('No eth pair...', [])
    return BIG_DECIMAL_ZERO
  }

  return avaxUsdtPair.token0Price
}

export function findAvaxPerToken(token: Token): BigDecimal {
  if (Address.fromString(token.id) == WAVAX_ADDRESS) {
    return BIG_DECIMAL_ONE
  }

  // TODO: explore why sushi loops through a whitelist
  const address = factoryContract.getPair(Address.fromString(token.id), WAVAX_ADDRESS)
  
  if (address == ADDRESS_ZERO) {
    log.info('Address ZERO...', [])
    return BIG_DECIMAL_ZERO
  }

  const pair = Pair.bind(address)

  const reserves = pair.getReserves()

  let avax =
    pair.token0() == WAVAX_ADDRESS
      ? reserves.value0.toBigDecimal().times(BIG_DECIMAL_1E18).div(reserves.value1.toBigDecimal())
      : reserves.value1.toBigDecimal().times(BIG_DECIMAL_1E18).div(reserves.value0.toBigDecimal())

  return avax.div(BIG_DECIMAL_1E18)

  // // loop through whitelist and check if paired with any

  // // TODO: This is slow, and this function is called quite often.
  // // What could we do to improve this?
  // for (let i = 0; i < WHITELIST.length; ++i) {
  //   // TODO: Cont. This would be a good start, by avoiding multiple calls to getPair...
  //   const pairAddress = factoryContract.getPair(Address.fromString(token.id), Address.fromString(WHITELIST[i]))
  //   if (pairAddress != ADDRESS_ZERO) {
  //     const pair = Pair.load(pairAddress.toHex())
  //     if (pair.token0 == token.id) {
  //       const token1 = Token.load(pair.token1)
  //       return pair.token1Price.times(token1.derivedAVAX as BigDecimal) // return token1 per our token * Eth per token 1
  //     }
  //     if (pair.token1 == token.id) {
  //       const token0 = Token.load(pair.token0)
  //       return pair.token0Price.times(token0.derivedAVAX as BigDecimal) // return token0 per our token * ETH per token 0
  //     }
  //   }
  // }

  // return BIG_DECIMAL_ZERO // nothing was found return 0
}
