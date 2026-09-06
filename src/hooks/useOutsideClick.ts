import { useEffect, useRef } from "react"

export function useOutsideClick<T extends HTMLElement>(
  ref: React.RefObject<T | null>,
  onOutside: () => void | Promise<void>
) {
  const callbackRef = useRef(onOutside)

  useEffect(() => {
    callbackRef.current = onOutside
  }, [onOutside])

  useEffect(() => {
    const startPointRef = {
      x: 0,
      y: 0
    }

    const handlePointerDown = (event: PointerEvent) => {
      startPointRef.x = event.clientX
      startPointRef.y = event.clientY
    }

    const handlePointerUp = (event: PointerEvent) => {
      const target = event.target
      
      if (!(target instanceof Node)) return
      if (!ref.current) return

      const distanceX = Math.abs(
        event.clientX - startPointRef.x
      )

      const distanceY = Math.abs(
        event.clientY - startPointRef.y
      )

      const moveDistance = Math.max(
        distanceX,
        distanceY
      )

      if (moveDistance > 10) return

      if (!ref.current.contains(target)) {
        callbackRef.current()
      }
     }

    document.addEventListener(
      "pointerdown",
      handlePointerDown
    )

    document.addEventListener(
      "pointerup",
      handlePointerUp
    )

    return () => {
      document.removeEventListener(
        "pointerdown",
        handlePointerDown
      )

      document.removeEventListener(
        "pointerup",
        handlePointerUp
      )
    }
  }, [ref])
}
