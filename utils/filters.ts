import { fetchProductData } from "./api"

const STORAGE_KEY = "activeFilters"

const FILTER_KEYS: Record<string, { [key: string]: string[] }> = {
  no_lactose: {
    allergens: ["en:lactose", "en:milk"],
    categories: ["en:lactose-free-milk"],
    labels: ["en:no-lactose"],
    keywords: ["no-lactose"]
  },
  no_gluten: {
    allergens: ["en:gluten"],
    categories: ["en:glute-free"],
    labels: ["en:no-gluten"],
    keywords: ["no-gluten"]
  },
  no_egg: {
    allergens: ["en:egg"],
    categories: ["en:egg-free"],
    labels: ["en:no-egg"],
    keywords: ["no-egg"]
  },
  no_peanuts: {
    allergens: ["en:peanuts"],
    categories: ["en:peanut-free"],
    labels: ["en:no-peanuts"],
    keywords: ["no-peanuts"]
  },
  no_soy: {
    allergens: ["en:soy",  "en:soybeans"],
    categories: ["en:soy-free"],
    labels: ["en:no-soy"],
    keywords: ["no-soy"]
  },
  no_fish: {
    allergens: ["en:fish"],
    categories: ["en:fish-free"],
    labels: ["en:no-fish"],
    keywords: ["no-fish"]
  },
  no_seafood: {
    allergens: ["en:seafood"],
    categories: ["en:seafood-free"],
    labels: ["en:no-seafood"],
    keywords: ["no-seafood"]
  }
}

const processedProducts: Set<{ link: string; ean: string }> = new Set() // To avoid processing duplicate EANs


const mapProductFilterData = (product: any) => {
  return {
    allergens: [
      ...(Array.isArray(product.allergens_hierarchy)
        ? product.allergens_hierarchy
        : []),
      ...(Array.isArray(product.allergens_tags) ? product.allergens_tags : [])
    ],
    categories: [
      ...(Array.isArray(product.categories_hierarchy)
        ? product.categories_hierarchy
        : []),
      ...(Array.isArray(product.categories_tags) ? product.categories_tags : [])
    ],
    labels: [
      ...(Array.isArray(product.labels_hierarchy)
        ? product.labels_hierarchy
        : []),
      ...(Array.isArray(product.labels_tags) ? product.labels_tags : [])
    ],
    keywords: [...(Array.isArray(product._keywords) ? product._keywords : [])]
  }
}

// Función para verificar si un producto cumple con los filtros
const checkFilterCondition = (
  product: any,
  filters: Record<string, Record<string, string[]>>
) => {

  const mappedProductFilterData = mapProductFilterData(product)

  console.log(mappedProductFilterData)
  const matchers: Record<string, (values: string[]) => boolean> = {
    allergens: (values) =>
      !values.some((value) => mappedProductFilterData.allergens.includes(value)),
    categories: (values) =>
      values.some((value) => mappedProductFilterData.categories.includes(value)),
    labels: (values) =>
      values.some((value) => mappedProductFilterData.labels.includes(value)),
    keywords: (values) =>
      values.some((value) => mappedProductFilterData.keywords.includes(value))
  }
  // Validar contra los filtros
  const validations = []

  const iterate = (filterValues: Record<string, string[]>) => {
    for (const [keyword, values] of Object.entries(filterValues)) {
      const match = matchers[keyword]

      if (match && match(values)) {
        return true
      }
    }
    return false
  }
  for (const [filterType, filterKeywords] of Object.entries(filters)) {

    validations.push(iterate(filterKeywords))
  }

  console.log(validations)
  if (validations.every((value) => value === true)) {
    return true
  } else {
    return false
  }
}

const getActiveFiltersKey = (filters: Record<string, boolean>) => {
  const activeKeys = {}
  for (let key of Object.keys(filters)) {
    if (filters[key] === true) {
      activeKeys[key] = FILTER_KEYS[key]
    }
  }
  return activeKeys
}

export const filterProducts = async (
  products: { link: string; ean: string, html: HTMLElement }[]
) => {
  // Filtrar EANs no procesados
  // const unprocessedProducts = products.filter(
  //   (product) => !processedProducts.has(product)
  // )

  const activeFilters = await getActiveFilters()
  const activeKeys = getActiveFiltersKey(activeFilters)

  // Procesar los productos con Promise.all
  const results = await Promise.all(
    products.map(async (data) => {
      const product = await fetchProductData(data.ean, data.link)
      if (product) {
        const matchFilters = checkFilterCondition(product, activeKeys)

        // Si el producto cumple con los filtros, devolverlo
        return {
          ...product,
          ...data,
          name: product.product_name,
          brand: product.brands,
          condition: matchFilters 
        }
      }
      return null // Si no cumple, retorna null
    })
  )

  // Actualizar EANs procesados y filtrar resultados válidos
  // unprocessedProducts.forEach((product) => processedProducts.add(product))
  return results.filter((product) => product !== null) // Filtra los productos no válidos
}

const getActiveFilters = async (): Promise<Record<string, boolean>> => {
  return new Promise((resolve) => {
    chrome.storage.local.get(STORAGE_KEY, (result) => {
      resolve(result[STORAGE_KEY] || {})
    })
  })
}
