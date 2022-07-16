import {
  ADDRESS_ZERO,
  BIG_DECIMAL_ONE,
  BIG_DECIMAL_ZERO,
  FACTORY_ADDRESS,
  WHITELIST,
  JOE_USDT_PAIR_ADDRESS,
  WAVAX_STABLE_PAIRS,
  WAVAX_ADDRESS,
  USDT_ADDRESS,
  JOE_TOKEN_ADDRESS,
  TRADERJOE_START_BLOCK,
  MINIMUM_LIQUIDITY_THRESHOLD_AVAX
} from 'const'
import { Address, BigDecimal, ethereum, log } from '@graphprotocol/graph-ts'
import { Pair, Token } from '../../generated/schema'

import { Factory as FactoryContract } from '../../generated/Factory/Factory'

export const factoryContract = FactoryContract.bind(FACTORY_ADDRESS)

/*
 * Base JOE price using JOE/AVAX * AVAX. 
 * WAvg price would be better, but JOE/AVAX is bulk of liquidity. 
 */
export function getJoePrice(block: ethereum.Block = null): BigDecimal {
  const avax_rate = getAvaxRate(JOE_TOKEN_ADDRESS)
  const avax_price = getAvaxPrice()
  const price = avax_rate.times(avax_price)
  return price
}

/*
 * JOE price is the weighted average of JOE/AVAX * AVAX and JOE/USDT.
 *
 */
export function getWavgJoePrice(block: ethereum.Block = null): BigDecimal {
  // get JOE/USDT
  const usdt_pair = Pair.load(JOE_USDT_PAIR_ADDRESS.toString())
  const usdt_price = usdt_pair
    ? usdt_pair.token0 == JOE_TOKEN_ADDRESS.toHexString()
      ? usdt_pair.token1Price
      : usdt_pair.token0Price
    : BIG_DECIMAL_ZERO
  const usdt_weight = usdt_pair
    ? usdt_pair.token0 == JOE_TOKEN_ADDRESS.toHexString()
      ? usdt_pair.reserve0
      : usdt_pair.reserve1
    : BIG_DECIMAL_ZERO

  // get JOE/AVAX
  const joe_wavax_address = factoryContract.getPair(JOE_TOKEN_ADDRESS, WAVAX_ADDRESS)
  const avax_pair = Pair.load(joe_wavax_address.toString())
  const avax_rate = avax_pair
    ? avax_pair.token0 == JOE_TOKEN_ADDRESS.toHexString()
      ? avax_pair.token1Price
      : avax_pair.token0Price
    : BIG_DECIMAL_ZERO
  const avax_weight = avax_pair
    ? avax_pair.token0 == JOE_TOKEN_ADDRESS.toHexString()
      ? avax_pair.reserve0
      : avax_pair.reserve1
    : BIG_DECIMAL_ZERO
  const avax_price = avax_rate.times(getAvaxPrice())

  // weighted avg
  const sumprod = usdt_price.times(usdt_weight).plus(avax_price.times(avax_weight))
  const sumweights = usdt_weight.plus(avax_weight)
  const wavg = sumprod.div(sumweights)
  return wavg
}

/*
 * Bundle tracks the price of AVAX, it is used to convert from AVAX price to USD price.
 * Exchange subgraph only keeps 1 bundle; it is updated during factory sync() event.
 *
 * This is different from getAvaxRate which calculates AVAX price for token, as it only
 * calculates price in USD for AVAX.
 *
 * AVAX price is calculated by getting weighted average of stable-coin pairs.
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
    log.debug('getAvaxPrice, address: {}, price: {}, weight: {}', [pair_address, price.toString(), weight.toString()])
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
  return avax
}

// returns avax reserves given e.g. avax-usdt or avax-dai pair
function _getAvaxReserve(pair: Pair | null): BigDecimal {
  if (pair == null) {
    return BIG_DECIMAL_ZERO
  }
  const avax = pair.token0 == WAVAX_ADDRESS.toHexString() ? pair.reserve0 : pair.reserve1
  return avax
}

/*
 * Get price of token in Avax.
 * Loop through WHITELIST to get Avax/Token rate.
 */
export function getAvaxRate(address: Address): BigDecimal {
  if (address == WAVAX_ADDRESS) {
    return BIG_DECIMAL_ONE
  }
  // TODO: This is slow, and this function is called quite often.
  // What could we do to improve this?
  for (let i = 0; i < WHITELIST.length; ++i) {
    // TODO: Cont. This would be a good start, by avoiding multiple calls to getPair...
    const pairAddress = factoryContract.getPair(address, Address.fromString(WHITELIST[i]))

    if (pairAddress != ADDRESS_ZERO) {
      const pair = Pair.load(pairAddress.toHex())
      if (pair.token0 == address.toHexString() && pair.reserveAVAX.gt(MINIMUM_LIQUIDITY_THRESHOLD_AVAX)) {
        const token1 = Token.load(pair.token1)
        return pair.token1Price.times(token1.derivedAVAX as BigDecimal) // return token1 per our token * AVAX per token 1
      }
      if (pair.token1 == address.toHexString() && pair.reserveAVAX.gt(MINIMUM_LIQUIDITY_THRESHOLD_AVAX)) {
        const token0 = Token.load(pair.token0)
        return pair.token0Price.times(token0.derivedAVAX as BigDecimal) // return token0 per our token * AVAX per token 0
      }
    }
  }

  return BIG_DECIMAL_ZERO // nothing was found return 0
}

/*
 * Get price of token in USD.
 */
export function getUSDRate(address: Address, block: ethereum.Block = null): BigDecimal {
  if (address == USDT_ADDRESS) {
    return BIG_DECIMAL_ONE
  }

  const avaxRate = getAvaxRate(address)
  const avaxPrice = getAvaxPrice()

  return avaxRate.times(avaxPrice)
}
