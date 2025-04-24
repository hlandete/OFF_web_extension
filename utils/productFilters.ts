import { Console } from "console"

import { fetchProductData } from "./api"

const processedProducts: Set<{ link: string; ean: string }> = new Set() // To avoid processing duplicate EANs

// Función para filtrar productos según las características deseadas
export const filterLactoseFreeProducts = async (
  products: {
    link: string
    ean: string
  }[]
) => {
  console.log("ACTIVOS")
  console.log(await getActiveFilters())
  // Filtrar EANs no procesados
  const unprocessedProducts = products.filter(
    (product) => !processedProducts.has(product)
  )

  // Procesar los EANs con Promise.all
  const results = await Promise.all(
    unprocessedProducts.map(async (data) => {
      const product = await fetchProductData(data.ean, data.link)

      if (product) {
        const allergens = [
          ...(Array.isArray(product.allergens_hierarchy)
            ? product.allergens_hierarchy
            : []),
          ...(Array.isArray(product.allergens_tags)
            ? product.allergens_tags
            : [])
        ]

        const categories = [
          ...(Array.isArray(product.categories_hierarchy)
            ? product.categories_hierarchy
            : []),
          ...(Array.isArray(product.categories_tags)
            ? product.categories_tags
            : [])
        ]

        const labels = [
          ...(Array.isArray(product.labels_hierarchy)
            ? product.labels_hierarchy
            : []),
          ...(Array.isArray(product.labels_tags) ? product.labels_tags : [])
        ]

        const keywords = [
          ...(Array.isArray(product._keywords) ? product._keywords : [])
        ]

        const isLactoseFree =
          (!allergens.includes("en:lactose") &&
            !allergens.includes("en:milk")) ||
          categories.includes("en:lactose-free-milk") ||
          labels.includes("en:no-lactose") ||
          keywords.includes("no-lactose")

        console.log([...allergens, ...categories, ...labels, ...keywords])
        console.log(isLactoseFree)
        // Si cumple con las características, retornarlo
        return {
          ...product,
          ...data,
          name: product.product_name,
          brand: product.brands,
          condition: isLactoseFree
        }
      }
      return null // Si no cumple, retornar null
    })
  )

  // Actualizar EANs procesados y filtrar resultados válidos
  unprocessedProducts.forEach((product) => processedProducts.add(product))
  return results.filter((product) => product !== null)
}

export const filterGlutenFreeProducts = async (
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
      const product = await fetchProductData(data.ean, data.link)

      if (product) {
        const allergens = [
          ...(Array.isArray(product.allergens_hierarchy)
            ? product.allergens_hierarchy
            : []),
          ...(Array.isArray(product.allergens_tags)
            ? product.allergens_tags
            : [])
        ]

        const categories = [
          ...(Array.isArray(product.categories_hierarchy)
            ? product.categories_hierarchy
            : []),
          ...(Array.isArray(product.categories_tags)
            ? product.categories_tags
            : [])
        ]

        const labels = [
          ...(Array.isArray(product.labels_hierarchy)
            ? product.labels_hierarchy
            : []),
          ...(Array.isArray(product.labels_tags) ? product.labels_tags : [])
        ]

        const keywords = [
          ...(Array.isArray(product._keywords) ? product._keywords : [])
        ]

        const isGlutenFree = !allergens.includes("en:gluten")

        console.log(allergens)
        console.log(isGlutenFree)
        // Si cumple con las características, retornarlo
        return {
          ...product,
          ...data,
          name: product.product_name,
          brand: product.brands,
          condition: isGlutenFree
        }
      }
      return null // Si no cumple, retornar null
    })
  )

  // Actualizar EANs procesados y filtrar resultados válidos
  unprocessedProducts.forEach((product) => processedProducts.add(product))
  return results.filter((product) => product !== null)
}

export const filterProducts = async (
  products: { link: string; ean: string }[],
  filterKeys: Record<string, { [key: string]: string[] }>
) => {
  // Filtrar EANs no procesados
  const unprocessedProducts = products.filter(
    (product) => !processedProducts.has(product)
  )

  // Función para verificar si un producto cumple con los filtros
  const doesProductMatchFilters = (
    product: any,
    filters: Record<string, string[]>
  ) => {
    const allergens = [
      ...(Array.isArray(product.allergens_hierarchy)
        ? product.allergens_hierarchy
        : []),
      ...(Array.isArray(product.allergens_tags) ? product.allergens_tags : [])
    ]

    const categories = [
      ...(Array.isArray(product.categories_hierarchy)
        ? product.categories_hierarchy
        : []),
      ...(Array.isArray(product.categories_tags) ? product.categories_tags : [])
    ]

    const labels = [
      ...(Array.isArray(product.labels_hierarchy)
        ? product.labels_hierarchy
        : []),
      ...(Array.isArray(product.labels_tags) ? product.labels_tags : [])
    ]

    const keywords = [
      ...(Array.isArray(product._keywords) ? product._keywords : [])
    ]

    // Validar contra los filtros
    for (const [filterType, filterValues] of Object.entries(filters)) {
      // Validación para cada tipo de filtro (alérgenos, categorías, etc.)
      if (
        filterType === "allergens" &&
        filterValues.some((value) => allergens.includes(value))
      ) {
        return true
      }
      if (
        filterType === "categories" &&
        filterValues.some((value) => categories.includes(value))
      ) {
        return true
      }
      if (
        filterType === "labels" &&
        filterValues.some((value) => labels.includes(value))
      ) {
        return true
      }
      if (
        filterType === "keywords" &&
        filterValues.some((value) => keywords.includes(value))
      ) {
        return true
      }
    }

    return false // Si no cumple con los filtros, retorna false
  }

  // Procesar los productos con Promise.all
  const results = await Promise.all(
    unprocessedProducts.map(async (data) => {
      const product = await fetchProductData(data.ean, data.link)

      if (product) {
        const matchFilters = doesProductMatchFilters(product, filterKeys)

        if (matchFilters) {
          // Si el producto cumple con los filtros, devolverlo
          return {
            ...product,
            ...data,
            name: product.product_name,
            brand: product.brands,
            condition: true // Cambia a 'true' si cumple con los filtros
          }
        }
      }
      return null // Si no cumple, retorna null
    })
  )

  // Actualizar EANs procesados y filtrar resultados válidos
  unprocessedProducts.forEach((product) => processedProducts.add(product))
  return results.filter((product) => product !== null) // Filtra los productos no válidos
}

const getActiveFilters = async (): Promise<Record<string, boolean>> => {
  return new Promise((resolve) => {
    chrome.storage.local.get(["checkboxGroup"], (result) => {
      resolve(result["checkboxGroup"] || {})
    })
  })
}
