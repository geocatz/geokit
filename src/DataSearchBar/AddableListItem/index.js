/* eslint-disable */
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import debounce from 'lodash.debounce'

import {
  SearchResultBackground,
  SearchResultContent,
  CheckboxWrapper,
  InfoIcon,
  I
} from './styled'
import { Checkbox } from 'vmc/layerPanel/LayerPanel/styled.js'
import MultiMapToggle from 'vmc/beta/lists/MultiMapToggle'

/**
 * @example ./example.md
 */
class AddableListItem extends Component {
  constructor (props) {
    super(props)

    this.state = {}
  }

  // these checks are important performance enhancements which would otherwise cause
  // the ui to be extremely sluggish -- if the id of the ckan item is different or the
  // maps the layer is added to have changed, only then update the item; this ensures all
  // other search results aren't unnecessarily updated/rendered for no reason
  shouldComponentUpdate ({ title, layerTypeNames, loading }, nextState) {
    const titlesChanged = this.props.title !== title
    const nextLayersOnMap = Object.keys(layerTypeNames).reduce((acc, val) => acc + layerTypeNames[val].length, 0)
    const currentLayersOnMap = Object.keys(layerTypeNames).reduce((acc, val) => acc + this.props.layerTypeNames[val].length, 0)

    return titlesChanged || (nextLayersOnMap !== currentLayersOnMap) || (loading !== this.props.loading)
  }

  render () {
    const { title, item, identifier, layerTypeNames, visibleMapCount, toggleLayer, showCkanInfoModal } = this.props
    const selected = Object.keys(layerTypeNames).map(idx => layerTypeNames[idx].includes(identifier))

    return (
      <SearchResultBackground onClick={visibleMapCount === 1 ? debounce(() => toggleLayer(item, 0, selected[0]), 500) : () => {}}>
        <SearchResultContent>
          <CheckboxWrapper>
            {visibleMapCount > 1
              ? <MultiMapToggle toggleLayer={(idx) => toggleLayer(item, idx, selected[idx])} icons={false} mapCount={visibleMapCount} width={55} height={35} selected={selected} />
              : <Checkbox readOnly={true} checked={selected[0]} />
            }
          </CheckboxWrapper>
          <div style={{ margin: '10px 0' }}>
            <small>{title}</small>
          </div>
          {this.props.loading
            ? (
              <InfoIcon>
                <I className='zmdi zmdi-spinner zmdi-hc-spin' />
              </InfoIcon>
            ) : (
              <InfoIcon>
                <I onClick={showCkanInfoModal} className='zmdi zmdi-info' />
              </InfoIcon>
            )
          }
        </SearchResultContent>
      </SearchResultBackground>
    )
  }
}

AddableListItem.propTypes = {
  /** The title of the item displayed in the list */
  title: PropTypes.string.isRequired,

  /** The object representing the item displayed in the list */
  item: PropTypes.object.isRequired,

  /** The unique identifier for an item */
  identifier: PropTypes.string.isRequired,

  /** An object with map indices for keys and an array of identifiers for each layer on that map */
  layerTypeNames: PropTypes.exact({
    0: PropTypes.arrayOf(PropTypes.string),
    1: PropTypes.arrayOf(PropTypes.string),
    2: PropTypes.arrayOf(PropTypes.string),
    3: PropTypes.arrayOf(PropTypes.string)
  }).isRequired,

  /** The number of visible maps */
  visibleMapCount: PropTypes.number.isRequired,

  /** Callback function called when an item is selected  */
  toggleLayer: PropTypes.func.isRequired,

  /** Callback function called when the info icon is clicked on an item */
  showCkanInfoModal:PropTypes.func.isRequired
}

export default AddableListItem
