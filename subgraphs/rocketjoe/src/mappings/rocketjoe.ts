import { BigDecimal, BigInt, dataSource, ethereum, log } from '@graphprotocol/graph-ts'
import {
  BIG_DECIMAL_1E18,
  BIG_DECIMAL_1E6,
  BIG_DECIMAL_ZERO,
  JOE_USDT_PAIR_ADDRESS,
} from 'const'
import { Deposit as DepositEvent, Withdraw as WithdrawEvent } from '../../generated/RocketJoeStaking/RocketJoeStaking'
import { RocketJoe } from '../../generated/schema'
import { Pair as PairContract } from '../../generated/RocketJoeStaking/Pair'
import { getRocketJoeDayData } from '../entities'

function getJoePrice(): BigDecimal {
  const pair = PairContract.bind(JOE_USDT_PAIR_ADDRESS)
  const reservesResult = pair.try_getReserves()
  if (reservesResult.reverted) {
    log.info('[getJoePrice] getReserves reverted', [])
    return BIG_DECIMAL_ZERO
  }
  const reserves = reservesResult.value
  if (reserves.value0.toBigDecimal().equals(BigDecimal.fromString('0'))) {
    log.error('[getJoePrice] USDT reserve 0', [])
    return BIG_DECIMAL_ZERO
  }
  return reserves.value1.toBigDecimal().times(BIG_DECIMAL_1E18).div(reserves.value0.toBigDecimal()).div(BIG_DECIMAL_1E6)
}

export function convertAmountToDecimal(tokenAmount: BigInt): BigDecimal {
  return tokenAmount.toBigDecimal().div(exponentToBigDecimal(BigInt.fromString('18')))
}

export function exponentToBigDecimal(decimals: BigInt): BigDecimal {
  let bd = BigDecimal.fromString('1')
  for (let i = BigInt.fromI32(0); i.lt(decimals as BigInt); i = i.plus(BigInt.fromI32(1))) {
    bd = bd.times(BigDecimal.fromString('10'))
  }
  return bd
}

function createRocketJoe(block: ethereum.Block): RocketJoe {
  log.debug('[createRocketJoe] from {}', [dataSource.address().toHex()])

  const rocketJoe = new RocketJoe(dataSource.address().toHex())
  rocketJoe.joeStaked = BIG_DECIMAL_ZERO
  rocketJoe.joeStakedUSD = BIG_DECIMAL_ZERO
  rocketJoe.updatedAt = block.timestamp
  rocketJoe.save()

  return rocketJoe as RocketJoe
}

function getRocketJoe(block: ethereum.Block): RocketJoe {
  log.debug('[getRocketJoe] from {}', [dataSource.address().toHex()])

  let rocketJoe = RocketJoe.load(dataSource.address().toHex())

  if (rocketJoe === null) {
    rocketJoe = createRocketJoe(block)
  }

  return rocketJoe as RocketJoe
}

export function handleDeposit(event: DepositEvent): void {
  log.debug('[handleDeposit] from {}', [dataSource.address().toHex()])

  const rocketJoe = getRocketJoe(event.block)
  const joePrice = getJoePrice()

  log.debug('[handleDeposit] updating rocketJoe and saving {}', [event.address.toHexString()])
  rocketJoe.joeStaked = rocketJoe.joeStaked.plus(convertAmountToDecimal(event.params.amount))
  rocketJoe.joeStakedUSD = rocketJoe.joeStaked.times(joePrice)
  rocketJoe.updatedAt = event.block.timestamp
  rocketJoe.save()

  log.debug('[handleDeposit] update day data {}', [event.address.toHexString()])
  let rocketJoeDayData = getRocketJoeDayData(event.address, event.block)
  rocketJoeDayData.totalJoeStaked = rocketJoe.joeStaked
  rocketJoeDayData.joeStaked = rocketJoeDayData.joeStaked.plus(convertAmountToDecimal(event.params.amount))
  rocketJoeDayData.joeStakedUSD = rocketJoeDayData.joeStaked.times(joePrice)

  rocketJoeDayData.save()
}

export function handleWithdraw(event: WithdrawEvent): void {
  log.debug('[handleWithdraw] from {}', [dataSource.address().toHex()])
  const rocketJoe = getRocketJoe(event.block)
  const joePrice = getJoePrice()

  log.debug('[handleWithdraw] updating rocketJoe {}', [event.address.toHexString()])
  rocketJoe.joeStaked = rocketJoe.joeStaked.minus(convertAmountToDecimal(event.params.amount))
  rocketJoe.joeStakedUSD = rocketJoe.joeStaked.times(joePrice)
  rocketJoe.updatedAt = event.block.timestamp
  rocketJoe.save()

  log.debug('[handleWithdraw] updating day data {}', [event.address.toHexString()])
  let rocketJoeDayData = getRocketJoeDayData(event.address, event.block)
  rocketJoeDayData.totalJoeStaked = rocketJoe.joeStaked
  rocketJoeDayData.joeUnstaked = rocketJoeDayData.joeUnstaked.plus(convertAmountToDecimal(event.params.amount))
  rocketJoeDayData.joeUnstakedUSD = rocketJoeDayData.joeUnstaked.times(joePrice)

  rocketJoeDayData.save()
}
