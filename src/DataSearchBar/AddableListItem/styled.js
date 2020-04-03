import styled from 'styled-components'

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
