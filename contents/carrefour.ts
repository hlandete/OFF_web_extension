import type { PlasmoCSConfig } from "plasmo"

import "../styles/carrefour.css"

import { filterProducts } from "~utils/filters"
import { debounce } from "~utils/debounce"

export const config: PlasmoCSConfig = {
  matches: ["https://www.carrefour.es/*"],
  all_frames: true
}


console.log("Carrefour Search")

const searchLinkSelector = ".x-base-grid__item"
const plpLinkSelector = ".product-card__parent"


// Función para extraer los enlaces de los productos
const extractProductLinks = (linkSelector) => {


  const arrayProducts = Array.from(
    document.querySelectorAll<HTMLElement>(linkSelector+':not([data-processed="true"])')
  )
    .map((html) => {

      const anchor = html.querySelector('a')?.getAttribute('href')


      console.log({ html, link: anchor})
      return { html, link: anchor}
    })

  // console.log("Cantidad " + arrayProducts.length)
  return arrayProducts
}
// const processedLinks: Map<string, string | null> = new Map() // Conjunto para almacenar enlaces ya procesados
const processedLinks: Array<{
  html: HTMLElement;
  link: string;
}> = []
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
      console.log(ean + "   " + url)
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
const processProductLinks = async (products: {
  html: HTMLElement;
  link: string;
}[]) => {

  if (products.length > 0) {
    // console.log("Procesando nuevos enlaces:", unprocessedLinks)

    const results = await Promise.all(
      products.map(async (product) => {
        const ean = await scrapeEAN(product.link)
        processedLinks.push(product) // Guardamos el EAN obtenido
        markProductAsProcessed(product.html) // Marca el producto en el DOM
        return { ...product, ean }
      })
    )

    const filteredTest = await filterProducts(results)
    // // console.log(results)
    // console.log("Filtrados")
     console.log("Resultados del procesamiento:", filteredTest)
    filteredTest.forEach((product) =>
      markProductAsFiltered(product.html, product.condition)
    )
  }

  // console.log(processedLinks)
}

// Función para aplicar estilo a los productos procesados
const markProductAsProcessed = (html) => {
  html.setAttribute("data-processed", "true");
  html.style.border = "2px solid orange"
  html.style.backgroundColor = "#f0dec0"
  html.style.opacity = "0.7"
    
}

const markProductAsFiltered = (
  html: HTMLElement,
  condition: boolean,
) => {
      if (condition) {
        html.style.border = "2px solid green"
        html.style.backgroundColor = "#c0f0d0"
        html.style.opacity = "0.7"
      } else {
        html.style.border = "2px solid red"
        html.style.backgroundColor = "#f0c0c0"
        html.style.opacity = "0.7"
      }

  
}

// Función debounced para extraer y procesar productos
const extractAndProcessProductsDebounced = debounce(async (linkSelector) => {
  const currentProductLinks = extractProductLinks(linkSelector)
  // console.log(currentProductLinks)
  await processProductLinks(currentProductLinks)
}, 500)


function initObservers() {

const domObserver = new MutationObserver(() => {
  const searchProductsContainer = document.querySelector("ul.x-base-grid")
  const plpProductsContainer = document.querySelector(".plp")

  if (searchProductsContainer) {
    extractAndProcessProductsDebounced(searchLinkSelector)
    searchObserver.observe(searchProductsContainer, { childList: true, subtree: true  })
  }

  if (plpProductsContainer) {
    extractAndProcessProductsDebounced(plpLinkSelector)
    plpObserver.observe(plpProductsContainer, { childList: true })
  }

})

// Observer para monitorizar cambios en el DOM
const searchObserver = new MutationObserver((mutationsList) => {
  mutationsList.forEach((mutation) => {
    if (mutation.type === 'childList') {
      mutation.addedNodes.forEach((node) => {
        if (
          node instanceof HTMLElement &&
          node.classList.contains('product-card-list__item') &&
          !node.hasAttribute('data-observed')
        ) {

          node.setAttribute('data-observed', 'true');
          const productContainer = document.querySelector("ul.x-base-grid")

          if (productContainer) {
            if (productContainer.classList.contains("x-base-grid")) {
              extractAndProcessProductsDebounced(searchLinkSelector)
            } else {
              searchObserver.disconnect()
        
              domObserver.observe(body, { childList: true, subtree: true })
            }
          }
        }
      });
    }
  });
  
})

const plpObserver = new MutationObserver((mutationList) => {

  mutationList.forEach((mutation) => {
    if (mutation.type === 'childList') {
      mutation.addedNodes.forEach((node) => {
        if (
          node instanceof HTMLElement &&
          node.classList.contains('product-card__parent') &&
          !node.hasAttribute('data-observed')
        ) {

          node.setAttribute('data-observed', 'true');
          const productContainer = document.querySelector(".plp")

          if (productContainer) {
            plpObserver.disconnect() // Detener el observer en el body
            extractAndProcessProductsDebounced(plpLinkSelector)
          }
        }
      });
    }
  });

})


  // Observamos el "body" para detectar la creación de "section.ebx-grid"

  const body = document.querySelector("body")
  if (!body) return

  // Reiniciamos por si estaban activos antes
  domObserver.disconnect()
  searchObserver.disconnect()
  plpObserver.disconnect()

  domObserver.observe(body, { childList: true, subtree: true })
}

initObservers()




