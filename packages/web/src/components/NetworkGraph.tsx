'use client'

import { useEffect, useRef, useState, useCallback, useMemo } from 'react'
import { Service, ServiceConnection } from '@/types'
import { fetchMetricsConnections } from '@/lib/client-api'

interface NetworkGraphProps {
  services: Service[]
}

interface Node {
  id: string
  x: number
  y: number
  label: string
  service: Service
  vx: number
  vy: number
}

export function NetworkGraph({ services }: NetworkGraphProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const offscreenCanvasRef = useRef<HTMLCanvasElement | null>(null)
  const [nodes, setNodes] = useState<Node[]>([])
  const [connections, setConnections] = useState<ServiceConnection[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [draggedNode, setDraggedNode] = useState<Node | null>(null)
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [selectedNode, setSelectedNode] = useState<Node | null>(null)
  const [canvasSize, setCanvasSize] = useState({ width: 1200, height: 700 })
  const animationRef = useRef<number>(0)
  const animationTimeRef = useRef<number>(0)
  const lastFrameTimeRef = useRef<number>(0)
  const resizeTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const needsStaticRedrawRef = useRef<boolean>(true)

  // Fetch actual service connections
  useEffect(() => {
    const loadConnections = async () => {
      try {
        const data = await fetchMetricsConnections()
        setConnections(data)
      } catch (error) {
        console.error('Failed to fetch connections:', error)
        setConnections([])
      }
    }

    loadConnections().catch(console.error)
    // Refresh connections every 30 seconds
    const interval = setInterval(() => {
      loadConnections().catch(console.error)
    }, 30000)
    return () => clearInterval(interval)
  }, [])

  // Check if there are active connections (for conditional animation)
  const hasActiveConnections = useMemo(() => {
    return connections.length > 0
  }, [connections])

  // Responsive canvas sizing with debounce
  useEffect(() => {
    const updateCanvasSize = () => {
      if (containerRef.current) {
        const width = containerRef.current.offsetWidth
        const height = Math.min(Math.max(width * 0.6, 400), 700)
        setCanvasSize({ width, height })
        needsStaticRedrawRef.current = true
      }
    }

    const debouncedResize = () => {
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current)
      }
      resizeTimeoutRef.current = setTimeout(updateCanvasSize, 150)
    }

    updateCanvasSize()
    window.addEventListener('resize', debouncedResize)
    return () => {
      window.removeEventListener('resize', debouncedResize)
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current)
      }
    }
  }, [])

  useEffect(() => {
    // Initialize nodes with positions based on canvas size
    const centerX = canvasSize.width / 2
    const centerY = canvasSize.height / 2
    const radius = Math.min(centerX, centerY) * 0.6

    const initialNodes: Node[] = services.map((service, index) => {
      const angle = (index / services.length) * 2 * Math.PI
      return {
        id: service.id,
        x: centerX + Math.cos(angle) * radius,
        y: centerY + Math.sin(angle) * radius,
        label: service.name,
        service,
        vx: 0,
        vy: 0,
      }
    })
    setNodes(initialNodes)
    needsStaticRedrawRef.current = true
  }, [services, canvasSize])

  // Drawing logic
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Create offscreen canvas for static elements
    if (!offscreenCanvasRef.current) {
      offscreenCanvasRef.current = document.createElement('canvas')
    }
    const offscreenCanvas = offscreenCanvasRef.current
    offscreenCanvas.width = canvas.width
    offscreenCanvas.height = canvas.height
    const offscreenCtx = offscreenCanvas.getContext('2d')
    if (!offscreenCtx) return

    // Draw static elements (nodes and connection lines) to offscreen canvas
    const drawStaticElements = () => {
      offscreenCtx.fillStyle = '#000000'
      offscreenCtx.fillRect(0, 0, offscreenCanvas.width, offscreenCanvas.height)

      offscreenCtx.save()
      offscreenCtx.translate(pan.x, pan.y)
      offscreenCtx.scale(zoom, zoom)

      // Draw connection lines only for actual service-to-service calls
      connections.forEach((connection) => {
        const sourceNode = nodes.find(n => n.service.name === connection.source_service)
        const targetNode = nodes.find(n => n.service.name === connection.target_service)

        if (sourceNode && targetNode) {
          offscreenCtx.strokeStyle = 'rgba(255, 255, 255, 0.3)'
          offscreenCtx.lineWidth = 2
          offscreenCtx.beginPath()
          offscreenCtx.moveTo(sourceNode.x, sourceNode.y)
          offscreenCtx.lineTo(targetNode.x, targetNode.y)
          offscreenCtx.stroke()

          // Directional arrow
          const dx = targetNode.x - sourceNode.x
          const dy = targetNode.y - sourceNode.y
          const midX = (sourceNode.x + targetNode.x) / 2
          const midY = (sourceNode.y + targetNode.y) / 2
          const angle = Math.atan2(dy, dx)

          offscreenCtx.save()
          offscreenCtx.translate(midX, midY)
          offscreenCtx.rotate(angle)
          offscreenCtx.fillStyle = 'rgba(255, 255, 255, 0.5)'
          offscreenCtx.beginPath()
          offscreenCtx.moveTo(8, 0)
          offscreenCtx.lineTo(-4, -4)
          offscreenCtx.lineTo(-4, 4)
          offscreenCtx.closePath()
          offscreenCtx.fill()
          offscreenCtx.restore()
        }
      })

      // Draw nodes
      nodes.forEach((node) => {
        const isSelected = selectedNode?.id === node.id
        const isActive = String(node.service.status) === 'active'

        const boxSize = isSelected ? 70 : 60
        offscreenCtx.strokeStyle = isSelected ? '#ffffff' : isActive ? '#525252' : '#262626'
        offscreenCtx.lineWidth = isSelected ? 3 : 2
        offscreenCtx.strokeRect(
          node.x - boxSize / 2,
          node.y - boxSize / 2,
          boxSize,
          boxSize
        )

        const innerSize = boxSize - 16
        offscreenCtx.strokeStyle = isSelected ? '#a3a3a3' : '#404040'
        offscreenCtx.lineWidth = 1
        offscreenCtx.strokeRect(
          node.x - innerSize / 2,
          node.y - innerSize / 2,
          innerSize,
          innerSize
        )

        offscreenCtx.fillStyle = isSelected ? '#ffffff' : isActive ? '#737373' : '#404040'
        offscreenCtx.fillRect(node.x - 3, node.y - 3, 6, 6)

        offscreenCtx.font = '12px "JetBrains Mono", monospace'
        offscreenCtx.fillStyle = isSelected ? '#ffffff' : isActive ? '#e5e5e5' : '#737373'
        offscreenCtx.textAlign = 'center'
        offscreenCtx.fillText(node.label, node.x, node.y + boxSize / 2 + 20)

        offscreenCtx.font = '9px "JetBrains Mono", monospace'
        offscreenCtx.fillStyle = '#737373'
        offscreenCtx.fillText(node.service.framework, node.x, node.y + boxSize / 2 + 35)
      })

      offscreenCtx.restore()
      needsStaticRedrawRef.current = false
    }

    // Throttled animation at ~30fps (33ms per frame)
    const FPS_THROTTLE = 33

    const draw = (timestamp: number) => {
      // Throttle to 30fps
      if (timestamp - lastFrameTimeRef.current < FPS_THROTTLE) {
        animationRef.current = requestAnimationFrame(draw)
        return
      }
      lastFrameTimeRef.current = timestamp
      animationTimeRef.current = timestamp

      // Redraw static elements if needed
      if (needsStaticRedrawRef.current) {
        drawStaticElements()
      }

      // Copy static elements to main canvas
      ctx.drawImage(offscreenCanvas, 0, 0)

      // Only draw animated dots if there are active connections
      if (hasActiveConnections) {
        ctx.save()
        ctx.translate(pan.x, pan.y)
        ctx.scale(zoom, zoom)

        // Draw animated dots on actual service connections
        connections.forEach((connection) => {
          const sourceNode = nodes.find(n => n.service.name === connection.source_service)
          const targetNode = nodes.find(n => n.service.name === connection.target_service)

          if (sourceNode && targetNode) {
            const dx = targetNode.x - sourceNode.x
            const dy = targetNode.y - sourceNode.y
            const numDots = 3

            for (let j = 0; j < numDots; j++) {
              const offset = (j / numDots) + (timestamp / 2000) % 1
              const progress = offset % 1
              const dotX = sourceNode.x + dx * progress
              const dotY = sourceNode.y + dy * progress

              ctx.fillStyle = 'rgba(255, 255, 255, 0.9)'
              ctx.beginPath()
              ctx.arc(dotX, dotY, 3, 0, Math.PI * 2)
              ctx.fill()

              ctx.fillStyle = 'rgba(255, 255, 255, 0.3)'
              ctx.beginPath()
              ctx.arc(dotX, dotY, 6, 0, Math.PI * 2)
              ctx.fill()
            }
          }
        })

        ctx.restore()
      }

      // Continue animation if needed (active connections or dragging)
      if (hasActiveConnections || isDragging) {
        animationRef.current = requestAnimationFrame(draw)
      }
    }

    // Mark static elements for redraw
    needsStaticRedrawRef.current = true

    // Start animation
    animationRef.current = requestAnimationFrame(draw)

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [nodes, connections, zoom, pan, selectedNode, hasActiveConnections, isDragging])

  const getEventCoords = useCallback((e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return { x: 0, y: 0 }

    const rect = canvas.getBoundingClientRect()
    let clientX: number, clientY: number

    if ('touches' in e && e.touches.length > 0) {
      clientX = e.touches[0].clientX
      clientY = e.touches[0].clientY
    } else if ('clientX' in e) {
      clientX = e.clientX
      clientY = e.clientY
    } else {
      return { x: 0, y: 0 }
    }

    const x = (clientX - rect.left - pan.x) / zoom
    const y = (clientY - rect.top - pan.y) / zoom
    return { x, y }
  }, [pan.x, pan.y, zoom])

  const findNodeAtPosition = useCallback((x: number, y: number) => {
    return nodes.find((node) => {
      const boxSize = 60
      return (
        x >= node.x - boxSize / 2 &&
        x <= node.x + boxSize / 2 &&
        y >= node.y - boxSize / 2 &&
        y <= node.y + boxSize / 2
      )
    })
  }, [nodes])

  const handleStart = useCallback((e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const { x, y } = getEventCoords(e)
    const clickedNode = findNodeAtPosition(x, y)

    if (clickedNode) {
      setDraggedNode(clickedNode)
      setSelectedNode(clickedNode)
      setIsDragging(true)
      needsStaticRedrawRef.current = true
    } else {
      setSelectedNode(null)
      needsStaticRedrawRef.current = true
    }
  }, [getEventCoords, findNodeAtPosition])

  const handleMove = useCallback((e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDragging || !draggedNode) return
    e.preventDefault() // Prevent scrolling on touch

    const { x, y } = getEventCoords(e)

    setNodes((prevNodes) =>
      prevNodes.map((node) =>
        node.id === draggedNode.id ? { ...node, x, y } : node
      )
    )
    needsStaticRedrawRef.current = true
  }, [isDragging, draggedNode, getEventCoords])

  const handleEnd = useCallback(() => {
    setIsDragging(false)
    setDraggedNode(null)
  }, [])

  const handleWheel = useCallback((e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault()
    const delta = e.deltaY > 0 ? 0.9 : 1.1
    setZoom((prev) => Math.min(Math.max(prev * delta, 0.5), 3))
    needsStaticRedrawRef.current = true
  }, [])

  const handleZoomIn = useCallback(() => {
    setZoom((prev) => Math.min(prev * 1.2, 3))
    needsStaticRedrawRef.current = true
  }, [])

  const handleZoomOut = useCallback(() => {
    setZoom((prev) => Math.max(prev * 0.8, 0.5))
    needsStaticRedrawRef.current = true
  }, [])

  const handleReset = useCallback(() => {
    setZoom(1)
    setPan({ x: 0, y: 0 })
    needsStaticRedrawRef.current = true
  }, [])

  return (
    <div className="relative" ref={containerRef}>
      <canvas
        ref={canvasRef}
        width={canvasSize.width}
        height={canvasSize.height}
        className="w-full border border-gray-800 bg-black cursor-move touch-none"
        onMouseDown={handleStart}
        onMouseMove={handleMove}
        onMouseUp={handleEnd}
        onMouseLeave={handleEnd}
        onTouchStart={handleStart}
        onTouchMove={handleMove}
        onTouchEnd={handleEnd}
        onWheel={handleWheel}
      />

      {/* Controls */}
      <div className="absolute top-2 right-2 md:top-4 md:right-4 flex flex-col gap-2">
        <button
          onClick={handleZoomIn}
          className="px-2 py-1 md:px-3 md:py-2 border border-gray-700 bg-black/80 backdrop-blur-sm hover:border-gray-600 text-white font-mono text-sm transition-colors"
          title="Zoom In"
        >
          +
        </button>
        <button
          onClick={handleZoomOut}
          className="px-2 py-1 md:px-3 md:py-2 border border-gray-700 bg-black/80 backdrop-blur-sm hover:border-gray-600 text-white font-mono text-sm transition-colors"
          title="Zoom Out"
        >
          -
        </button>
        <button
          onClick={handleReset}
          className="px-2 py-1 md:px-3 md:py-2 border border-gray-700 bg-black/80 backdrop-blur-sm hover:border-gray-600 text-white font-mono text-xs transition-colors"
          title="Reset View"
        >
          Reset
        </button>
      </div>

      {/* Selected Node Info */}
      {selectedNode && (
        <div className="absolute bottom-2 left-2 right-2 md:bottom-4 md:left-4 md:right-4 border border-gray-800 bg-black/90 backdrop-blur-sm p-3 md:p-4">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
            <div className="flex-1 min-w-0">
              <h3 className="text-base md:text-lg font-semibold text-white mb-2 truncate">
                {selectedNode.service.name}
              </h3>
              <div className="flex gap-2 flex-wrap">
                <span className="px-2 py-1 bg-gray-900 border border-gray-800 text-xs font-mono text-gray-300">
                  {selectedNode.service.framework}
                </span>
                <span className="px-2 py-1 bg-gray-900 border border-gray-800 text-xs font-mono text-gray-300">
                  {selectedNode.service.language}
                </span>
                {selectedNode.service.environment && (
                  <span className="px-2 py-1 bg-gray-900 border border-gray-800 text-xs font-mono text-gray-300">
                    {selectedNode.service.environment}
                  </span>
                )}
              </div>
            </div>
            <a
              href={`/dashboard/services/${selectedNode.service.id}`}
              className="px-3 py-2 md:px-4 border border-gray-700 hover:border-gray-600 text-white hover:bg-gray-900 transition-colors font-mono text-xs uppercase tracking-wider text-center whitespace-nowrap"
            >
              View Details
            </a>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="mt-4 flex flex-wrap gap-3 md:gap-6 text-xs font-mono text-gray-500 uppercase tracking-wider">
        <span className="hidden md:inline">Click + Drag: Move Nodes</span>
        <span className="md:hidden">Touch + Drag: Move</span>
        <span className="hidden md:inline">Scroll: Zoom</span>
        <span className="md:hidden">Pinch: Zoom</span>
        <span>Click Node: View Info</span>
      </div>
    </div>
  )
}
