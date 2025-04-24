import { useEffect, useState } from "react"

type FiltersState = { [key: string]: boolean }

export const useFilters = (names: string[], storageKey: string) => {
  const [checkboxes, setCheckboxes] = useState<FiltersState>(() => {
    const saved = localStorage.getItem(storageKey)
    return saved
      ? JSON.parse(saved)
      : names.reduce((acc, name) => ({ ...acc, [name]: false }), {})
  })

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(checkboxes))
  }, [checkboxes, storageKey])

  const handleCheckboxChange = (name: string) => {
    setCheckboxes((prev) => ({
      ...prev,
      [name]: !prev[name]
    }))
  }

  return { checkboxes, handleCheckboxChange }
}
