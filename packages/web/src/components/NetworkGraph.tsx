'use client'

import { useEffect, useRef, useState } from 'react'
import { Service } from '@/types'

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
  const [nodes, setNodes] = useState<Node[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [draggedNode, setDraggedNode] = useState<Node | null>(null)
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [selectedNode, setSelectedNode] = useState<Node | null>(null)
  const animationRef = useRef<number>(0)
  const animationTimeRef = useRef<number>(0)

  useEffect(() => {
    // Initialize nodes with random positions
    const initialNodes: Node[] = services.map((service, index) => {
      const angle = (index / services.length) * 2 * Math.PI
      const radius = 250
      return {
        id: service.id,
        x: 400 + Math.cos(angle) * radius,
        y: 300 + Math.sin(angle) * radius,
        label: service.name,
        service,
        vx: 0,
        vy: 0,
      }
    })
    setNodes(initialNodes)
  }, [services])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const draw = (timestamp: number) => {
      // Update animation time
      animationTimeRef.current = timestamp

      // Clear canvas
      ctx.fillStyle = '#000000'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      ctx.save()
      ctx.translate(pan.x, pan.y)
      ctx.scale(zoom, zoom)

      // Draw connections with animation
      nodes.forEach((node1, i) => {
        nodes.slice(i + 1).forEach((node2) => {
          // Draw connection if both services are active
          const isNode1Active = String(node1.service.status) === 'active'
          const isNode2Active = String(node2.service.status) === 'active'
          if (isNode1Active && isNode2Active) {
            // Brighter connection line
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)'
            ctx.lineWidth = 2
            ctx.beginPath()
            ctx.moveTo(node1.x, node1.y)
            ctx.lineTo(node2.x, node2.y)
            ctx.stroke()

            // Draw animated directional dots
            const dx = node2.x - node1.x
            const dy = node2.y - node1.y
            const numDots = 3

            for (let j = 0; j < numDots; j++) {
              // Stagger dots along the line
              const offset = (j / numDots) + (timestamp / 2000) % 1
              const progress = offset % 1

              const dotX = node1.x + dx * progress
              const dotY = node1.y + dy * progress

              // Draw glowing dot
              ctx.fillStyle = 'rgba(255, 255, 255, 0.9)'
              ctx.beginPath()
              ctx.arc(dotX, dotY, 3, 0, Math.PI * 2)
              ctx.fill()

              // Glow effect
              ctx.fillStyle = 'rgba(255, 255, 255, 0.3)'
              ctx.beginPath()
              ctx.arc(dotX, dotY, 6, 0, Math.PI * 2)
              ctx.fill()
            }

            // Draw directional arrow at midpoint
            const midX = (node1.x + node2.x) / 2
            const midY = (node1.y + node2.y) / 2
            const angle = Math.atan2(dy, dx)

            ctx.save()
            ctx.translate(midX, midY)
            ctx.rotate(angle)
            ctx.fillStyle = 'rgba(255, 255, 255, 0.5)'
            ctx.beginPath()
            ctx.moveTo(8, 0)
            ctx.lineTo(-4, -4)
            ctx.lineTo(-4, 4)
            ctx.closePath()
            ctx.fill()
            ctx.restore()
          }
        })
      })

      // Draw nodes
      nodes.forEach((node) => {
        const isSelected = selectedNode?.id === node.id
        const isActive = String(node.service.status) === 'active'

        // Node box
        const boxSize = isSelected ? 70 : 60
        ctx.strokeStyle = isSelected ? '#ffffff' : isActive ? '#525252' : '#262626'
        ctx.lineWidth = isSelected ? 3 : 2
        ctx.strokeRect(
          node.x - boxSize / 2,
          node.y - boxSize / 2,
          boxSize,
          boxSize
        )

        // Inner box
        const innerSize = boxSize - 16
        ctx.strokeStyle = isSelected ? '#a3a3a3' : '#404040'
        ctx.lineWidth = 1
        ctx.strokeRect(
          node.x - innerSize / 2,
          node.y - innerSize / 2,
          innerSize,
          innerSize
        )

        // Center dot
        ctx.fillStyle = isSelected ? '#ffffff' : isActive ? '#737373' : '#404040'
        ctx.fillRect(node.x - 3, node.y - 3, 6, 6)

        // Label
        ctx.font = '12px "JetBrains Mono", monospace'
        ctx.fillStyle = isSelected ? '#ffffff' : isActive ? '#e5e5e5' : '#737373'
        ctx.textAlign = 'center'
        ctx.fillText(node.label, node.x, node.y + boxSize / 2 + 20)

        // Status indicator
        ctx.font = '9px "JetBrains Mono", monospace'
        ctx.fillStyle = '#737373'
        ctx.fillText(node.service.framework, node.x, node.y + boxSize / 2 + 35)
      })

      ctx.restore()

      // Request next frame
      animationRef.current = requestAnimationFrame(draw)
    }

    // Start animation loop
    animationRef.current = requestAnimationFrame(draw)

    // Cleanup
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [nodes, zoom, pan, selectedNode])

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = (e.clientX - rect.left - pan.x) / zoom
    const y = (e.clientY - rect.top - pan.y) / zoom

    // Check if clicking on a node
    const clickedNode = nodes.find((node) => {
      const boxSize = 60
      return (
        x >= node.x - boxSize / 2 &&
        x <= node.x + boxSize / 2 &&
        y >= node.y - boxSize / 2 &&
        y <= node.y + boxSize / 2
      )
    })

    if (clickedNode) {
      setDraggedNode(clickedNode)
      setSelectedNode(clickedNode)
      setIsDragging(true)
    } else {
      setSelectedNode(null)
    }
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging || !draggedNode) return

    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = (e.clientX - rect.left - pan.x) / zoom
    const y = (e.clientY - rect.top - pan.y) / zoom

    setNodes((prevNodes) =>
      prevNodes.map((node) =>
        node.id === draggedNode.id ? { ...node, x, y } : node
      )
    )
  }

  const handleMouseUp = () => {
    setIsDragging(false)
    setDraggedNode(null)
  }

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault()
    const delta = e.deltaY > 0 ? 0.9 : 1.1
    setZoom((prev) => Math.min(Math.max(prev * delta, 0.5), 3))
  }

  return (
    <div className="relative">
      <canvas
        ref={canvasRef}
        width={1200}
        height={700}
        className="border border-gray-800 bg-black cursor-move"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
      />

      {/* Controls */}
      <div className="absolute top-4 right-4 flex flex-col gap-2">
        <button
          onClick={() => setZoom((prev) => Math.min(prev * 1.2, 3))}
          className="px-3 py-2 border border-gray-700 bg-black/80 backdrop-blur-sm hover:border-gray-600 text-white font-mono text-sm transition-colors"
          title="Zoom In"
        >
          +
        </button>
        <button
          onClick={() => setZoom((prev) => Math.max(prev * 0.8, 0.5))}
          className="px-3 py-2 border border-gray-700 bg-black/80 backdrop-blur-sm hover:border-gray-600 text-white font-mono text-sm transition-colors"
          title="Zoom Out"
        >
          -
        </button>
        <button
          onClick={() => {
            setZoom(1)
            setPan({ x: 0, y: 0 })
          }}
          className="px-3 py-2 border border-gray-700 bg-black/80 backdrop-blur-sm hover:border-gray-600 text-white font-mono text-xs transition-colors"
          title="Reset View"
        >
          Reset
        </button>
      </div>

      {/* Selected Node Info */}
      {selectedNode && (
        <div className="absolute bottom-4 left-4 right-4 border border-gray-800 bg-black/90 backdrop-blur-sm p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-white mb-2">
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
              href={`/services/${selectedNode.service.id}`}
              className="px-4 py-2 border border-gray-700 hover:border-gray-600 text-white hover:bg-gray-900 transition-colors font-mono text-xs uppercase tracking-wider"
            >
              View Details
            </a>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="mt-4 flex gap-6 text-xs font-mono text-gray-500 uppercase tracking-wider">
        <span>Click + Drag: Move Nodes</span>
        <span>Scroll: Zoom</span>
        <span>Click Node: View Info</span>
      </div>
    </div>
  )
}
