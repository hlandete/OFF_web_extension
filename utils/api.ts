// api.ts
const processedProducts: Set<{ link: string; ean: string }> = new Set() // Para evitar procesar EANs duplicados

// Función para obtener datos de un producto desde la API de OpenFoodFacts
export const fetchProductData = async (ean: string) => {
  try {
    const response = await fetch(
      `https://world.openfoodfacts.org/api/v0/product/${ean}.json`
    )
    const data = await response.json()

    if (data.status === 1) {
      // Producto encontrado
      return data.product
    } else {
      console.warn(`Producto con EAN ${ean} no encontrado.`)
      return null
    }
  } catch (error) {
    console.error(`Error al obtener datos del producto con EAN ${ean}:`, error)
    return null
  }
}

// Función para filtrar productos según las características deseadas
export const filterLactoseFreeProducts = async (
  products: {
    link: string
    ean: string
  }[]
) => {
  // Filtrar EANs no procesados
  const unprocessedProducts = products.filter(
    (product) => !processedProducts.has(product)
  )

  // Procesar los EANs con Promise.all
  const results = await Promise.all(
    unprocessedProducts.map(async (data) => {
      const product = await fetchProductData(data.ean)

      if (product) {
        const allergens = product.allergens_tags || []
        const labels = product.labels_tags || []

        const isLactoseFree = !(
          allergens.includes("en:lactose") && allergens.includes("en:milk")
        )

        // Si cumple con las características, retornarlo
        if (isLactoseFree) {
          return {
            ...data,
            name: product.product_name,
            brand: product.brands
          }
        }
      }
      return null // Si no cumple, retornar null
    })
  )

  // Actualizar EANs procesados y filtrar resultados válidos
  unprocessedProducts.forEach((product) => processedProducts.add(product))
  return results.filter((product) => product !== null)
}
