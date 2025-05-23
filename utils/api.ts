// Función para obtener datos de un producto desde la API de OpenFoodFacts
export const fetchProductData = async (ean: string, url?: string) => {
  try {
    if(ean){
    const response = await fetch(
      `https://world.openfoodfacts.org/api/v0/product/${ean}.json`
    )
    const data = await response.json()

    if (data.status === 1) {
      // Producto encontrado
      return data.product
    } else {
      console.warn(`Producto con EAN ${ean} y url ${url} no encontrado.`)
      return null
    }
  }
  else{
    return null
  }
  } catch (error) {
    console.error(`Error al obtener datos del producto con EAN ${ean}:`, error)
    return null
  }
}
