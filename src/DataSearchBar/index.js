import React from 'react'
import PropTypes from 'prop-types'

// import CkanMetadataModal from 'components/modals/CkanMetadataModal'
import AddableList from './AddableList'

class DataSearchBar extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      items: props.persistedState?.items || props.items || [],
      showCkanInfoModal: false,
      frontdoorLink: '',
      ckanItem: {},
      loadingTypeNames: []
    }

    const t = props.translations

    this.sortFuncs = [
      { label: t['olkit.CatalogSearch.mostPopular'], value: 'globalPopularity', func: this.globalPopularitySort },
      { label: t['olkit.CatalogSearch.favorites'], value: 'userPopularity', func: this.userPopularitySort },
      { label: t['olkit.CatalogSearch.alphabetical'], value: 'alphabetical', func: this.lexicographicSort },
      { label: t['olkit.CatalogSearch.createDate'], value: 'createdDate', func: this.createdDateSort },
      { label: t['olkit.CatalogSearch.updateDate'], value: 'updatedDate', func: this.updatedDateSort }
    ]
  }

  componentDidMount () {
    const { items, persistState } = this.props

    if (!items.length) {
      fetcher('layers')
        .then(items => {
          this.setState({ items })
          persistState({ items }, 'CatalogLayers')
        })
    }
  }

  //   UNSAFE_componentWillReceiveProps (nextProps) { // eslint-disable-line camelcase
  //     const { items } = this.props
  // console.log('ITEMS', items?.length, nextProps?.items?.length);

  //     if (items?.length !== nextProps?.items?.length) {
  //       this.setState({ items: nextProps.items })
  //     } else if (items.length !== nextProps?.persistedState?.items?.length) {
  //       this.setState({ items: nextProps.persistState.items })
  //     }
  //   }

  getTitleForItem (item) {
    return item.title
  }

  getIdentiferForItem (item) {
    const parts = item.resources[0].url.split('/')
    const length = parts.length

    const id = `${parts[length - 3]}:${parts[length - 2]}`

    if (id === '{z}:{x}') return parts[parts.length - 4]

    return id
  }

  globalPopularitySort (a, b) {
    return b.globalPopularity - a.globalPopularity
  }

  userPopularitySort (a, b) {
    return b.userPopularity - a.userPopularity
  }

  lexicographicSort (a, b) {
    return a.title.localeCompare(b.title)
  }

  createdDateSort (a, b) {
    return new Date(b.metadata_created) - new Date(a.metadata_created)
  }

  updatedDateSort (a, b) {
    return new Date(b.metadata_modified) - new Date(a.metadata_modified)
  }

  toggleLayer = (item, idx, added) => {
    const { maps } = this.props
    const mapToUse = maps[idx]
    const opts = {
      getHeaders: (h) => ({ ...h, Authorization: getAuthHeader().Authorization })
    }

    // get the URI from the item (which is a CKAN search result)
    const uri = item.resources[0].url.split('?')[0]
    const identifier = this.getIdentiferForItem(item)

    // if the layer is already on the map, remove it
    if (added) {
      const findTypeNameMatch = (l) => {
        return l.isGeoserverLayer ? l.getTypeName() === identifier : undefined
      }
      const layer = mapToUse.getLayers().getArray().find(findTypeNameMatch)

      if (layer) mapToUse.removeLayer(layer)
      this.props.forceUpdate()
    // layer is not on the map so we add it
    } else {
      this.setState({ loadingTypeNames: [...this.state.loadingTypeNames, identifier] })
      GeoserverLayer.fromURI(uri, opts).then(layer => {
        const removedLoadedLayer = this.state.loadingTypeNames.filter(typename => typename !== identifier)

        mapToUse.addLayer(layer)
        this.setState({ loadingTypeNames: removedLoadedLayer })
        this.props.forceUpdate()
      }).catch(err => console.log(err)) // eslint-disable-line
    }
  }

  showCkanInfoModal = (ckanItem) => {
    if (ckanItem) {
      const routesEnv = env()
      const frontdoorLink = routesEnv.ckanBase + ckanItem.id

      this.setState({ showCkanInfoModal: !this.state.showCkanInfoModal, frontdoorLink, ckanItem })
    } else {
      this.setState({ showCkanInfoModal: !this.state.showCkanInfoModal })
    }
  }

  getTypeNames = (maps) => {
    const getTypeName = l => l.isGeoserverLayer ? l.getTypeName() : undefined
    const typeNameArr = maps.map(m => m.getLayers().getArray().map(getTypeName).filter(e => e))
    const typeNameMap = typeNameArr.reduce((acc, val, idx) => {
      acc[idx] = val

      return acc
    }, {})

    return typeNameMap
  }

  getVisibleMapCount = (maps) => {
    const returnFirstMap = (index) => index === 0
    const visibleMaps = maps.map((m, i) => {
      return m.getVisibleState instanceof Function ? m.getVisibleState() : returnFirstMap(i)
    })

    return visibleMaps.filter(e => e).length
  }

  render () {
    const { items, showCkanInfoModal, frontdoorLink, ckanItem, loadingTypeNames } = this.state
    const { translations, maps, preferences } = this.props

    return (
      <div data-testid='CatalogLayers'>
        <AddableList
          translations={translations}
          sortFuncs={this.sortFuncs}
          toggleLayer={this.toggleLayer}
          visibleMapCount={this.getVisibleMapCount(maps)}
          layerTypeNames={this.getTypeNames(maps)}
          items={items}
          loadingTypeNames={loadingTypeNames}
          getIdentiferForItem={this.getIdentiferForItem}
          getTitleForItem={this.getTitleForItem}
          showCkanInfoModal={this.showCkanInfoModal}
          preferences={preferences} />
        {
          // <CkanMetadataModal
          //   show={showCkanInfoModal}
          //   showCkanInfoModal={this.showCkanInfoModal}
          //   frontdoorLink={frontdoorLink}
          //   ckanItem={ckanItem} />
          }
      </div>
    )
  }
}

CatalogLayers.defaultProps = {
  items: [],
  translations: {
    'olkit.CatalogSearch.mostPopular': 'Most Popular',
    'olkit.CatalogSearch.favorites': 'Your Favorites',
    'olkit.CatalogSearch.alphabetical': 'Alphabetical',
    'olkit.CatalogSearch.createDate': 'Created Date',
    'olkit.CatalogSearch.updateDate': 'Updated Date'
  },
  persistState: () => {},
  forceUpdate: () => {}
}

CatalogLayers.propTypes = {
  /** Object with key/value pairs for translated strings */
  translations: PropTypes.object,

  forceUpdate: PropTypes.func,
  visibleMapCount: PropTypes.number,
  layerTypeNames: PropTypes.object,

  /** Automatically passed by <Provider> to prevent loading data already cached */
  persistedState: PropTypes.object,

  /** Automatically passed by <Provider> to allow component to persist data */
  persistState: PropTypes.func,

  /** An optional array of objects used to derive list item state */
  items: PropTypes.array,

  /** Openlayers map object */
  maps: PropTypes.array.isRequired,
  preferences: PropTypes.object
}

export default CatalogLayers
