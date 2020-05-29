export async function onmessage (e) {
  const ctx = e.data.canvas.getContext('2d')
  debugger
  const tiff = await e.data.fromBlob(e.target.data.file)
  const image = await tiff.getImage()
  const data = await image.readRasters()
  const uint8Array = Uint8ClampedArray.from(data[0])
  const imageData = new ImageData(uint8Array, (data.width / 2), data.height / 2)

  console.log(data) // eslint-disable-line no-console
  console.log(imageData) // eslint-disable-line no-console

  ctx.putImageData(imageData, 0, 0)
}
