import { useState, useRef, useCallback } from 'react'

interface DragState {
  isDragging: boolean
  draggedCard: any | null
  dragStartPosition: { x: number; y: number } | null
  currentPosition: { x: number; y: number } | null
}

interface UseDragAndDropOptions {
  onDragStart?: (card: any, event: React.DragEvent) => void
  onDragEnd?: (card: any, event: React.DragEvent) => void
  onDrop?: (card: any, target: any, event: React.DragEvent) => void
  onDragOver?: (event: React.DragEvent) => void
  onDragEnter?: (event: React.DragEvent) => void
  onDragLeave?: (event: React.DragEvent) => void
}

export function useDragAndDrop(options: UseDragAndDropOptions = {}) {
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    draggedCard: null,
    dragStartPosition: null,
    currentPosition: null
  })

  const dragRef = useRef<HTMLDivElement>(null)

  const handleDragStart = useCallback((card: any, event: React.DragEvent) => {
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('application/json', JSON.stringify(card))
    
    // Crear imagen fantasma personalizada
    const ghostElement = event.currentTarget.cloneNode(true) as HTMLElement
    ghostElement.style.opacity = '0.5'
    ghostElement.style.transform = 'rotate(5deg)'
    ghostElement.style.pointerEvents = 'none'
    document.body.appendChild(ghostElement)
    event.dataTransfer.setDragImage(ghostElement, 0, 0)
    
    // Remover imagen fantasma después de un momento
    setTimeout(() => {
      if (document.body.contains(ghostElement)) {
        document.body.removeChild(ghostElement)
      }
    }, 0)

    setDragState({
      isDragging: true,
      draggedCard: card,
      dragStartPosition: { x: event.clientX, y: event.clientY },
      currentPosition: { x: event.clientX, y: event.clientY }
    })

    options.onDragStart?.(card, event)
  }, [options])

  const handleDragEnd = useCallback((card: any, event: React.DragEvent) => {
    setDragState({
      isDragging: false,
      draggedCard: null,
      dragStartPosition: null,
      currentPosition: null
    })

    options.onDragEnd?.(card, event)
  }, [options])

  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'
    
    setDragState(prev => ({
      ...prev,
      currentPosition: { x: event.clientX, y: event.clientY }
    }))

    options.onDragOver?.(event)
  }, [options])

  const handleDragEnter = useCallback((event: React.DragEvent) => {
    event.preventDefault()
    options.onDragEnter?.(event)
  }, [options])

  const handleDragLeave = useCallback((event: React.DragEvent) => {
    event.preventDefault()
    options.onDragLeave?.(event)
  }, [options])

  const handleDrop = useCallback((target: any, event: React.DragEvent) => {
    event.preventDefault()
    
    try {
      const cardData = event.dataTransfer.getData('application/json')
      const card = JSON.parse(cardData)
      
      setDragState({
        isDragging: false,
        draggedCard: null,
        dragStartPosition: null,
        currentPosition: null
      })

      options.onDrop?.(card, target, event)
    } catch (error) {
      console.error('Error parsing dropped card data:', error)
    }
  }, [options])

  return {
    dragState,
    dragRef,
    handleDragStart,
    handleDragEnd,
    handleDragOver,
    handleDragEnter,
    handleDragLeave,
    handleDrop
  }
}
