import { LaunchEvent, RocketJoeFactory } from '../../generated/schema'
import { RJLaunchEventCreated } from '../../generated/RocketJoe/RocketJoeFactory'

export function handleRJLaunchEventCreated(event: RJLaunchEventCreated): void {
  const issuer = event.params.issuer
  const token = event.params.token
  const id = issuer.toHex().concat('-').concat(token)

  let launchEvent = new LaunchEvent(id)
  launchEvent.issuer = issuer
  launchEvent.phaseOneStart = event.params.phaseOneStartTime
  launchEvent.phaseTwoStart = event.params.phaseTwoStartTime
  launchEvent.phaseThreeStart = event.params.phaseThreeStartTime
  launchEvent.timestamp = event.block.timestamp.toI32()
  launchEvent.block = event.bloc

  launchEvent.save()
}
