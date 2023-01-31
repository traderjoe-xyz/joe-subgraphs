import {
  ADDRESS_ZERO,
  BIG_INT_ZERO,
  BIG_DECIMAL_ONE,
  BIG_DECIMAL_ZERO,
  FACTORY_ADDRESS,
  WHITELIST,
  WAVAX_STABLE_PAIRS,
  WAVAX_ADDRESS,
  USDT_ADDRESS,
  JOE_DEX_LENS_ADDRESS,
  BIG_DECIMAL_1E6,
  BIG_DECIMAL_1E18
} from 'const'
import { Address, BigDecimal, ethereum, log } from '@graphprotocol/graph-ts'
import { Pair, Token } from '../../generated/schema'
import { DexLens } from '../../generated/Factory/DexLens'

import { Factory as FactoryContract } from '../../generated/Factory/Factory'

export const factoryContract = FactoryContract.bind(FACTORY_ADDRESS)

/*
 * Get price of AVAX in USD
 */
export function getAvaxPrice(): BigDecimal {
  const dexLens = DexLens.bind(JOE_DEX_LENS_ADDRESS);

  const priceUsdResult = dexLens.try_getTokenPriceUSD(WAVAX_ADDRESS);

  if (priceUsdResult.reverted || priceUsdResult.value.equals(BIG_INT_ZERO)) {
    log.warning("[getAvaxPrice] dexLens.getTokenPriceUSD() reverted", []);

    // fallback to previous way
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

  const priceUSD = priceUsdResult.value.toBigDecimal().div(BIG_DECIMAL_1E6);

  return priceUSD;
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
 * Get price of token in Avax for Dex Lens
 */
export function getAvaxRate(address: Address): BigDecimal {

  if (address == WAVAX_ADDRESS) {
    return BIG_DECIMAL_ONE
  }

  const dexLens = DexLens.bind(JOE_DEX_LENS_ADDRESS);

  const priceInAvaxResult = dexLens.try_getTokenPriceNative(address);

  if (priceInAvaxResult.reverted || priceInAvaxResult.value.equals(BIG_INT_ZERO)) {
    log.warning(
      "[getAvaxRate] dexLens.getTokenPriceNative() reverted for token {}",
      [address.toHexString()]
    );

    // fallback to previous way
    for (let i = 0; i < WHITELIST.length; ++i) {
      // TODO: Cont. This would be a good start, by avoiding multiple calls to getPair...
      const pairAddress = factoryContract.getPair(address, Address.fromString(WHITELIST[i]))
  
      if (pairAddress != ADDRESS_ZERO) {
        const pair = Pair.load(pairAddress.toHex())
        if (pair?.token0 == address.toHexString()) {
          const token1 = Token.load(pair.token1)
          return pair.token1Price.times(token1?.derivedAVAX as BigDecimal) // return token1 per our token * AVAX per token 1
        }
        if (pair?.token1 == address.toHexString()) {
          const token0 = Token.load(pair.token0)
          return pair.token0Price.times(token0?.derivedAVAX as BigDecimal) // return token0 per our token * AVAX per token 0
        }
      }
    }

    return BIG_DECIMAL_ZERO
  }

  const priceInAvax = priceInAvaxResult.value
    .toBigDecimal()
    .div(BIG_DECIMAL_1E18);

  return priceInAvax;
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
