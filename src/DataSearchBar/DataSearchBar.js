import React from 'react'
import PropTypes from 'prop-types'

// import CkanMetadataModal from 'components/modals/CkanMetadataModal'
import AddableList from './AddableList'
import { fetcher } from './utils'

import JSZip from 'jszip'

import olLayerTile from 'ol/layer/tile'
import VectorLayer from 'classes/VectorLayer'
import olFormatKML from 'ol/format/kml'
import olSourceVector from 'ol/source/vector'
import olSourceTileArcGISRest from 'ol/source/tilearcgisrest'

const FORMATS = ['Esri REST', 'KML', 'CSV']

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

  parseEsriRestDirs = async (rootUri) => {
    const parseFolders = folder => {
      const dirUri = `${rootUri}/${folder}`
      console.log(dirUri) // eslint-disable-line no-console

      return this.parseEsriRestDirs(dirUri)
    }
    const parseServices = service => {
      if (service.type === 'MapServer') {
        return {
          ...service,
          url: `${rootUri}/${service.name}/${service.type}`
        }
      }
    }
    const res = await fetch(`${rootUri}?f=pjson`).catch(err => console.warn(err))
    const dir = res.ok && await res.json().catch(err => console.warn(err))
    const rootServices = dir.services.map(parseServices)
    const deepServices = dir.folders.map(parseFolders)

    console.log({rootServices, deepServices}) // eslint-disable-line no-console

    const services = [...rootServices, ...deepServices]

    console.log({services}) // eslint-disable-line no-console

    return services
  }

  expandServices = async (accumulator, resource, idx, ogArray) => {
    console.log(idx, ogArray) // eslint-disable-line no-console
    if (resource.format === 'Esri REST') {
      const servicesRoot = `${resource.url.split('/services')[0]}/services`
      console.log(servicesRoot) // eslint-disable-line no-console
      const services = await this.parseEsriRestDirs(servicesRoot).catch(err => console.warn(err))
      console.log('Esri REST', [...accumulator, ...services]) // eslint-disable-line no-console

      return [...accumulator, ...services]
    } else {
      console.log('non-rest', [...accumulator, resource]) // eslint-disable-line no-console
      return [...accumulator, resource]
    }
  }

  componentDidMount () {
    const { items, persistState } = this.props

    if (!items.length) {
      fetcher()
        .then(res => {
          console.log(res) // eslint-disable-line no-console
          const items = res.result.results.map(({ resources }) => resources).flat(Infinity).filter(({ format }) => FORMATS.includes(format)).reduce(this.expandServices, [])
          console.log('items', items) // eslint-disable-line no-console
          Promise.allSettled(items).then(res => {
            const verifiedItems = res.filter(({ status }) => status ==='fulfilled').map(r => r.value)
            console.log('verifiedItems', verifiedItems) // eslint-disable-line no-console
            this.setState({ items: verifiedItems })
            persistState({ items: verifiedItems }, 'CatalogLayers')
          })
          // this.setState({ items })
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
    return item.title || item.name
  }

  getIdentiferForItem (item) {
    try {
      const parts = item.resources[0].url.split('/')
      const length = parts.length
  
      const id = `${parts[length - 3]}:${parts[length - 2]}`
  
      if (id === '{z}:{x}') return parts[parts.length - 4]
  
      return id
    } catch (e) {
      return item.id
    }
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

  toggleLayer = async (item, idx, added) => {
    const { maps } = this.props
    const mapToUse = maps[idx]
    // const opts = {
    //   getHeaders: (h) => ({ ...h, Authorization: getAuthHeader().Authorization })
    // }
    const opts = {}

    // get the URI from the item (which is a CKAN search result)
    // const uri = item.resources[0].url.split('?')[0]
    const uri = item.url

    console.log(uri) // eslint-disable-line no-console
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
      const layer = await this.createLayerFromItem(item)
      console.log(layer) // eslint-disable-line no-console
      mapToUse.addLayer(layer)
      // GeoserverLayer.fromURI(uri, opts).then(layer => {
      //   const removedLoadedLayer = this.state.loadingTypeNames.filter(typename => typename !== identifier)

      //   mapToUse.addLayer(layer)
      //   this.setState({ loadingTypeNames: removedLoadedLayer })
      //   this.props.forceUpdate()
      // }).catch(err => console.log(err)) // eslint-disable-line
    }
  }

  processKMZ = (file) => {
    return JSZip.loadAsync(file).then(zip => {
      const match = zip.filter((relativePath, file) => {
        return relativePath.endsWith('.kml')
      })[0]

      return match.async('string')
    }).then(results => ({ format: new olFormatKML(), results }))
  }


  createLayerFromItem = async (item) => {
    console.log(item) // eslint-disable-line no-console
    switch (item.format) {
      case 'Esri REST':
        return new olLayerTile({
          title: item?.name,
          source: new olSourceTileArcGISRest({
            url: item.url
          }),
          ...item
        })
      case 'KML': {
        const uriBreakdown = item.url.split('.')
        const fileExtension = uriBreakdown.pop()
        let source = new olSourceVector({
          url: item.url,
          format: new olFormatKML()
        })

        if (fileExtension === 'kmz') {
          const res = await fetch(item.url)
          console.log(res) // eslint-disable-line no-console
          const kmz = res.ok && await res.blob()
          console.log(kmz) // eslint-disable-line no-console
          const processedKmz = await this.processKMZ(kmz)
          console.log(processedKmz) // eslint-disable-line no-console
          const { format, results } = processedKmz
          const features = format.readFeatures(results, {
            dataProjection: 'EPSG:4326',
            featureProjection: 'EPSG:3857'
          })
          console.log(features) // eslint-disable-line no-console

          source = new olSourceVector({
            features
          })
        }

        return new VectorLayer({
          title: item?.name,
          source,
          ...item
        })
      }
      default:
        console.warn('Unsupported format: ', format)
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
    const { items = [], showCkanInfoModal, frontdoorLink, ckanItem, loadingTypeNames } = this.state
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

DataSearchBar.defaultProps = {
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

DataSearchBar.propTypes = {
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

export default DataSearchBar
