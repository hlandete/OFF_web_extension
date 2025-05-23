import type { PlasmoCSConfig } from "plasmo"

import "../styles/carrefour.css"

import { filterProducts } from "~utils/filters"
import { debounce } from "~utils/debounce"

export const config: PlasmoCSConfig = {
  matches: ["https://tienda.consum.es/*"],
  all_frames: true
}

console.log("Consum content script copy loaded")
const searchLinkSelector =
  "cmp-widget-product"
const plpLinkSelector = "div.product-card__media a"


// Función para extraer los enlaces de los productos
const extractProductLinks = (linkSelector) => {
  const arrayProducts = Array.from(
    document.querySelectorAll<HTMLAnchorElement>(linkSelector)
  )
    .map((html) => {
      const codeElement = html.closest("cmp-widget-product")?.querySelector(".product-info-name--code");
    
      // Extraer el número (por ejemplo: 7113756) con una RegExp
      const codeMatch = codeElement?.textContent?.match(/\d+/);
      const productCode = codeMatch ? codeMatch[0] : null;
      return { html, link: "https://tienda.consum.es/es/"+productCode}
    }
    )

  // console.log("Cantidad " + arrayProducts.length)
  return arrayProducts
}

const processedLinks: Array<{
  html: HTMLElement;
  link: string;
}> = []

// Función para hacer scraping de la página del producto y obtener el EAN
const scrapeEAN = async (url: string): Promise<string | null> => {
  try {
    const response = await fetch(url)
    const html = await response.text()

    const match = html.match(/EAN[^0-9]*([\d]{13})/);

if (match) {
  const ean = match[1];
  console.log("EAN encontrado:", ean);
  return ean;
} else {
  console.log("No se encontró el EAN");
}
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
  console.log(products)


  if (products.length > 0) {
    // console.log("Procesando nuevos enlaces:", unprocessedLinks)

    const results = await Promise.all(
      products.map(async (product) => {
        console.log(product)
        const ean = await scrapeEAN(product.link)
        processedLinks.push(product) // Guardamos el EAN obtenido
        markProductAsProcessed(product.html) // Marca el producto en el DOM
        // return {  ean, ...product }
      })
    )

    // const filteredTest = await filterProducts(results)
    // // console.log(results)
    // console.log("Filtrados")
    // console.log("Resultados del procesamiento:", filteredTest)
    // filteredTest.forEach((product) =>
    //   markProductAsFiltered(product.link, product.condition, linkSelector)
    // )
  }

  // console.log(processedLinks)
}

// Función para aplicar estilo a los productos procesados
const markProductAsProcessed = (product: HTMLElement) => {
console.log(product)
  if (product) {
    const container = product
    if (container) {
      container.style.border = "2px solid orange"
      container.style.backgroundColor = "#f0dec0"
      container.style.opacity = "0.7"
    }
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
  }
}

// Función debounced para extraer y procesar productos
const extractAndProcessProductsDebounced = debounce(async (linkSelector) => {
  const currentProductLinks = extractProductLinks(linkSelector)

  await processProductLinks(currentProductLinks)
}, 500)


function initObservers() {

  const searchProductsContainerSelector = "cmp-products-grid"
const domObserver = new MutationObserver(() => {
  const searchProductsContainer = document.querySelector(searchProductsContainerSelector)
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
  console.log(mutationsList);
  domObserver.disconnect();
  mutationsList.forEach((mutation) => {
    if (mutation.type === 'childList') {
      mutation.addedNodes.forEach((node) => {
        if (
          node instanceof HTMLElement &&
          node.tagName.toLowerCase() === 'cmp-widget-product' &&
          !node.hasAttribute('data-observed')
        ) {

          node.setAttribute('data-observed', 'true');
          const productContainer = document.querySelector(".grid__catalog")

        
          if (productContainer) {
              extractAndProcessProductsDebounced(searchLinkSelector)
          }
             else {
              searchObserver.disconnect()
        
              domObserver.observe(body, { childList: true, subtree: true })
            }
        }
      });
    }
  });

 
  
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
  if (!body) return

  // Reiniciamos por si estaban activos antes
  domObserver.disconnect()
  searchObserver.disconnect()
  plpObserver.disconnect()

  domObserver.observe(body, { childList: true, subtree: true })
}

initObservers()

