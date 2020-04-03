import React from 'react'
import PropTypes from 'prop-types'
import TextField from '@material-ui/core/Input'
import debounce from 'lodash.debounce'
import CircularProgress from '@material-ui/core/CircularProgress'

import {
  ProgressWrapper,
  FlexContainer,
  FilterSummary,
  FilterSelect,
  FilterResultCount
} from './styled'

import AddableListItem from '../AddableListItem'

/**
 * @example ./example.md
 */
class AddableList extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      query: '',
      items: props.items || [],
      filteredItems: props.items || [],
      sortType: 'globalPopularity'
    }

    this.updateFilteredItems = debounce(this.updateFilteredItems, 250)
  }

  componentDidMount () {
    const { preferences } = this.props
    const sortType = preferences?.get('_CATALOG_SORT') || this.state.sortType

    this.setState({ sortType })
    this.changeSort(sortType)
  }

  changeSort = (sortType) => {
    const { items, sortFuncs, preferences } = this.props
    const { filteredItems } = this.state
    const sortFunc = sortFuncs.find(f => f.value === sortType).func

    if (preferences) preferences.put('_CATALOG_SORT', sortType)
    this.setState({
      sortType,
      // this will sort either the already filtered items (or the base items)
      filteredItems: (filteredItems || items).sort(sortFunc)
    })
  }

  // eslint-disable-next-line
  UNSAFE_componentWillReceiveProps (nextProps) {
    const { items, sortFuncs } = this.props
    const { sortType } = this.state

    if (!items.length && nextProps.items) {
      const sortFunc = sortFuncs.find(f => f.value === sortType).func

      this.setState({
        items: nextProps.items,
        filteredItems: nextProps.items.sort(sortFunc).filter(item =>
          item.title.toLowerCase().includes(this.state.query.toLowerCase()))
      })
    }
  }

  updateFilteredItems = (value) => {
    const { items } = this.state
    const filtered = items.filter(item =>
      item.title.toLowerCase().includes(value.toLowerCase()) ||
      item.tags.map(i => i.name).includes(value.toLowerCase())
    )

    this.setState({
      filteredItems: filtered
    })
  }

  handleChange = ({ target }) => {
    this.setState({
      query: target.value
    })

    this.updateFilteredItems(target.value)
  }

  render () {
    const {
      translations,
      layerTypeNames,
      visibleMapCount,
      getIdentiferForItem,
      getTitleForItem,
      toggleLayer,
      sortFuncs,
      loadingTypeNames
    } = this.props
    const { query, filteredItems } = this.state

    return (
      <FlexContainer>
        <TextField
          value={query}
          onChange={this.handleChange}
          style={{ margin: '10px' }}
          name={'translations[\'olKit.AddableList.filterLayerInput\']'}
          inputProps={{ 'data-testid': 'CatalogSearch.inputSearch' }}
          placeholder={translations['olKit.AddableList.filterLayerInput']}
          margin='dense' />
        <FilterSummary>
          <FilterResultCount>
            <strong className='text-default'>{filteredItems.length}</strong> {translations['olKit.AddableList.results']}
          </FilterResultCount>
          <FilterSelect readOnly value={this.state.sortType || 'sortBy'} className='form-control' onChange={(e) => this.changeSort(e.target.value)}>
            <option disabled value='sortBy'>{translations['olKit.AddableList.sortBy']}</option>
            {sortFuncs.map((f, i) => {
              return <option key={i} value={f.value}>{f.label}</option>
            })}
          </FilterSelect>
        </FilterSummary>
        <div>
          {filteredItems.length ? filteredItems.map((item, i) => (
            <AddableListItem
              key={i}
              item={item}
              layerTypeNames={layerTypeNames}
              loading={loadingTypeNames.includes(getIdentiferForItem(item))}
              toggleLayer={toggleLayer}
              visibleMapCount={visibleMapCount}
              identifier={getIdentiferForItem(item)}
              title={getTitleForItem(item)}
              showCkanInfoModal={this.props.showCkanInfoModal.bind(this, item)} />
          )) : (
            <ProgressWrapper>
              <CircularProgress />
            </ProgressWrapper>
          )}
        </div>
      </FlexContainer>
    )
  }
}

AddableList.defaultProps = {
  translations: {
    'olKit.AddableList.results': 'results',
    'olKit.AddableList.sortBy': 'Sort By',
    'olKit.AddableList.filterLayerInput': 'Filter Layers'
  },
  items: []
}

AddableList.propTypes = {
  /** Object with key/value pairs for translated strings */
  translations: PropTypes.object,

  /** Array of sort functions with a label shown to the user, option value & the sort function */
  sortFuncs: PropTypes.arrayOf(PropTypes.exact({
    label: PropTypes.string,
    value: PropTypes.string,
    func: PropTypes.func
  })).isRequired,

  /** An object with map indices for keys and an array of identifiers for each layer on that map */
  layerTypeNames: PropTypes.exact({
    0: PropTypes.arrayOf(PropTypes.string),
    1: PropTypes.arrayOf(PropTypes.string),
    2: PropTypes.arrayOf(PropTypes.string),
    3: PropTypes.arrayOf(PropTypes.string)
  }).isRequired,

  /** The number of currently visible maps */
  visibleMapCount: PropTypes.number.isRequired,

  /** An array of items to render and which will be passed in callback functions documented above */
  items: PropTypes.array.isRequired,

  /** Callback function called when an item is selected (passed the item selected) */
  toggleLayer: PropTypes.func.isRequired,

  /** A function which returns the same unique identifiers used in `layerTypeNames` */
  getIdentiferForItem: PropTypes.func.isRequired,

  /** The callback which returns a title string for each item passed via `items` */
  getTitleForItem: PropTypes.func.isRequired,

  /** Callback function to invoke an info modal when the list item info icon is clicked */
  showCkanInfoModal: PropTypes.func.isRequired,

  /** Velocity Preferences object */
  preferences: PropTypes.object,

  /** The layers that are being added but still loading */
  loadingTypeNames: PropTypes.array
}

export default AddableList
