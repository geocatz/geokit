import React, { useEffect } from 'react'
import PropTypes from 'prop-types'
import { connectToMap } from 'Map'
import GeoTiff, { fromBlob, fromArrayBuffer } from 'geotiff'
import olExtent from 'ol/extent'
import olProj from 'ol/proj'
import proj4 from 'proj4'

import ImageCanvas from 'ol/source/imagecanvas'
import ImageStatic from 'ol/source/imagestatic'
import ImageLayer from 'ol/layer/image'
import TileWMS from 'ol/source/tilewms'
import TileImage from 'ol/source/tileimage'
import TileLayer from 'ol/layer/tile'
import TileDebug from 'ol/source/tiledebug'
import olSourceXYZ from 'ol/source/xyz'

const getProj = (code) => {
  if (!!olProj.get(code)) return code

  olProj.setProj4(proj4)
  const epsgioRoot = 'https://epsg.io/'
  const epsgSearchUri = `${epsgioRoot}?format=json&q=${code}`

  return new Promise((resolve, reject) => {
    fetch(epsgSearchUri, {
      method: 'GET'
    }).then((res) => {
      if (!res.ok) return reject(res.status)

      return res.json()
    }).then((json) => {
      // const json = JSON.parse(responseJSON)
      console.log(json) // eslint-disable-line no-console
      const result = json.results[json.results.length - 1]
      const proj4def = result.proj4
      const bbox = result.bbox

      proj4.defs(code, proj4def)
      const projection = olProj.get(code)
      const fromLonLat = olProj.getTransform('EPSG:4326', projection)

      // Very approximate calculation of projection extent
      const extent = olExtent.applyTransform(
        [bbox[1], bbox[2], bbox[3], bbox[0]], fromLonLat)

      projection.setExtent(extent)
      if (!projection.units_) projection.units_ = 'degrees'

      resolve(projection)
    }).catch((error) => {
      reject(error)
    })
  })
}

const readFile = (blob) => {
  const reader = new FileReader()
  return new Promise((resolve) => {
    reader.addEventListener('load', (evt) => {
      console.log(evt) // eslint-disable-line no-console
      const buffer = evt.target.result

      resolve(buffer)
    })
    reader.readAsArrayBuffer(blob)
  })
}

const getModelTypeName = (modelTypeCode) => {
  var modelTypeName;
  switch(modelTypeCode) {
    case 0:
      modelTypeName = 'undefined';
      break;
    case 1:
      modelTypeName = 'ModelTypeProjected';
      break;
    case 2:
      modelTypeName = 'ModelTypeGeographic';
      break;
    case 3:
      modelTypeName = 'ModelTypeGeocentric';
      break;
    case 32767:
      modelTypeName = 'user-defined';
      break;
    default:
      if (modelTypeCode<32767) modelTypeName= 'GeoTIFF Reserved Codes';
      else if (modelTypeCode>32767) modelTypeName= 'Private User Implementations';
  }
  return modelTypeName;
}

const getCRSCode = (geoKeys) => {
  let CRSCode = 0
  debugger
  if (geoKeys.GTModelTypeGeoKey === false){
    return 0 
  }
  if (getModelTypeName(geoKeys.GTModelTypeGeoKey)=='ModelTypeGeographic' && geoKeys.GeographicTypeGeoKey) {
    CRSCode =geoKeys['GeographicTypeGeoKey'] 
  } else if (getModelTypeName(geoKeys.GTModelTypeGeoKey)=='ModelTypeProjected'  && geoKeys['ProjectedCSTypeGeoKey']) {
    CRSCode =geoKeys['ProjectedCSTypeGeoKey'] 
  } else if (getModelTypeName(geoKeys.GTModelTypeGeoKey) == 'user-defined') {
    if (geoKeys['ProjectedCSTypeGeoKey']) {
      CRSCode = geoKeys['ProjectedCSTypeGeoKey']
    } else if (geoKeys['GeographicTypeGeoKey']) {
      CRSCode = geoKeys['GeographicTypeGeoKey']
    } else {
      // Littel Hack for 3857
      if (geoKeys.hasOwnProperty('GTCitationGeoKey') && geoKeys['GTCitationGeoKey'].search("WGS_1984_Web_Mercator_Auxiliary_Sphere")!=-1) {
        CRSCode = 3857
      } else {
        // consoleCRSProperty()
        console.log(geoKeys) // eslint-disable-line no-console
      }
    }
  }
  return CRSCode
}

