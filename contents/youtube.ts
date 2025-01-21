import type { PlasmoCSConfig } from "plasmo"

export const config: PlasmoCSConfig = {
  matches: ["https://www.youtube.com/*"],
  all_frames: true
}
console.log("Script de youtube")

const videoListSelector = "div#contents.style-scope.ytd-rich-grid-renderer"
const videoTagName = "YTD-RICH-ITEM-RENDERER"

function waitForElm(selector): Promise<HTMLElement> {
  return new Promise((resolve) => {
    if (document.querySelector(selector)) {
      return resolve(document.querySelector(selector))
    }

    const observer = new MutationObserver((mutations) => {
      if (document.querySelector(selector)) {
        observer.disconnect()
        resolve(document.querySelector(selector))
      }
    })

    // If you get "parameter 1 is not of type 'Node'" error, see https://stackoverflow.com/a/77855838/492336
    observer.observe(document.body, {
      childList: true,
      subtree: true
    })
  })
}

const getVideoLink = (el: Element) => {
  const anchor = el.querySelector("a#thumbnail") as HTMLElement
  console.log(anchor)
  if (anchor) {
    return "www.youtube.com" + anchor.getAttribute("href")
  }
}
const editVideo = (el: Element) => {
  console.log(getVideoLink(el))
  const metaData = el.querySelector("#metadata-line")
  if (metaData) {
    metaData.append(" · 100 likes")
  }
  if (el.tagName === videoTagName) {
    ;(el as HTMLElement).style.border = "3px solid red"
  }
}

const videos = document.getElementsByTagName(videoTagName)
for (let video of videos) {
  editVideo(video)
}

waitForElm(videoListSelector).then((elm) => {
  const videoList = document.querySelector(videoListSelector)

  const observerOptions = {
    childList: true,
    attributes: false,
    // Omit (or set to false) to observe only changes to the parent node
    subtree: false
  }

  function callback(mutationList, observer) {
    mutationList.forEach((mutation) => {
      if (mutation.type === "childList" && mutation.addedNodes.length) {
        mutation.addedNodes.forEach((el) => {
          editVideo(el)
        })
      }
    })
  }

  const observer = new MutationObserver(callback)
  observer.observe(videoList, observerOptions)
})

const getVideoData = () => {}
