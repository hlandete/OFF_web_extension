import { Console } from "console"

import { fetchProductData } from "./api"

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
  no_soja: {
    allergens: ["en:soy"],
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

// Función para filtrar productos según las características deseadas
export const filterLactoseFreeProducts = async (
  products: {
    link: string
    ean: string
  }[]
) => {
  alert("Lactosa")
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
          !allergens.includes("en:lactose") ||
          categories.includes("en:lactose-free-milk") ||
          labels.includes("en:no-lactose") ||
          keywords.includes("no-lactose")

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

const filter = async (
  products: {
    link: string
    ean: string
  }[]
) => {
  const unprocessedProducts = products.filter(
    (product) => !processedProducts.has(product)
  )

  // const appliedFilters = chrome.storage.local.get({ [STORAGE_KEY]: newState })
}
