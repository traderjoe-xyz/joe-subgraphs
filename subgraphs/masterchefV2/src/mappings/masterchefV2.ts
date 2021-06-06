import {
  Deposit,
  Withdraw,
  EmergencyWithdraw,
  Harvest,
  Add,
  Set,
  UpdatePool,
} from '../../generated/MasterChefV2/MasterChefV2'

import { Address, BigDecimal, BigInt, dataSource, ethereum, log } from '@graphprotocol/graph-ts'
import {
  BIG_DECIMAL_1E12,
  BIG_DECIMAL_1E18,
  BIG_DECIMAL_ZERO,
  BIG_INT_ONE,
  BIG_INT_ONE_DAY_SECONDS,
  BIG_INT_ZERO,
  MASTER_CHEF_V2_ADDRESS,
  ACC_JOE_PRECISION,
} from 'const'
import { MasterChef, Pool, User } from '../../generated/schema'

import { getMasterChef, getPool, getUser } from '../entities'

import { ERC20 as ERC20Contract } from '../../generated/MasterChefV2/ERC20'

export function add(event: Add): void {
  log.info('[MasterChefV2] Add Pool {} {} {} {}', [
    event.params.pid.toString(),
    event.params.allocPoint.toString(),
    event.params.lpToken.toHex(),
    event.params.rewarder.toHex(),
  ])

  const masterChef = getMasterChef(event.block)
  const pool = getPool(event.params.pid, event.block)

  pool.pair = event.params.lpToken
  pool.rewarder = event.params.rewarder
  pool.allocPoint = event.params.allocPoint
  pool.save()

  masterChef.totalAllocPoint = masterChef.totalAllocPoint.plus(pool.allocPoint)
  masterChef.poolCount = masterChef.poolCount.plus(BIG_INT_ONE)
  masterChef.save()
}

export function set(event: Set): void {
  log.info('[MasterChefV2] Set Pool {} {} {} {}', [
    event.params.pid.toString(),
    event.params.allocPoint.toString(),
    event.params.rewarder.toHex(),
    event.params.overwrite == true ? 'true' : 'false',
  ])

  const masterChef = getMasterChef(event.block)
  const pool = getPool(event.params.pid, event.block)

  if (event.params.overwrite == true) {
    pool.rewarder = event.params.rewarder
  }
  pool.allocPoint = event.params.allocPoint
  pool.save()

  masterChef.totalAllocPoint = masterChef.totalAllocPoint.plus(event.params.allocPoint.minus(pool.allocPoint))
  masterChef.save()
}

export function updatePool(event: UpdatePool): void {
  log.info('[MasterChefV2] Update Pool {} {} {} {}', [
    event.params.pid.toString(),
    event.params.lastRewardTimestamp.toString(),
    event.params.lpSupply.toString(),
    event.params.accJoePerShare.toString(),
  ])

  const pool = getPool(event.params.pid, event.block)

  pool.accJoePerShare = event.params.accJoePerShare
  pool.lastRewardTimestamp = event.params.lastRewardTimestamp
  pool.save()
}

export function deposit(event: Deposit): void {
  log.info('[MasterChefV2] Deposit {} {} {}', [
    event.params.user.toHex(),
    event.params.pid.toString(),
    event.params.amount.toString(),
  ])

  const pool = getPool(event.params.pid, event.block)
  const user = getUser(event.params.user, event.params.pid, event.block)

  pool.jlpBalance = pool.jlpBalance.plus(event.params.amount)
  pool.save()

  user.amount = user.amount.plus(event.params.amount)
  user.rewardDebt = user.rewardDebt.plus(event.params.amount.times(pool.accJoePerShare).div(ACC_JOE_PRECISION))
  user.save()
}

export function withdraw(event: Withdraw): void {
  log.info('[MasterChefV2] Withdraw {} {} {}', [
    event.params.user.toHex(),
    event.params.pid.toString(),
    event.params.amount.toString(),
  ])

  const pool = getPool(event.params.pid, event.block)
  const user = getUser(event.params.user, event.params.pid, event.block)

  pool.jlpBalance = pool.jlpBalance.minus(event.params.amount)
  pool.save()

  user.amount = user.amount.minus(event.params.amount)
  user.rewardDebt = user.rewardDebt.minus(event.params.amount.times(pool.accJoePerShare).div(ACC_JOE_PRECISION))
  user.save()
}

export function emergencyWithdraw(event: EmergencyWithdraw): void {
  log.info('[MasterChefV2] Emergency Withdraw {} {} {}', [
    event.params.user.toHex(),
    event.params.pid.toString(),
    event.params.amount.toString(),
  ])

  const user = getUser(event.params.user, event.params.pid, event.block)

  user.amount = BIG_INT_ZERO
  user.rewardDebt = BIG_INT_ZERO
  user.save()
}

export function harvest(event: Harvest): void {
  log.info('[MasterChefV2] Harvest {} {} {}', [
    event.params.user.toHex(),
    event.params.pid.toString(),
    event.params.amount.toString(),
  ])

  const pool = getPool(event.params.pid, event.block)
  const user = getUser(event.params.user, event.params.pid, event.block)

  const accumulatedJoe = user.amount.times(pool.accJoePerShare).div(ACC_JOE_PRECISION)

  user.rewardDebt = accumulatedJoe
  user.joeHarvested = user.joeHarvested.plus(event.params.amount)
  user.save()
}
