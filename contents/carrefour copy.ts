import type { PlasmoCSConfig } from "plasmo"

import { filterLactoseFreeProducts } from "~utils/api"

export const config: PlasmoCSConfig = {
  matches: ["https://www.carrefour.es/*"],
  all_frames: true
}

let allLinks = []
console.log("Carrefour content script loaded")

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
const extractProductLinks = () =>
  Array.from(
    document.querySelectorAll<HTMLAnchorElement>(
      "section.ebx-grid .ebx-result__container-click > a.ebx-result__figure-link"
    )
  )
    .filter((a) => a.href.includes("/supermercado/"))
    .map((a) => a.href)

let previousProductLinks: string[] = []
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
      console.log(url, "EAN del producto:", ean)
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
const processProductLinks = async (links: string[]) => {
  const unprocessedLinks = links.filter((link) => !processedLinks.has(link))

  if (unprocessedLinks.length > 0) {
    console.log("Procesando nuevos enlaces:", unprocessedLinks)

    const results = await Promise.all(
      unprocessedLinks.map(async (link) => {
        const ean = await scrapeEAN(link)
        processedLinks.set(link, ean) // Guardamos el EAN obtenido
        markProductAsProcessed(link) // Marca el producto en el DOM
        return { link, ean }
      })
    )

    const test = await filterLactoseFreeProducts(results)
    console.log(results)
    console.log("Filtrados")
    console.log(test)
    console.log("Resultados del procesamiento:", results)
  }

  console.log(processedLinks)
}

// Función para aplicar estilo a los productos procesados
const markProductAsProcessed = (link: string) => {
  const productElement = Array.from(
    document.querySelectorAll<HTMLAnchorElement>(
      "section.ebx-grid .ebx-result__container-click > a.ebx-result__figure-link"
    )
  ).find((a) => a.href === link)

  if (productElement) {
    const container = productElement.closest("article") as HTMLElement
    if (container) {
      container.style.border = "2px solid green"
      container.style.backgroundColor = "#d0f0c0"
      container.style.opacity = "0.7"
    }
    productElement.setAttribute("data-processed", "true") // Marcamos como procesado
  }
}

// Función debounced para extraer y procesar productos
const extractAndProcessProductsDebounced = debounce(async () => {
  const currentProductLinks = extractProductLinks()
  await processProductLinks(currentProductLinks)
}, 500)

// Observer para monitorizar cambios en el DOM
const observer = new MutationObserver((mutationsList) => {
  const productContainer = document.querySelector("section.ebx-grid")

  if (productContainer) {
    observer.observe(productContainer, { childList: true, subtree: true })

    // Llamamos a la función debounced para extraer y procesar los enlaces
    extractAndProcessProductsDebounced()
  }
})

// Observamos el "body" para detectar la creación de "section.ebx-grid"
const body = document.querySelector("body")
if (body) {
  const domObserver = new MutationObserver(() => {
    const productContainer = document.querySelector("section.ebx-grid")
    if (productContainer) {
      domObserver.disconnect() // Detener el observer en el body
      observer.observe(productContainer, { childList: true, subtree: true })
    }
  })

  domObserver.observe(body, { childList: true, subtree: true })
}
