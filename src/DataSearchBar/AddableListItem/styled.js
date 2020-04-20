import styled from 'styled-components'
import { withStyles } from '@material-ui/core/styles'
import MaterialCheckbox from '@material-ui/core/Checkbox'

export const Checkbox = withStyles(() => ({
  checked: {
    '&$checked': {
      color: '#152357',
      padding: '9px',
      '&:hover': {
        backgroundColor: 'rgba(1, 8, 90, 0.08)'
      }
    }
  },
  indeterminate: {
    '&$indeterminate': {
      color: '#152357',
      padding: '9px',
      '&:hover': {
        backgroundColor: 'rgba(1, 8, 90, 0.08)'
      }
    }
  }
}))(MaterialCheckbox)

/** @component */
export const SearchResultBackground = styled.div`
  position: relative;
  cursor: pointer;

  &:hover {
    background: #f0f0f0;
  }
`

/** @component */
export const SearchResultContent = styled.div`
  display: flex;
  border-bottom: 1px solid #eaeaea;
  padding: 0 15px 0 0;
`

/** @component */
export const CheckboxWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0 10px;
}
`

/** @component */
export const InfoIcon = styled.div`
  align-self: center;
  margin-left: auto;
`

/** @component */
export const I = styled.i`
  align-self: center;
  margin-left: auto;
`
