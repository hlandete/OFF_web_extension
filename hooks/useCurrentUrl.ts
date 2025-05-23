import { useEffect, useState } from "react"

export const useCurrentUrl = () => {
  const [data, setData] = useState<string | null>(null)
  const [isFetching, setIsFetching] = useState(true)
  useEffect(() => {
    const getCurrentUrl = async () => {
      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true
      })
      setData(tab.url)
      setIsFetching(false)
    }
    getCurrentUrl()
  }, [data])

  return { data, isFetching }
}
