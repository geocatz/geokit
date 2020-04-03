import styled from 'styled-components'

/** @component */
export const ProgressWrapper = styled.div`
  display: flex;
  height: 200px;
  justify-content: center;
  align-items: center;
`

/** @component */
export const FilterInput = styled.input`
  border: 0;
  border-radius: 0;
  border-bottom: 1px solid #ccc;
`

/** @component */
export const FlexContainer = styled.div`
  display: flex;
  flex-direction: column;
`

/** @component */
export const FilterSummary = styled.div`
  padding: 10px;
`

/** @component */
export const FilterResultCount = styled.h4`
  display: inline-block;
`

export const FilterSelect = styled.select`
  width: 40%;
  height: 25px;
  float: right;
  margin-op: 9px;
`
