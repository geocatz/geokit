import ugh from 'ugh'

// check for env
// const BASE_URL = `https://catalog.data.gov/api/3/action/resource_search?q=`
const BASE_URL = `https://catalog.data.gov/api/3/action/package_list`

/**
 * Make network requests to vmf api
 * @function\
 * @param {String} 'buildReportsTemplates' | 'geoprintTemplates' | 'keys' | 'layerMetadata' | 'layers' | 'projects' | 'services'
 * @param {Object} opts object
 * @param {Object} opts.query query params by key/value pair (ex. { query: { id: 'xyz' } })
 * @returns {Promise} resolves to the requested resource from vmf api
 */
export function fetcher (query = '', opts = {}) {
  const config = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  }
  const url = `${BASE_URL}${query}`

  return fetch(url, config)
    .then(res => {
      if (!res.ok) {
        console.warn(res)
        throw new Error(res.message)
      }

      return res.json()
    })
    .catch(ugh.error)
}
