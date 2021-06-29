import {
  ADDRESS_ZERO,
  BIG_DECIMAL_1E18,
  BIG_DECIMAL_ONE,
  BIG_DECIMAL_ZERO,
  // DAI_WETH_PAIR,
  FACTORY_ADDRESS,
  MINIMUM_LIQUIDITY_THRESHOLD_ETH,
  WHITELIST,
  // JOE_TOKEN_ADDRESS,
  JOE_USDT_PAIR_ADDRESS,
  // TRADERJOE_START_BLOCK,
  // USDT_ADDRESS,
  WAVAX_STABLE_PAIRS,
  WAVAX_ADDRESS,
} from 'const'
import { Address, BigDecimal, BigInt, ethereum, log } from '@graphprotocol/graph-ts'
import { Pair, Token } from '../../generated/schema'

import { Factory as FactoryContract } from '../../generated/Factory/Factory'
import { Pair as PairContract } from '../../generated/Factory/Pair'
import { getDecimals } from './enitites'

// export const uniswapFactoryContract = FactoryContract.bind(Address.fromString("<>"))

export const factoryContract = FactoryContract.bind(FACTORY_ADDRESS)

export function getJoePrice(): BigDecimal {
  const pair = Pair.load(JOE_USDT_PAIR_ADDRESS.toString())

  if (pair) {
    return pair.token1Price
  }

  return BIG_DECIMAL_ZERO
}

/*
 * Bundle tracks the price of AVAX, it is used to convert from AVAX price to USD price.
 * Exchange subgraph only keeps 1 bundle; it is updated during factory sync() event.
 *
 * This is different from getAvaxRate which calculates AVAX price for token, as it only
 * calculates price in USD for AVAX.
 *
 * AVAX price is calculated by getting average of 3 stablecoin pairs.
 * On mainnet, we will refer to e.g. PGL pairs to build price oracle.
 * On testnet, we will just use our own stable pairs.
 *
 */
export function getAvaxPrice(block: ethereum.Block = null): BigDecimal {
  let total_weight = BIG_DECIMAL_ZERO
  let sum_price = BIG_DECIMAL_ZERO

  for (let i = 0; i < WAVAX_STABLE_PAIRS.length; ++i) {
    const pair_address = WAVAX_STABLE_PAIRS[i]
    const pair = Pair.load(pair_address)
    const price = _getAvaxPrice(pair)
    const weight = _getAvaxReserve(pair)

    total_weight = total_weight.plus(weight)
    sum_price = sum_price.plus(price.times(weight))

    log.debug("getAvaxPrice, address: {}, price: {}, weight: {}", [pair_address, price.toString(), weight.toString()])
  }

  // div by 0
  const avax_price = total_weight.equals(BIG_DECIMAL_ZERO) ? BIG_DECIMAL_ZERO : sum_price.div(total_weight)
  return avax_price
}

// returns avax price given e.g. avax-usdt or avax-dai pair
function _getAvaxPrice(pair: Pair | null): BigDecimal {
  if (pair == null) {
    return BIG_DECIMAL_ZERO
  }
  const avax = pair.token0 == WAVAX_ADDRESS.toHexString() ? pair.token1Price : pair.token0Price
  log.debug("_getAvaxPrice, token0: {}, wavax: {}", [pair.token0, WAVAX_ADDRESS.toHexString()])

  return avax
  // return pair.token1Price
}

// returns avax reserves given e.g. avax-usdt or avax-dai pair
function _getAvaxReserve(pair: Pair | null): BigDecimal {
  if (pair == null) {
    return BIG_DECIMAL_ZERO
  }
  const avax = pair.token0 == WAVAX_ADDRESS.toHexString() ? pair.reserve0 : pair.reserve1
  return avax
  // return pair.reserve0
}

export function findAvaxPerToken(token: Token): BigDecimal {
  if (Address.fromString(token.id) == WAVAX_ADDRESS) {
    return BIG_DECIMAL_ONE
  }
  // TODO: This is slow, and this function is called quite often.
  // What could we do to improve this?
  for (let i = 0; i < WHITELIST.length; ++i) {
    // TODO: Cont. This would be a good start, by avoiding multiple calls to getPair...
    const pairAddress = factoryContract.getPair(Address.fromString(token.id), Address.fromString(WHITELIST[i]))

    if (pairAddress != ADDRESS_ZERO) {
      const pair = Pair.load(pairAddress.toHex())
      if (pair.token0 == token.id) {
        const token1 = Token.load(pair.token1)
        return pair.token1Price.times(token1.derivedAVAX as BigDecimal) // return token1 per our token * Eth per token 1
      }
      if (pair.token1 == token.id) {
        const token0 = Token.load(pair.token0)
        return pair.token0Price.times(token0.derivedAVAX as BigDecimal) // return token0 per our token * ETH per token 0
      }
    }
  }

  return BIG_DECIMAL_ZERO // nothing was found return 0
}