function drawImage(parser, in_proj, in_bbox, in_delta, in_context) {
  // Get some Information form HTML document ---> use MVVM instead 
  var useMinMax = false; 
  // var MinMaxCb = document.getElementById( "MixMaxCb" );
  var MinMaxValue = [];
  if (MinMaxCb != null && MinMaxCb != 'undefined' && MinMaxCb.checked == true)
   {
    useMinMax = true;
    // MinMaxValue[0]  = document.getElementById( "MinValueOfMinMax" ).value;
    // MinMaxValue[1]  = document.getElementById( "MaxValueOfMinMax" ).value;
   }
 
  var points = in_bbox.coord;
  if (in_bbox.WKID !=  in_proj) {
    //console.log("transfo : " + in_bbox.WKID);
    for (var i =0; i<points.length ;i++) {
      points[i] = olProj.transform(in_bbox.coord[i], in_bbox.WKID, in_proj);
    }
    in_bbox.WKID=in_proj;
  }
   
  var pixelUL = map.getPixelFromCoordinate(points[0]);
  pixelUL[0] = Math.ceil( pixelUL[0] +in_delta[0]);
  pixelUL[1] = Math.ceil( pixelUL[1] +in_delta[1]);
 
  var pixelLR = map.getPixelFromCoordinate(points[2]);
  pixelLR[0] = Math.floor( pixelLR[0] +in_delta[0]); 
  pixelLR[1] = Math.floor( pixelLR[1] +in_delta[1]); 
  //console.log("drawImage",pixelUL,pixelLR);
  var pCRS= getCRSCode(parser);
  var projstring ='EPSG:' + pCRS.toString();
 
  in_context.fillStyle = parser.makeRGBAFillValue(255, 255, 255, 0);
  var red=255;
  var green=0;
  var blue=0;
  var opacity=0.7;
  var opacityError=1;
  for (var y = pixelUL[1] ; y < pixelLR[1] ; y++)
  {
    var imy= y-in_delta[1];				
    for (var x = pixelUL[0] ; x < pixelLR[0] ; x++)
    {
      var imx= x-in_delta[0];
      var mapCoord = map.getCoordinateFromPixel([imx,imy]);
      var pmapCoord ;
      if (projstring!=in_proj)
        pmapCoord =olProj.transform(mapCoord, in_proj,projstring );
      else
        pmapCoord = mapCoord;
      var imageCoord= parser.PCSToImage(pmapCoord[0],pmapCoord[1]);
      if (imageCoord[0]==1)
      {
        var pixSample=parser.getPixelValueOnDemand(imageCoord[1],imageCoord[2]);
        if (pixSample != null)
          {
            if( useMinMax == true )
              pixrgba= parser.getMinMaxPixelValue(pixSample,MinMaxValue[0],MinMaxValue[1]);
            else
              pixrgba= parser.getRGBAPixelValue(pixSample);
            in_context.fillStyle = parser.makeRGBAFillValue(pixrgba[0], pixrgba[1], pixrgba[2],opacity);
          }
        else
          in_context.fillStyle = parser.makeRGBAFillValue(red, green, blue, opacityError);
      }
      else
      {
        in_context.fillStyle = parser.makeRGBAFillValue(red, green, blue, opacityError);
      }
      in_context.fillRect(x, y , 1, 1);
    }
  }
}

