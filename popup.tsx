import React from "react"

import { useFilterSelection } from "~utils/useCheckboxStorage"
import { useCurrentUrl } from "~utils/useCurrentUrl"

import "./popup.css"

function IndexPopup() {
  const { data } = useCurrentUrl()

  const { checkboxes, toggleCheckbox } = useFilterSelection()

  return (
    <div className="popup">
      <h2 className="popup-title">Alérgenos</h2>
      <div className="checkbox-container">
        <label className="checkbox-item">
          <input
            type="checkbox"
            name="no_lactose"
            checked={!!checkboxes["no_lactose"]}
            onChange={() => toggleCheckbox("no_lactose")}
          />
          Sin lactosa
        </label>
        <label className="checkbox-item">
          <input
            type="checkbox"
            name="no_gluten"
            checked={!!checkboxes["no_gluten"]}
            onChange={() => toggleCheckbox("no_gluten")}
          />
          Sin gluten
        </label>
        <label className="checkbox-item">
          <input
            type="checkbox"
            name="no_egg"
            checked={!!checkboxes["no_egg"]}
            onChange={() => toggleCheckbox("no_egg")}
          />
          Sin huevo
        </label>
        <label className="checkbox-item">
          <input
            type="checkbox"
            name="no_peanuts"
            checked={!!checkboxes["no_peanuts"]}
            onChange={() => toggleCheckbox("no_peanuts")}
          />
          Sin cacahuetes
        </label>
        <label className="checkbox-item">
          <input
            type="checkbox"
            name="no_soja"
            checked={!!checkboxes["no_soja"]}
            onChange={() => toggleCheckbox("no_soja")}
          />
          Sin soja
        </label>{" "}
        <label className="checkbox-item">
          <input
            type="checkbox"
            name="no_fish"
            checked={!!checkboxes["no_fish"]}
            onChange={() => toggleCheckbox("no_fish")}
          />
          Sin pescado
        </label>{" "}
        <label className="checkbox-item">
          <input
            type="checkbox"
            name="no_seafood"
            checked={!!checkboxes["no_seafood"]}
            onChange={() => toggleCheckbox("no_seafood")}
          />
          Sin marisco
        </label>
      </div>
      <h2 className="popup-title">Dieta</h2>
      <div className="checkbox-container">
        <label className="checkbox-item">
          <input
            type="checkbox"
            name="vegan"
            checked={!!checkboxes["vegan"]}
            onChange={() => toggleCheckbox("vegan")}
          />
          Vegano
        </label>
        <label className="checkbox-item">
          <input
            type="checkbox"
            name="vegetarian"
            checked={!!checkboxes["vegetarian"]}
            onChange={() => toggleCheckbox("vegetarian")}
          />
          Vegetariano
        </label>
        <label className="checkbox-item">
          <input
            type="checkbox"
            name="keto"
            checked={!!checkboxes["keto"]}
            onChange={() => toggleCheckbox("keto")}
          />
          Keto
        </label>
      </div>
    </div>
  )
}

export default IndexPopup
