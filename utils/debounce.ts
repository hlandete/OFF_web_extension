// Función de debouncing que también retorna una promesa
export function debounce<T extends (...args: any[]) => void>(
    func: T,
    delay: number
  ): T {
    let timer: NodeJS.Timeout
    let lastCall: number = Date.now()
    return ((...args: any[]) => {
      clearTimeout(timer)
      const now = Date.now()
      const timeRemaining = delay - (now - lastCall)
  
      // Llamar a la función después del tiempo de espera
      if (timeRemaining <= 0) {
        lastCall = now
        func(...args)
      } else {
        timer = setTimeout(() => {
          lastCall = Date.now()
          func(...args)
        }, timeRemaining)
      }
    }) as T
  }