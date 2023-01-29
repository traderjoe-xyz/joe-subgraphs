import {
  ADDRESS_ZERO,
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

  if (priceUsdResult.reverted) {
    log.warning("[getAvaxPrice] dexLens.getTokenPriceUSD() reverted", []);
    return BIG_DECIMAL_ZERO;
  }

  const priceUSD = priceUsdResult.value.toBigDecimal().div(BIG_DECIMAL_1E6);

  return priceUSD;
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

  if (priceInAvaxResult.reverted) {
    log.warning(
      "[getAvaxRate] dexLens.getTokenPriceNative() reverted for token {}",
      [address.toHexString()]
    );
    return BIG_DECIMAL_ZERO;
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
