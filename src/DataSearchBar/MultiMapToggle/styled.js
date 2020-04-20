import styled from 'styled-components'

export const PlusIcon = styled.i`
  color: #ffffff;
  font-size: 50px;
`

export const MinusIcon = styled.i`
  color: #8a8a8a;
  font-size: 50px;
`

export const CheckIcon = styled.i`
  color: #ffffff;
  font-size: 50px;
`

export const SplitScreenPreview = styled.div`
  width: ${props => props.width}px;
  height: ${props => props.height}px;
  display: flex;
  flex-direction: row;
  flex-flow: wrap;
`

const Box = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 2%;
  transition: all 0.1s ease-in;
  cursor: pointer;
  background: ${props => props.checked ? '#2196F3' : '#d8d8d8'};

  &:hover {
    transition: all 0.1s ease-out;
    background: #2196F3;
  }
`

export const Box0 = styled(Box)`
  width: ${props => (props.mapCount === 2 || props.mapCount === 4) ? '46%' : `96%`};
  height: ${props => props.mapCount > 2 ? '46%' : `96%`};
`

export const Box1 = styled(Box)`
  display: ${props => props.mapCount === 1 ? 'none' : 'flex'};
  width: 46%;
  height: ${props => props.mapCount === 2 ? '96%' : '46%'};
`

export const Box2 = styled(Box)`
  display: ${props => props.mapCount > 2 ? 'flex' : 'none'};
  width: 46%;
  height: 46%;
`

export const Box3 = styled(Box)`
  display: ${props => props.mapCount > 3 ? 'flex' : 'none'};
  width: 46%;
  height: 46%;
`
