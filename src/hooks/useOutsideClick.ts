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
    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target

      if (!(target instanceof Node)) return
      if (!ref.current) return

      if (!ref.current.contains(target)) {
        callbackRef.current()
      }
    }

    document.addEventListener(
      "pointerdown",
      handlePointerDown
    )

    return () => {
      document.removeEventListener(
        "pointerdown",
        handlePointerDown
      )
    }
  }, [ref])
}
