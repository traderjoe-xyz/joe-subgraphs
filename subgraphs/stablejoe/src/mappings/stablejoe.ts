import { BigDecimal, BigInt, ethereum, log } from '@graphprotocol/graph-ts';
import {
  BIG_DECIMAL_1E18,
  BIG_DECIMAL_1E6,
  BIG_DECIMAL_ZERO,
  JOE_USDT_PAIR_ADDRESS,
  USDC_ADDRESS,
  USDC_E_ADDRESS
} from 'const'
import {
  ClaimReward as ClaimRewardEvent,
  Deposit as DepositEvent,
  DepositFeeChanged as DepositFeeChangedEvent,
  Withdraw as WithdrawEvent
} from '../../generated/StableJoeStaking/StableJoeStaking'
import {
 StableJoe, 
 User, 
 StableJoeDayData
} from '../../generated/schema'
import { Pair as PairContract } from '../../generated/StableJoeStaking/Pair'

function getJoePrice(): BigDecimal {
  const pair = PairContract.bind(JOE_USDT_PAIR_ADDRESS)
  const reservesResult = pair.try_getReserves()
  if (reservesResult.reverted) {
    log.info('[getJoePrice] getReserves reverted', [])
    return BIG_DECIMAL_ZERO
  }
  const reserves = reservesResult.value
  if (reserves.value0.toBigDecimal().equals(BigDecimal.fromString("0"))) {
    log.error('[getJoePrice] USDT reserve 0', [])
    return BIG_DECIMAL_ZERO
  }
  return reserves.value1.toBigDecimal().times(BIG_DECIMAL_1E18).div(reserves.value0.toBigDecimal()).div(BIG_DECIMAL_1E6)
}

export function convertAmountToDecimal(
  tokenAmount: BigInt
): BigDecimal {
  return tokenAmount.toBigDecimal().div(exponentToBigDecimal(BigInt.fromString("18")));
}

export function exponentToBigDecimal(decimals: BigInt): BigDecimal {
  let bd = BigDecimal.fromString("1");
  for (
    let i = BigInt.fromI32(0);
    i.lt(decimals as BigInt);
    i = i.plus(BigInt.fromI32(1))
  ) {
    bd = bd.times(BigDecimal.fromString("10"));
  }
  return bd;
}

function createStableJoe(event: ethereum.Event): StableJoe {
  const stableJoe = new StableJoe(event.address.toHex())
  stableJoe.joeStaked = BIG_DECIMAL_ZERO
  stableJoe.joeStakedUSD = BIG_DECIMAL_ZERO
  stableJoe.usdHarvested = BIG_DECIMAL_ZERO
  stableJoe.depositFee = BIG_DECIMAL_ZERO
  stableJoe.depositFeeJOE = BIG_DECIMAL_ZERO
  stableJoe.depositFeeUSD = BIG_DECIMAL_ZERO
  stableJoe.updatedAt = event.block.timestamp
  stableJoe.save()

  return stableJoe as StableJoe
}

function getStableJoe(event: ethereum.Event): StableJoe {
  let stableJoe = StableJoe.load(event.address.toHex())

  if (stableJoe === null) {
    stableJoe = createStableJoe(event)
  }

  return stableJoe as StableJoe
}

export function handleClaimReward(event: ClaimRewardEvent): void {
  const stableJoe = getStableJoe(event)
  let user = User.load(event.params.user.toHex())

  if (!user) return

  user.usdHarvested = user.usdHarvested.plus(convertAmountToDecimal(event.params.amount))
  user.updatedAt = event.block.timestamp
  user.save() 

  stableJoe.usdHarvested = stableJoe.usdHarvested.plus(convertAmountToDecimal(event.params.amount))
  stableJoe.updatedAt = event.block.timestamp
  stableJoe.save()

  // update day data
  const timestamp = event.block.timestamp.toI32()
  const day = timestamp / 86400
  const date = day * 86400
  const id = event.address.toHex().concat('-').concat(BigInt.fromI32(day).toString())
  let stableJoeDayData = StableJoeDayData.load(id);

  if (USDC_ADDRESS === event.params.rewardToken || USDC_E_ADDRESS === event.params.rewardToken) {
    if (stableJoeDayData === null) {
      stableJoeDayData = new StableJoeDayData(id)
      stableJoeDayData.date = date
      stableJoeDayData.usdHarvested = convertAmountToDecimal(event.params.amount)
    } else {
      stableJoeDayData.usdHarvested = stableJoeDayData.usdHarvested.plus(convertAmountToDecimal(event.params.amount))
    }
    stableJoeDayData.save()
  }
}

