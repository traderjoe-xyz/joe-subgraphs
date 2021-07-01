import { Address, BigInt, Bytes, ByteArray } from '@graphprotocol/graph-ts'
import { concat } from '@graphprotocol/graph-ts/helper-functions'
import { Swap } from '../generated/templates/Pair/Pair'
import { PairCreated } from '../generated/Factory/Factory'
import { Pair as PairTemplate } from '../generated/templates'
import { Pair, Candle } from '../generated/schema'

export function handleNewPair(event: PairCreated): void {
  const pair = new Pair(event.params.pair.toHex())
  pair.token0 = event.params.token0
  pair.token1 = event.params.token1
  pair.save()

  PairTemplate.create(event.params.pair)
}

export function handleSwap(event: Swap): void {
  const pair = Pair.load(event.address.toHex())
  const usdtAddress = Address.fromString(
    ByteArray.fromHexString('0xde3A24028580884448a5397872046a019649b084').toHexString()
  )

  // Because USDT is 6 decimals, we shift right 12 decimals
  const token0Amount: BigInt =
    pair.token0 === usdtAddress
      ? event.params.amount0In.minus(event.params.amount0Out).abs().rightShift(12)
      : event.params.amount0In.minus(event.params.amount0Out).abs()

  const token1Amount: BigInt =
    pair.token1 === usdtAddress
      ? event.params.amount1Out.minus(event.params.amount1In).abs().rightShift(12)
      : event.params.amount1Out.minus(event.params.amount1In).abs()

  if (token0Amount.isZero() || token1Amount.isZero()) {
    return
  }

  const price = token0Amount.divDecimal(token1Amount.toBigDecimal())
  const tokens = concat(pair.token0, pair.token1)
  const timestamp = event.block.timestamp.toI32()

  const periods: i32[] = [5 * 60, 15 * 60, 60 * 60, 4 * 60 * 60, 24 * 60 * 60, 7 * 24 * 60 * 60]
  for (let i = 0; i < periods.length; i++) {
    const time_id = timestamp / periods[i]
    const candle_id = concat(concat(Bytes.fromI32(time_id), Bytes.fromI32(periods[i])), tokens).toHex()
    let candle = Candle.load(candle_id)
    if (candle === null) {
      candle = new Candle(candle_id)
      candle.time = timestamp - (timestamp % periods[i]) // Round to the nearest time period
      candle.period = periods[i]
      candle.token0 = pair.token0
      candle.token1 = pair.token1
      candle.open = price
      candle.low = price
      candle.high = price
      candle.token0TotalAmount = BigInt.fromI32(0)
      candle.token1TotalAmount = BigInt.fromI32(0)
    } else {
      if (price < candle.low) {
        candle.low = price
      }
      if (price > candle.high) {
        candle.high = price
      }
    }

    candle.close = price
    candle.lastBlock = event.block.number.toI32()
    candle.token0TotalAmount = candle.token0TotalAmount.plus(token0Amount)
    candle.token1TotalAmount = candle.token1TotalAmount.plus(token1Amount)
    candle.save()
  }
}
