import styled from 'styled-components'
import { withStyles } from '@material-ui/core/styles'
import MaterialIconButton from '@material-ui/core/IconButton'
import MaterialContainer from '@material-ui/core/Container'
import MaterialTooltip from '@material-ui/core/Tooltip'
import { TextField as MaterialTextField, Switch as MaterialSwitch, Select as MaterialSelect } from '@material-ui/core'

export const Container = styled.div`
  padding: 15px;
  width: min-content;
  background-color: white;
  left: 0px;
  top: 0px;
  position: absolute;
  border-radius: 5px;
`

export const ButtonContainer = withStyles({
  root: {
    display: 'flex',
    flexWrap: 'nowrap',
    justifyContent: 'space-evenly',
    margin: '10px'
  }
})(MaterialContainer)

export const IconButton = withStyles({
  root: {
    width: '37px',
    height: '37px'
  }
})(MaterialIconButton)

export const Tooltip = withStyles({
  tooltip: {
    fontSize: '15px'
  }
})(MaterialTooltip)

export const ProgressWrapper = styled.div`
  display: flex;
  height: 100px;
  justify-content: center;
  align-items: center;
`

export const FormControlWrapper = styled.div`
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
`
export const SwitchContainer = styled.div`
  display: flex;
  flex-direction: ${props => props.compact ? 'row' : 'column'};
  order: 0;
`

export const SwitchLabel = styled.label`
  order: ${props => props.compact ? 99 : 0};
`

export const TextField = withStyles(() => ({
  root: {
    '& label.Mui-focused': {
      color: '#152457'
    },
    '& .MuiInput-underline:after': {
      borderBottomColor: '#152457'
    },
    '& .MuiOutlinedInput-root': {
      '&.Mui-focused fieldset': {
        borderColor: '#152457'
      }
    },
    'order': '99',
    'flex-shrink': 20,
    'bottom': props => props.compact ? '-12px' : '0px'
  }
}))(MaterialTextField)

export const Switch = withStyles(() => ({
  switchBase: {
    color: '#cecece',
    '&$checked': {
      color: '#152457'
    },
    '&$checked + $track': {
      backgroundColor: '#152457'
    }
  },
  checked: {
    '&:hover': {
      backgroundColor: 'rgba(1, 8, 90, 0.08)'
    }
  },
  track: {}
}))(MaterialSwitch)

export const Select = withStyles(() => ({
  root: {
    'order': '99',
    'flex-grow': '1',
    'bottom': props => props.compact ? '-12px' : '0px'
  }
}))(MaterialSelect)

export const ChildContainer = styled.div`
  flex-grow: 2;
`

export const ContinuousContainer = withStyles({
  root: {
    padding: '15px 0px'
  }
})(MaterialContainer)

