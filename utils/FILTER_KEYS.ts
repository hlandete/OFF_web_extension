const FILTER_KEYS: Record<string, { [key: string]: string[] }> = {
    no_lactose: {
      allergens: ["en:lactose", "en:milk"],
      categories: ["en:lactose-free-milk"],
      labels: ["en:no-lactose"],
      trueKeywords: ["no-lactose"],
      falseKeywords: ['lactose']
  
    },
    no_gluten: {
      allergens: ["en:gluten"],
      categories: ["en:glute-free"],
      labels: ["en:no-gluten"],
      trueKeywords: ["no-gluten"],
      falseKeywords: ['gluten']
      
  
    },
    no_egg: {
      allergens: ["en:egg"],
      categories: ["en:egg-free"],
      labels: ["en:no-egg"],
      trueKeywords: ["no-egg"],
      falseKeywords: ['egg']
  
    },
    no_peanuts: {
      allergens: ["en:peanuts"],
      categories: ["en:peanut-free"],
      labels: ["en:no-peanuts"],
      trueKeywords: ["no-peanuts"],
      falseKeywords: ['peanuts']
  
    },
    no_soy: {
      allergens: ["en:soy"],
      categories: ["en:soy-free"],
      labels: ["en:no-soy"],
      trueKeywords: ["no-soy"],
      falseKeywords: ['soy']
    },
    no_fish: {
      allergens: ["en:fish"],
      categories: ["en:fish-free"],
      labels: ["en:no-fish"],
      trueKeywords: ["no-fish"],
      falseKeywords: ['fish']
  
    },
    no_seafood: {
      allergens: ["en:seafood"],
      categories: ["en:seafood-free"],
      labels: ["en:no-seafood"],
      trueKeywords: ["no-seafood"],
      falseKeywords: ['seafood']
  
    }
  }
  