function drawBBox(in_proj,in_bbox,in_delta,in_context) {
  const points = in_bbox.coord
  if (in_bbox.WKID !=  in_proj) {
      //console.log("transfo : " + in_bbox.WKID)
      for (var i =0; i<points.length ; i++)
        points[i] =olProj.transform(in_bbox.coord[i], in_bbox.WKID, in_proj)
      in_bbox.WKID=in_proj
  }

  const pixels = []
  for (var i =0; i<points.length ;i++) {
    pixels[i] = map.getPixelFromCoordinate(points[i])
    pixels[i][0] += in_delta[0]
    pixels[i][1] += in_delta[1]
  }

  // Draw
  in_context.save()
  in_context.beginPath()
  in_context.moveTo(pixels[0][0], pixels[0][1])
  in_context.lineTo(pixels[1][0], pixels[1][1])
  in_context.lineTo(pixels[2][0], pixels[2][1])
  in_context.lineTo(pixels[3][0], pixels[3][1])
  in_context.closePath()
  in_context.lineWidth = 3
  in_context.stroke()
  in_context.restore()
}

function addCanvasLayer (parser, bbox, map) {	
    // This is the projection of the view 
    // we need to project or Geotiff in this projection (if needed)
    const projOfView = map.getView().getProjection().getCode()
    
    const canvasFunction = function(extent, resolution, pixelRatio, size, projection) {
      var canvas = document.createElement('canvas')
      var context = canvas.getContext('2d')
      var canvasWidth = size[0], canvasHeight = size[1]
      canvas.setAttribute('width', canvasWidth)
      canvas.setAttribute('height', canvasHeight)

      // Canvas extent is different than map extent, so compute delta between 
      // left-top of map and canvas extent.
      var mapExtent = map.getView().calculateExtent(map.getSize())
      //console.log("ViewExtent :",  mapExtent)
      
      var canvasOrigin = map.getPixelFromCoordinate([extent[0], extent[3]])
      var mapOrigin = map.getPixelFromCoordinate([mapExtent[0], mapExtent[3]])
      var delta = [mapOrigin[0]-canvasOrigin[0], mapOrigin[1]-canvasOrigin[1]]
      
      drawBBox(projOfView, bbox,delta,context)
      drawImage(parser,projOfView, bbox,delta,context)
      return canvas
  }

  // Define the canvas Layer ad add it to the map 
  var canvasLayer = new ImageLayer({
    source: new ImageCanvas({
      canvasFunction: canvasFunction,
      projection: projOfView
    })
  })

  map.addLayer(canvasLayer)
}

/**
 * A map control container with built-in positioning
 * @component
 * @category FileImport
 * @since 0.1.0
 */
