chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  // Solo ejecutamos el script cuando la página ha terminado de cargar
  if (changeInfo.status === "complete" && tab.url) {
    const url = new URL(tab.url)

    // Lógica para seleccionar qué script ejecutar según el dominio
    if (url.hostname.includes("google.com")) {
      chrome.scripting.executeScript({
        target: { tabId },
        files: ["contents/google.ts"]
      })
    } else if (url.hostname.includes("youtube.com")) {
      chrome.scripting.executeScript({
        target: { tabId },
        files: ["contents/youtube.ts"]
      })
    } else {
      chrome.scripting.executeScript({
        target: { tabId },
        files: ["contents/default.ts"]
      })
    }
  }
})

chrome.runtime.onInstalled.addListener(() => {
  console.log("Service worker instalado")
})

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  console.log("Tab actualizada:", tab)
  if (changeInfo.status === "complete" && tab.url) {
    console.log("URL de la pestaña:", tab.url)
    chrome.scripting.executeScript({
      target: { tabId },
      files: ["content-script.js"]
    })
  }
})
