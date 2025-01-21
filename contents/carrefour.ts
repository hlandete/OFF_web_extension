import type { PlasmoCSConfig } from "plasmo"

import { filterLactoseFreeProducts } from "../utils/api"

export const config: PlasmoCSConfig = {
  matches: ["https://www.carrefour.es/*"],
  all_frames: true
}
console.log("Carrefour content script loaded")

// Función para extraer los enlaces de los productos
const extractProductEans = async () => {
  const productLinks = Array.from(
    document.querySelectorAll<HTMLAnchorElement>(
      "section.ebx-grid .ebx-result__container-click > a.ebx-result__figure-link"
    )
  ).map((a) => a.href)

  // Obtener los EANs haciendo scraping desde los enlaces
  const eanList = await Promise.all(
    productLinks.map(async (link) => {
      try {
        const response = await fetch(link)
        const html = await response.text()

        const parser = new DOMParser()
        const doc = parser.parseFromString(html, "text/html")

        const scriptTag = doc.querySelector<HTMLScriptElement>(
          "script[type='application/ld+json']"
        )
        if (scriptTag) {
          const jsonData = JSON.parse(scriptTag.innerText)
          return jsonData.gtin13 || null
        }
      } catch (error) {
        console.error("Error al obtener el EAN del producto:", error)
        return null
      }
    })
  )

  return eanList.filter((ean) => ean !== null) as string[] // Filtrar valores nulos
}

// Función principal
const processProducts = async () => {
  const eanList = await extractProductEans()
  console.log("EANs extraídos:", eanList)

  // const lactoseFreeProducts = await filterLactoseFreeProducts(eanList)
  // console.log("Productos sin lactosa:", lactoseFreeProducts)

  // // Opcional: Mostrar resultados en el DOM
  // lactoseFreeProducts.forEach((product) => {
  //   console.log(`Producto: ${product.name}, Marca: ${product.brand}`)
  // })
}

// Observer para monitorizar cambios en el DOM
const observer = new MutationObserver(() => {
  const productContainer = document.querySelector("section.ebx-grid")

  if (productContainer) {
    observer.disconnect() // Detener el observer para evitar duplicados
    processProducts() // Procesar productos una vez que se cargue la sección
  }
})

// Iniciar el observer
observer.observe(document.body, { childList: true, subtree: true })
