import { BigDecimal, BigInt, ethereum } from '@graphprotocol/graph-ts'
import { Token, TokenHourData } from '../../../generated/schema'

import { BIG_DECIMAL_ZERO } from 'const'
import { getBundle } from '.'

export function getTokenHourData(token: Token, event: ethereum.Event): TokenHourData {
  const bundle = getBundle()

  const timestamp = event.block.timestamp.toI32()

  const hour = timestamp / 3600

  const date = hour * 3600

  const id = token.id.toString().concat('-').concat(BigInt.fromI32(hour).toString())

  let tokenHourData = TokenHourData.load(id)

  if (tokenHourData === null) {
    tokenHourData = new TokenHourData(id)
    tokenHourData.date = date
    tokenHourData.token = token.id
    tokenHourData.priceUSD = token.derivedAVAX.times(bundle.avaxPrice)
    tokenHourData.volume = BIG_DECIMAL_ZERO
    tokenHourData.volumeAVAX = BIG_DECIMAL_ZERO
    tokenHourData.volumeUSD = BIG_DECIMAL_ZERO
    tokenHourData.liquidityUSD = BIG_DECIMAL_ZERO
    tokenHourData.txCount = BigInt.fromI32(0)
  }

  return tokenHourData as TokenHourData
}

export function updateTokenHourData(token: Token, event: ethereum.Event): TokenHourData {
  const bundle = getBundle()

  const tokenHourData = getTokenHourData(token, event)

  tokenHourData.priceUSD = token.derivedAVAX.times(bundle.avaxPrice)
  tokenHourData.liquidity = token.liquidity
  tokenHourData.liquidityAVAX = token.liquidity.times(token.derivedAVAX as BigDecimal)
  tokenHourData.liquidityUSD = tokenHourData.liquidityAVAX.times(bundle.avaxPrice)
  tokenHourData.txCount = tokenHourData.txCount.plus(BigInt.fromI32(1))

  tokenHourData.save()

  return tokenHourData as TokenHourData
}