export function handleDeposit(event: DepositEvent): void {
  const stableJoe = getStableJoe(event)
  let user = User.load(event.params.user.toHex())

  if (user) {
    user.joeStaked = user.joeStaked.plus(convertAmountToDecimal(event.params.amount))
    user.joeStakedUSD = user.joeStakedUSD.plus(convertAmountToDecimal(event.params.amount).times(getJoePrice()))
  } else {
    user = new User(event.params.user.toHex())
    user.stableJoe = event.address.toHex()
    user.joeStaked = convertAmountToDecimal(event.params.amount)
    user.joeStakedUSD = convertAmountToDecimal(event.params.amount).times(getJoePrice())
  }
  user.updatedAt = event.block.timestamp
  user.save() 

  stableJoe.joeStaked = stableJoe.joeStaked.plus(convertAmountToDecimal(event.params.amount))
  stableJoe.joeStakedUSD = stableJoe.joeStakedUSD.plus(convertAmountToDecimal(event.params.amount).times(getJoePrice()))
  stableJoe.updatedAt = event.block.timestamp
  stableJoe.save()

  // update deposit fees 
  if (stableJoe.depositFee) {
    stableJoe.depositFeeJOE = stableJoe.depositFeeJOE.plus(stableJoe.depositFee)
    stableJoe.depositFeeUSD = stableJoe.depositFeeUSD.plus(stableJoe.depositFee).times(getJoePrice())
  }

  // update day data
  const timestamp = event.block.timestamp.toI32()
  const day = timestamp / 86400
  const date = day * 86400
  const id = event.address.toHex().concat('-').concat(BigInt.fromI32(day).toString())

  let stableJoeDayData = StableJoeDayData.load(id);
  if (stableJoeDayData === null) {
    stableJoeDayData = new StableJoeDayData(id)
    stableJoeDayData.date = date
    stableJoeDayData.joeStaked = convertAmountToDecimal(event.params.amount)
    stableJoeDayData.joeStakedUSD = convertAmountToDecimal(event.params.amount).times(getJoePrice())
    if (stableJoe.depositFee) {
      stableJoeDayData.depositFeeJOE = stableJoe.depositFee
      stableJoeDayData.depositFeeUSD = stableJoe.depositFee.times(getJoePrice())
    }
  } else {
    stableJoeDayData.joeStaked = stableJoeDayData.joeStaked.plus(convertAmountToDecimal(event.params.amount))
    stableJoeDayData.joeStakedUSD = stableJoeDayData.joeStakedUSD.plus(convertAmountToDecimal(event.params.amount).times(getJoePrice()))
    if (stableJoe.depositFee) {
      stableJoeDayData.depositFeeJOE = stableJoeDayData.depositFeeJOE.plus(stableJoe.depositFee)
      stableJoeDayData.depositFeeUSD = stableJoeDayData.depositFeeUSD.plus(stableJoe.depositFee).times(getJoePrice())
    }
  }

  stableJoeDayData.save()
}

export function handleDepositFeeChanged(event: DepositFeeChangedEvent): void {
  const stableJoe = getStableJoe(event)

  stableJoe.depositFee = convertAmountToDecimal(event.params.newFee)
  stableJoe.updatedAt = event.block.timestamp
  stableJoe.save()
}

export function handleWithdraw(event: WithdrawEvent): void {
  const stableJoe = getStableJoe(event)
  let user = User.load(event.params.user.toHex())

  if (!user) return

  user.joeStaked = user.joeStaked.minus(convertAmountToDecimal(event.params.amount))
  user.joeStakedUSD = user.joeStakedUSD.minus(convertAmountToDecimal(event.params.amount).times(getJoePrice()))
  user.updatedAt = event.block.timestamp
  user.save()

  const joePrice = getJoePrice()
  stableJoe.joeStaked = stableJoe.joeStaked.minus(convertAmountToDecimal(event.params.amount))
  stableJoe.joeStakedUSD = stableJoe.joeStakedUSD.minus(convertAmountToDecimal(event.params.amount).times(getJoePrice()))
  stableJoe.updatedAt = event.block.timestamp
  stableJoe.save()

  // update day data
  const timestamp = event.block.timestamp.toI32()
  const day = timestamp / 86400
  const date = day * 86400
  const id = event.address.toHex().concat('-').concat(BigInt.fromI32(day).toString())
  let stableJoeDayData = StableJoeDayData.load(id);
  if (stableJoeDayData === null) {
    stableJoeDayData = new StableJoeDayData(id)
    stableJoeDayData.date = date
    stableJoeDayData.joeUnstaked = convertAmountToDecimal(event.params.amount)
    stableJoeDayData.joeUnstakedUSD = convertAmountToDecimal(event.params.amount).times(joePrice)
  } else {
    stableJoeDayData.joeUnstaked = stableJoeDayData.joeUnstaked.plus(convertAmountToDecimal(event.params.amount))
    stableJoeDayData.joeUnstakedUSD = stableJoeDayData.joeUnstakedUSD.plus(convertAmountToDecimal(event.params.amount).times(joePrice))
  } 

  stableJoeDayData.save()
}
