// api.ts

// Base URL de la API de Open Food Facts
const BASE_URL = "https://world.openfoodfacts.org/api/v0"

export const fetchAllProducts = async ({
  supermarket = "",
  category = "",
  allergens = "",
  ingredients = ""
}: {
  supermarket?: string
  category?: string
  allergens?: string
  ingredients?: string
}) => {
  let allProducts: any[] = []
  let currentPage = 1
  let totalPages = 1

  try {
    do {
      // Construir la URL con los parámetros dinámicos
      let query = `${BASE_URL}/search.json?page=${currentPage}`
      if (supermarket)
        query += `&brands_tags=${encodeURIComponent(supermarket)}`
      if (category) query += `&categories_tags=${encodeURIComponent(category)}`
      if (allergens) query += `&allergens_tags=${encodeURIComponent(allergens)}`
      if (ingredients)
        query += `&ingredients_tags=${encodeURIComponent(ingredients)}`

      const response = await fetch(query)

      if (!response.ok) {
        throw new Error(`Error en la API: ${response.statusText}`)
      }

      const data = await response.json()

      // Agregar los productos de la página actual
      allProducts = [...allProducts, ...data.products]

      // Calcular el número total de páginas
      if (currentPage === 1) {
        totalPages = Math.ceil(data.count / 20) // 20 productos por página
      }

      currentPage++
    } while (currentPage <= totalPages)

    return allProducts
  } catch (error) {
    console.error("Error al obtener productos:", error)
    return null
  }
}
