import React from 'react'
import PropTypes from 'prop-types'
import { connectToContext } from 'Provider'
import { FormControlWrapper, SwitchContainer, Switch, SwitchLabel } from './styled'

class ContinuousDraw extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      continuousDrawEnabled: props.continuousDrawEnabled || false
    }
  }

  updateContinuousDrawEnable = () => {
    const newContinuousDraw = !this.state.continuousDrawEnabled

    this.setState({ continuousDrawEnabled: newContinuousDraw }, () => {
      this.props.updateContinuousDrawEnable(newContinuousDraw)
    })
      
  }

  render () {
    const { translations, compact, continuousDrawEnabled } = this.props

    return (
      <div id='continuous_draw'>
        {!compact && <h5><b>{translations['settings.continuousDraw.toggleLabel']}</b></h5>}
        {!compact && <p>{translations['settings.continuousDraw.description']}</p>}
        <FormControlWrapper>
          <SwitchContainer compact={compact ? true : undefined} id='_CONTINUOUS_DRAW_ENABLED'>
            <SwitchLabel compact={compact ? true : undefined} htmlFor='_CONTINUOUS_DRAW_ENABLED'>{compact ? translations['settings.continuousDraw.toggleLabel'] : translations['settings.turnOnOff']}</SwitchLabel>
            <Switch color='primary'
              checked={continuousDrawEnabled}
              onChange={this.updateContinuousDrawEnable}
              value={continuousDrawEnabled}/>
          </SwitchContainer>
        </FormControlWrapper>
      </div>
    )
  }
}

ContinuousDraw.propTypes = {
  snappingEnabled: PropTypes.bool,
  snappingTolerance: PropTypes.number,
  translations: PropTypes.object,
  persistSnappingEnable: PropTypes.func,
  persistSnappingTolerance: PropTypes.func,
  preferences: PropTypes.object,
  onChange: PropTypes.func,
  compact: PropTypes.bool
}

export default connectToContext(ContinuousDraw)
