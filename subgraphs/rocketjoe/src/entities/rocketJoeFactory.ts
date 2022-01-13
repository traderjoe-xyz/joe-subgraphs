import { Address } from '@graphprotocol/graph-ts'
import { BIG_DECIMAL_ZERO, BIG_INT_ZERO, ROCKET_JOE_FACTORY_ADDRESS } from 'const'
import { RocketJoeFactory } from '../../generated/schema'

export function getRocketJoeFactory(id: Address = ROCKET_JOE_FACTORY_ADDRESS): RocketJoeFactory {
  let factory = RocketJoeFactory.load(id.toHex())

  if (factory === null) {
    factory = new RocketJoeFactory(id.toHex())
    factory.save()
  }

  return factory as RocketJoeFactory
}