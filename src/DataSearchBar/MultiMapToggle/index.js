import React from 'react'
import PropTypes from 'prop-types'

import { CheckIcon, PlusIcon, SplitScreenPreview, Box0, Box1, Box2, Box3 } from './styled'

class MultiMapToggle extends React.Component {
  render () {
    const { height, width, mapCount, icons = true, selected, toggleLayer } = this.props
    const checkIcon = <CheckIcon className='zmdi zmdi-check' />
    const plusIcon = <PlusIcon className='zmdi zmdi-plus-circle-o' />

    const renderIcon = idx => {
      if (icons) return selected[idx] ? checkIcon : plusIcon
    }

    return (
      <SplitScreenPreview height={height} width={width}>
        <Box0 mapCount={mapCount} checked={selected[0]} onClick={() => toggleLayer(0)}>
          {renderIcon(0)}
        </Box0>
        <Box1 mapCount={mapCount} checked={selected[1]} onClick={() => toggleLayer(1)}>
          {renderIcon(1)}
        </Box1>
        <Box2 mapCount={mapCount} checked={selected[2]} onClick={() => toggleLayer(2)}>
          {renderIcon(2)}
        </Box2>
        <Box3 mapCount={mapCount} checked={selected[3]} onClick={() => toggleLayer(3)}>
          {renderIcon(3)}
        </Box3>
      </SplitScreenPreview>
    )
  }
}

MultiMapToggle.propTypes = {
  /** The height of the container */
  height: PropTypes.number.isRequired,

  /** The width of the container */
  width: PropTypes.number.isRequired,

  /** The number of maps allowed (irregardless of visibility) */
  mapCount: PropTypes.number.isRequired,

  /** The number of maps currently selected/synced */
  selected: PropTypes.array.isRequired,

  /** A callback called when a layer is toggled with the map index passed */
  toggleLayer: PropTypes.func.isRequired,

  /** Optional boolean to indicate if icons are showin in the map previews */
  icons: PropTypes.bool
}

export default MultiMapToggle
