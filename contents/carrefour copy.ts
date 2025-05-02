import type { PlasmoCSConfig } from "plasmo"

import "../styles/carrefour.css"

import { filterProducts } from "~utils/productFilters"

export const config: PlasmoCSConfig = {
  matches: ["https://www.carrefour.es/*"],
  all_frames: true
}

// console.log("Carrefour content script copy loaded")

const searchLinkSelector =
  "ul.x-base-grid li.x-base-grid__item div:first-of-type a:first-of-type"
const plpLinkSelector = "div.product-card__media a"
// Función de debouncing que también retorna una promesa
function debounce<T extends (...args: any[]) => void>(
  func: T,
  delay: number
): T {
  let timer: NodeJS.Timeout
  let lastCall: number = Date.now()
  return ((...args: any[]) => {
    clearTimeout(timer)
    const now = Date.now()
    const timeRemaining = delay - (now - lastCall)

    // Llamar a la función después del tiempo de espera
    if (timeRemaining <= 0) {
      lastCall = now
      func(...args)
    } else {
      timer = setTimeout(() => {
        lastCall = Date.now()
        func(...args)
      }, timeRemaining)
    }
  }) as T
}

// Función para extraer los enlaces de los productos
const extractProductLinks = (linkSelector) => {
  const arrayProducts = Array.from(
    document.querySelectorAll<HTMLAnchorElement>(linkSelector)
  )
    .filter((a) => a.href.includes("/supermercado/"))
    .map((a) => a.href)

  // console.log("Cantidad " + arrayProducts.length)
  return arrayProducts
}
const processedLinks: Map<string, string | null> = new Map() // Conjunto para almacenar enlaces ya procesados

// Función para hacer scraping de la página del producto y obtener el EAN
const scrapeEAN = async (url: string): Promise<string | null> => {
  try {
    const response = await fetch(url)
    const html = await response.text()

    const parser = new DOMParser()
    const doc = parser.parseFromString(html, "text/html")

    const scriptTag = doc.querySelector<HTMLScriptElement>(
      "script[type='application/ld+json']"
    )
    if (scriptTag) {
      const jsonData = JSON.parse(scriptTag.innerText)
      const ean = jsonData.gtin13 || null
      // console.log(url, "EAN del producto:", ean)
      return ean
    }
    console.warn(url, "EAN no encontrado")
    return null
  } catch (error) {
    console.error("Error al obtener el EAN del producto:", error)
    return null
  }
}

// Función para procesar enlaces con Promise.all y asegurar secuencialidad
const processProductLinks = async (links: string[], linkSelector: string) => {
  const unprocessedLinks = links.filter((link) => !processedLinks.has(link))

  if (unprocessedLinks.length > 0) {
    // console.log("Procesando nuevos enlaces:", unprocessedLinks)

    const results = await Promise.all(
      unprocessedLinks.map(async (link) => {
        const ean = await scrapeEAN(link)
        processedLinks.set(link, ean) // Guardamos el EAN obtenido
        markProductAsProcessed(link, linkSelector) // Marca el producto en el DOM
        return { link, ean }
      })
    )

    const filteredTest = await filterProducts(results)
    // console.log(results)
    console.log("Filtrados")
    console.log("Resultados del procesamiento:", filteredTest)
    filteredTest.forEach((product) =>
      markProductAsFiltered(product.link, product.condition, linkSelector)
    )
  }

  // console.log(processedLinks)
}

// Función para aplicar estilo a los productos procesados
const markProductAsProcessed = (link: string, linkSelector: string) => {
  const productElement = Array.from(
    document.querySelectorAll<HTMLAnchorElement>(linkSelector)
  ).find((a) => a.href === link)

  if (productElement) {
    const container = productElement.closest("li") as HTMLElement
    if (container) {
      container.style.border = "2px solid orange"
      container.style.backgroundColor = "#f0dec0"
      container.style.opacity = "0.7"
    }
    productElement.setAttribute("data-processed", "true") // Marcamos como procesado
  }
}

const markProductAsFiltered = (
  link: string,
  condition: boolean,
  linkSelector: string
) => {
  const productElement = Array.from(
    document.querySelectorAll<HTMLAnchorElement>(linkSelector)
  ).find((a) => a.href === link)

  if (productElement) {
    const container = productElement.closest("li") as HTMLElement
    if (container) {
      if (condition) {
        container.style.border = "2px solid green"
        container.style.backgroundColor = "#c0f0d0"
        container.style.opacity = "0.7"
      } else {
        container.style.border = "2px solid red"
        container.style.backgroundColor = "#f0c0c0"
        container.style.opacity = "0.7"
      }
    }
    productElement.setAttribute("data-processed", "true") // Marcamos como procesado
  }
}

// Función debounced para extraer y procesar productos
const extractAndProcessProductsDebounced = debounce(async (linkSelector) => {
  const currentProductLinks = extractProductLinks(linkSelector)
  // console.log(currentProductLinks)
  await processProductLinks(currentProductLinks, linkSelector)
}, 500)

const domObserver = new MutationObserver(() => {
  const searchProductsContainer = document.querySelector("ul.x-base-grid")
  const plpProductsContainer = document.querySelector(".plp")

  if (searchProductsContainer) {
    extractAndProcessProductsDebounced(searchLinkSelector)
    searchObserver.observe(searchProductsContainer, { childList: true })
  }

  if (plpProductsContainer) {
    extractAndProcessProductsDebounced(plpLinkSelector)
    plpObserver.observe(plpProductsContainer, { childList: true })
  }

  // // console.log(productContainer)
  // if (productContainer) {
  //   if (productContainer.classList.contains("x-base-grid")) {
  //     domObserver.disconnect() // Detener el observer en el body
  //     extractAndProcessProductsDebounced(searchLinkSelector)

  //     searchObserver.observe(productContainer, { childList: true })
  //     plpObserver.observe()
  //   } else {
  //     searchObserver.disconnect()

  //     domObserver.observe(body, { childList: true, subtree: true })
  //   }
  // }
})

// Observer para monitorizar cambios en el DOM
const searchObserver = new MutationObserver((mutationsList) => {
  const productContainer = document.querySelector("ul.x-base-grid")

  // console.log(productContainer)

  if (productContainer) {
    if (productContainer.classList.contains("x-base-grid")) {
      extractAndProcessProductsDebounced(searchLinkSelector)
    } else {
      searchObserver.disconnect()

      domObserver.observe(body, { childList: true, subtree: true })
    }
  }
})

const plpObserver = new MutationObserver((mutationList) => {
  const productContainer = document.querySelector(".plp")

  if (productContainer) {
    plpObserver.disconnect() // Detener el observer en el body
    extractAndProcessProductsDebounced(plpLinkSelector)
  }
})

// Observamos el "body" para detectar la creación de "section.ebx-grid"
const body = document.querySelector("body")
if (body) {
  domObserver.observe(body, { childList: true, subtree: true })
}