function FileImport (props) {
  const { map } = props

  const onChange = async (evt) => {
    const fileBlob = evt.target.files[0]
    console.log(fileBlob) // eslint-disable-line no-console
    const buffer = await readFile(fileBlob)
    const tiff = await fromArrayBuffer?.(buffer)
    const image = await tiff.getImage()
    // console.log(tiff) // eslint-disable-line no-console
    console.log(image, image.geoKeys) // eslint-disable-line no-console
    const pCRS = getCRSCode(image.geoKeys)
    console.log(pCRS) // eslint-disable-line no-console
    // if (pCRS != 4326 && pCRS!=3857 && pCRS!=102113 /*old 3857 */) throw TypeError("This reference system is not handled : use proj4js in conjunction to OL3 and GeotiffParser" +  pCRS)
    /* const bbox = {
      'WKID': pCRS.toString(),
      'coord': image.getBoundingBox(),
    } */
    // addCanvasLayer(image, bbox, map)
    // return
    // console.log(proj.get('EPSG:4269')) // eslint-disable-line no-console
    const extent = image.getBoundingBox()
    const proj = await getProj(image.geoKeys.GeogCitationGeoKey)
    // const proj = await getProj('4269')
    console.log(proj) // eslint-disable-line no-console
    const transformedExtent = olProj.transformExtent(extent, proj, map.getView().getProjection())
    console.log(extent, transformedExtent) // eslint-disable-line no-console
    const data = await image.readRasters()
    // console.log({data}) // eslint-disable-line no-console

    const uint8Array = Uint8ClampedArray.from(data[0])
    console.log({ data, uint8Array }) // eslint-disable-line no-console
    const imageData = new ImageData(uint8Array, data.width / 2, data.height / 2)
    // const imageData = new ImageData(data[0], data.width, data.height)
    // console.log(imageData) // eslint-disable-line no-console
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    // const offscreen = canvas.transferControlToOffscreen() // this creates an OffscreenCanvas object that will immediately render to our onscreen Canvas elements
    // const tiffWorkerString = `self.onmessage = ${onmessage.toString()}` // convert the worker function to a string
    // const workerBlob = new Blob([tiffWorkerString], { type: 'application/javascript' }) // convert the string to a blob
    // const workerUrl = URL.createObjectURL(workerBlob) // create a data url from the blob
    // const worker = new Worker(workerUrl) // create a worker from the data url
    
    // document.body.append(canvas)
    canvas.style.position = 'absolute'
    canvas.style.left = '0px'
    canvas.style.top = '0px'
    canvas.style['z-index'] = '0'
    canvas.style.width = `${imageData.width}px`
    canvas.style.height = `${imageData.height}px`
    canvas.style['background-color'] = 'white'
    // ctx.width = imageData.width
    canvas.width = imageData.width / 2
    // ctx.height = imageData.height
    canvas.height = imageData.height / 2
    // ctx.fillStyle = 'green'
    // ctx.fillRect(0, 0, imageData.width, imageData.height)
    ctx.putImageData(imageData, 0, 0)
    
    const canvasURI = canvas.toDataURL()
    console.log(canvasURI) // eslint-disable-line no-console
    // const reader = new FileReader()
    // const uri = reader.readAsDataURL(fileBlob)
    const imageLoadFunction = (imageTile, source) => {
      console.log(imageTile, source) // eslint-disable-line no-console
    
      debugger
      imageTile.getImage().src = canvasURI
    }
    const staticSource = new ImageStatic({
      url: 'http://localhost:3001/',
      // projection: proj,
      // imageExtent: transformedExtent,
      imageExtent: [-Infinity, -Infinity, Infinity, Infinity],
      imageSize: [image.width, image.height],
      imageLoadFunction
    })
    const canvasSource = new ImageCanvas({
      canvasFunction: (extent, resolution, dpr, size, projection) => {
        console.log({extent, resolution, dpr, size, projection}) // eslint-disable-line no-console
        // worker.postMessage({ extent, resolution, dpr, size, projection })

        return canvas
      },
      // url: 'http://localhost:3001/',
      // extent: extent,
      projection: proj
    })
    const tileSource = new TileWMS({
      url: 'http://localhost:3001/',
      tileLoadFunction: imageLoadFunction,
      projection: proj
    })
    const debugSource = new TileDebug({
      url: 'http://localhost:3001/',
      tileLoadFunction: imageLoadFunction,
      projection: proj,
      tileGrid: tileSource.getTileGrid()
    })
    var elevation = new olSourceXYZ({
      url: 'https://{a-d}.tiles.mapbox.com/v3/aj.sf-dem/{z}/{x}/{y}.png',
      crossOrigin: 'anonymous',
      transition: 0
    })



    const layer = window.layer = new ImageLayer({
      title: 'DEM',
      source: elevation
      // extent: [-Infinity, -Infinity, Infinity, Infinity]
      // extent: transformedExtent
    })

    map.addLayer(layer)
    console.log(layer.getExtent()) // eslint-disable-line no-console
    debugger
    layer.getSource().refresh()
    // map.getView().fit(layer.getExtent())
    map.getView().setCenter(olProj.transform(
      olExtent.getCenter(extent), proj, 'EPSG:3857'))
  }


  return (
    <div style={{ height: '100px', width: '500px', backgroundColor: 'white', position: 'absolute' }}>
      <input type='file' onChange={onChange} accept={'.tif,.geotiff'}></input>
    </div>
  )
}

FileImport.propTypes = {
  /** reference to Openlayers map object */
  map: PropTypes.object.isRequired
}

export default connectToMap(FileImport)
