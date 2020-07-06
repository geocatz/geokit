import styled from 'styled-components'

export const Container = styled.div`
  height: auto;
  width: 100%;
  display: flex;
  flex-flow: row wrap;
  justify-content: space-evenly;
`

export const BasemapSliderContainer = styled.div`
  position: absolute;
  bottom: ${props => props.bottom ? `${props.bottom}px` : '14px'};
  left: ${props => props.left ? `${props.left}px` : '14px'};
  width: 75px;
  height: 75px;
  border-radius: 3px;
  box-shadow: ${props => props.noBoxShadow ? 'none' : '0 2px 4px rgba(0,0,0,0.2), 0 -1px 0px rgba(0,0,0,0.02)'};
  transition: .2s;
  z-index: ${props => props.zIndex ? `${props.zIndex}` : '5'};
  cursor: pointer;
  ${props => props.style};
`

export const BasemapOption = styled.div`
  cursor: pointer;
  width: 100%;
  height: 100%;
  box-shadow: 0 2px 4px rgba(0,0,0,0.2), 0 -1px 0px rgba(0,0,0,0.02);
  transition: all 0.3s cubic-bezier(.25,.8,.25,1);
  position: relative;
  border-radius: 5px;
  overflow: hidden;
`

export const BasemapThumbnail = styled.div`
  width: 100%;
  height: 100%;
  background: white;
  background-size: cover;
  background-image: url(${props => props.thumbnail});
  ${props => props.blur ? 'filter: blur(0.5px);' : ''};
`

export const Label = styled.label`
  position: absolute;
  bottom: 0;
  width: 100%;
  text-align: center;
  font-size: 11px;
  font-weight: bold;
  color: white;
  text-shadow:
  -1px -1px 0 #000,
  1px -1px 0 #000,
  -1px 1px 0 #000,
  1px 1px 0 #000;
  font-family: Roboto, Arial, sans-serif;
`
