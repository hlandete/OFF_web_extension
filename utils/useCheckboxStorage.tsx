import { useEffect, useState } from "react"

type CheckboxGroupState = {
  [key: string]: boolean
}

const STORAGE_KEY = "checkboxGroup"

export const useCheckboxStorage = () => {
  const [checkboxes, setCheckboxes] = useState<CheckboxGroupState>({})

  // Recuperar el estado de los checkboxes desde chrome.storage.local al montar el componente
  useEffect(() => {
    chrome.storage.local.get([STORAGE_KEY], (result) => {
      if (result[STORAGE_KEY]) {
        setCheckboxes(result[STORAGE_KEY])
      }
    })
  }, [])

  // Función para actualizar el estado de un checkbox
  const updateCheckbox = (key: string, value: boolean) => {
    const newState = { ...checkboxes, [key]: value }
    setCheckboxes(newState)
    // Guardar el nuevo estado en chrome.storage.local
    chrome.storage.local.set({ [STORAGE_KEY]: newState })
  }

  // Función para alternar el estado de un checkbox
  const toggleCheckbox = (key: string) => {
    updateCheckbox(key, !checkboxes[key])
  }

  return {
    checkboxes,
    updateCheckbox,
    toggleCheckbox
  }
}
