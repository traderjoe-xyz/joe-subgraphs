import { Address, BigDecimal, BigInt, log } from "@graphprotocol/graph-ts";
import {
  ADDRESS_ZERO,
  BIG_DECIMAL_1E18,
  BIG_DECIMAL_1E6,
  BIG_DECIMAL_ZERO,
  BIG_INT_ZERO,
  JOE_BAR_ADDRESS,
  JOE_TOKEN_ADDRESS,
  JOE_USDT_PAIR_ADDRESS,
} from 'const'
import {
  ClaimReward as ClaimRewardEvent,
  Deposit as DepositEvent,
  DepositFeeChanged as DepositFeeChangedEvent,
  Withdraw as WithdrawEvent
} from "../generated/StableJoeStaking/StableJoeStaking"
import {
 StableJoe, 
 User, 
 StableJoeDayData
} from "../generated/schema"
import { Pair as PairContract } from '../generated/StableJoeStaking/Pair'

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

export function handleClaimReward(event: ClaimRewardEvent): void {
  const stableJoe = StableJoe.load(event.address.toHex())
  let user = User.load(event.params.user.toHex())

  if (user) {
    user.joeHarvested = user.joeHarvested.plus(convertAmountToDecimal(event.params.amount))
    user.joeHarvestedUSD = user.joeHarvestedUSD.plus(convertAmountToDecimal(event.params.amount).times(getJoePrice()))
  }
  user.updatedAt = event.block.timestamp
  
  const joePrice = getJoePrice()
  stableJoe.joeHarvested= stableJoe.joeHarvested.plus(convertAmountToDecimal(event.params.amount))
  stableJoe.joeHarvestedUSD = stableJoe.joeHarvestedUSD.plus(convertAmountToDecimal(event.params.amount).times(joePrice))
  stableJoe.updatedAt = event.block.timestamp

  stableJoe.save()
}

export function handleDeposit(event: DepositEvent): void {
  const stableJoe = StableJoe.load(event.address.toHex())
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
  
  const joePrice = getJoePrice()
  stableJoe.joeStaked = stableJoe.joeStaked.plus(convertAmountToDecimal(event.params.amount))
  stableJoe.joeStakedUSD = stableJoe.joeStakedUSD.plus(convertAmountToDecimal(event.params.amount).times(joePrice))
  stableJoe.updatedAt = event.block.timestamp

  stableJoe.save()
}

export function handleDepositFeeChanged(event: DepositFeeChangedEvent): void {
  const stableJoe = StableJoe.load(event.address.toHex())

  stableJoe.depositFee = convertAmountToDecimal(event.params.newFee)
  stableJoe.updatedAt = event.block.timestamp
  stableJoe.save()
}

export function handleWithdraw(event: WithdrawEvent): void {
  const stableJoe = StableJoe.load(event.address.toHex())

  let user = User.load(event.params.user.toHex())
  if (user) {
    user.joeStaked = user.joeStaked.minus(convertAmountToDecimal(event.params.amount))
    user.joeStakedUSD = user.joeStakedUSD.minus(convertAmountToDecimal(event.params.amount).times(getJoePrice()))
    user.updatedAt = event.block.timestamp
  }

  const joePrice = getJoePrice()
  stableJoe.joeStaked = stableJoe.joeStaked.minus(convertAmountToDecimal(event.params.amount))
  stableJoe.joeStakedUSD = stableJoe.joeStakedUSD.minus(convertAmountToDecimal(event.params.amount).times(joePrice))
  stableJoe.updatedAt = event.block.timestamp

  stableJoe.save()
}
