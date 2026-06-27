import { onBeforeUnmount, ref, type Ref } from 'vue'

interface UseVerticalResizeOptions {
  initialHeight: number
  minHeight: number
  maxHeight: number | (() => number)
  containerRef: Ref<HTMLElement | null>
}

export function useVerticalResize(options: UseVerticalResizeOptions) {
  const panelHeight = ref(options.initialHeight)
  const isResizing = ref(false)

  function resolveMaxHeight(): number {
    return typeof options.maxHeight === 'function' ? options.maxHeight() : options.maxHeight
  }

  function clampHeight(nextHeight: number): number {
    return Math.min(resolveMaxHeight(), Math.max(options.minHeight, nextHeight))
  }

  function resolveHeightFromPointer(clientY: number): number {
    const container = options.containerRef.value
    if (!container) {
      return panelHeight.value
    }

    const containerBottom = container.getBoundingClientRect().bottom
    return clampHeight(containerBottom - clientY)
  }

  function startResize(event: MouseEvent): void {
    event.preventDefault()
    isResizing.value = true
    panelHeight.value = resolveHeightFromPointer(event.clientY)

    document.body.style.cursor = 'row-resize'
    document.body.style.userSelect = 'none'
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', stopResize)
  }

  function handleMouseMove(event: MouseEvent): void {
    if (!isResizing.value) {
      return
    }

    panelHeight.value = resolveHeightFromPointer(event.clientY)
  }

  function stopResize(): void {
    isResizing.value = false
    document.body.style.cursor = ''
    document.body.style.userSelect = ''
    window.removeEventListener('mousemove', handleMouseMove)
    window.removeEventListener('mouseup', stopResize)
  }

  function syncBounds(): void {
    panelHeight.value = clampHeight(panelHeight.value)
  }

  onBeforeUnmount(() => {
    stopResize()
  })

  return {
    panelHeight,
    isResizing,
    startResize,
    syncBounds,
  }
}
