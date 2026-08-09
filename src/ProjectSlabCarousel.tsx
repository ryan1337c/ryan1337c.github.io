import { RoundedBox } from '@react-three/drei'
import { Canvas, type ThreeEvent, useFrame } from '@react-three/fiber'
import { useEffect, useMemo, useRef, useState } from 'react'
import {
  CanvasTexture,
  Color,
  Group,
  LinearFilter,
  SRGBColorSpace,
} from 'three'

const projects = [
  { title: 'Meigan', type: 'iOS Application', year: '2026', color: '#d7193f' },
  { title: 'Omni', type: 'Web Application', year: '2025-2026', color: '#6f9fbe' },
  { title: 'Fontimize', type: 'Chrome Extension', year: '2025', color: '#18334e' },
  { title: 'Kirby Recreation', type: '2D Platformers', year: '2025', color: '#8a98a7' },
]

function finishTexture(texture: CanvasTexture) {
  texture.colorSpace = SRGBColorSpace
  texture.minFilter = LinearFilter
  texture.magFilter = LinearFilter
  texture.needsUpdate = true
  return texture
}

function createFrontLabel(title: string, type: string, year: string, index: number) {
  const canvas = document.createElement('canvas')
  canvas.width = 1024
  canvas.height = 300
  const context = canvas.getContext('2d')!

  context.fillStyle = '#d5162f'
  context.fillRect(0, 0, canvas.width, canvas.height)
  context.fillStyle = '#f7f7f3'
  context.fillRect(24, 24, canvas.width - 48, canvas.height - 48)
  context.fillStyle = '#111820'
  context.font = '700 48px Arial'
  context.fillText(`${year}  —  ${type.toUpperCase()}`, 52, 88)
  context.font = '800 46px Arial'
  context.fillText(title.toUpperCase(), 52, 153)
  context.font = '700 32px Arial'
  context.fillText('PERSONAL PROJECT', 52, 210)
  context.textAlign = 'right'
  context.font = '800 48px Arial'
  context.fillText(`#00${index + 1}`, 968, 88)
  context.font = '700 38px Arial'
  context.fillText('GEM MINT 10', 968, 153)

  context.textAlign = 'left'
  for (let bar = 0; bar < 42; bar += 1) {
    const width = bar % 3 === 0 ? 7 : 3
    context.fillRect(52 + bar * 10, 230, width, 43)
  }
  context.fillStyle = '#244e74'
  context.font = '900 italic 56px Arial'
  context.fillText('P', 520, 267)
  context.fillStyle = '#d7193f'
  context.fillText('F', 560, 267)

  return finishTexture(new CanvasTexture(canvas))
}

function createBackLabel() {
  const canvas = document.createElement('canvas')
  canvas.width = 1024
  canvas.height = 300
  const context = canvas.getContext('2d')!

  context.fillStyle = '#bfc4c7'
  context.fillRect(0, 0, canvas.width, canvas.height)
  context.fillStyle = '#244e74'
  context.font = '900 italic 96px Arial'
  context.fillText('P', 427, 142)
  context.fillStyle = '#d7193f'
  context.fillText('F', 493, 142)
  context.fillStyle = '#18334e'
  context.textAlign = 'center'
  context.font = '700 34px Arial'
  context.letterSpacing = '12px'
  context.fillText('PORTFOLIO', canvas.width / 2, 220)

  return finishTexture(new CanvasTexture(canvas))
}

function createProjectCard(title: string, type: string, color: string, index: number) {
  const canvas = document.createElement('canvas')
  canvas.width = 700
  canvas.height = 900
  const context = canvas.getContext('2d')!
  const gradient = context.createLinearGradient(0, 0, 700, 900)
  gradient.addColorStop(0, color)
  gradient.addColorStop(1, '#10283f')
  context.fillStyle = gradient
  context.fillRect(0, 0, 700, 900)

  context.strokeStyle = 'rgba(255,255,255,.22)'
  context.lineWidth = 2
  for (let x = -600; x < 900; x += 44) {
    context.beginPath()
    context.moveTo(x, 0)
    context.lineTo(x + 900, 900)
    context.stroke()
  }

  context.fillStyle = 'rgba(255,255,255,.13)'
  context.font = '900 370px Arial'
  context.fillText(`0${index + 1}`, 28, 460)
  context.fillStyle = '#fff'
  context.font = '800 54px Arial'
  context.fillText(title.toUpperCase(), 48, 750)
  context.fillStyle = 'rgba(255,255,255,.72)'
  context.font = '700 27px Arial'
  context.fillText(type.toUpperCase(), 50, 808)
  context.fillStyle = '#fff'
  context.fillRect(50, 840, 600, 4)

  return finishTexture(new CanvasTexture(canvas))
}

function createProjectCardBack() {
  const canvas = document.createElement('canvas')
  canvas.width = 700
  canvas.height = 900
  const context = canvas.getContext('2d')!

  context.fillStyle = '#bfc4c7'
  context.fillRect(0, 0, canvas.width, canvas.height)
  context.fillStyle = '#244e74'
  context.font = '900 italic 180px Arial'
  context.fillText('P', 245, 445)
  context.fillStyle = '#d7193f'
  context.fillText('F', 365, 445)
  context.fillStyle = '#18334e'
  context.textAlign = 'center'
  context.font = '700 38px Arial'
  context.letterSpacing = '14px'
  context.fillText('PORTFOLIO', canvas.width / 2, 530)

  return finishTexture(new CanvasTexture(canvas))
}

function AcrylicRail({
  position,
  size,
}: {
  position: [number, number, number]
  size: [number, number, number]
}) {
  return (
    <RoundedBox args={size} radius={0.025} smoothness={4} position={position}>
      <meshPhysicalMaterial
        color="#dce7ed"
        transparent
        opacity={0.44}
        roughness={0.12}
        metalness={0.04}
        transmission={0.35}
        thickness={0.25}
      />
    </RoundedBox>
  )
}

function PSASlab({
  project,
  index,
  active,
  inspecting,
  onInspect,
}: {
  project: (typeof projects)[number]
  index: number
  active: boolean
  inspecting: boolean
  onInspect: () => void
}) {
  const model = useRef<Group>(null)
  const drag = useRef({
    active: false,
    moved: false,
    pointerId: -1,
    startX: 0,
    startY: 0,
    rotationX: 0,
    rotationY: 0,
  })
  const snapRotation = useRef({ x: 0, y: 0 })
  const frontLabel = useMemo(
    () => createFrontLabel(project.title, project.type, project.year, index),
    [index, project],
  )
  const backLabel = useMemo(() => createBackLabel(), [])
  const projectCard = useMemo(
    () => createProjectCard(project.title, project.type, project.color, index),
    [index, project],
  )
  const projectCardBack = useMemo(() => createProjectCardBack(), [])

  useEffect(
    () => () => {
      frontLabel.dispose()
      backLabel.dispose()
      projectCard.dispose()
      projectCardBack.dispose()
    },
    [backLabel, frontLabel, projectCard, projectCardBack],
  )

  useFrame((_, delta) => {
    if (!model.current || drag.current.active) return
    if (!inspecting) {
      snapRotation.current.x = 0
      snapRotation.current.y = 0
    }
    const damping = 1 - Math.exp(-delta * 8)
    model.current.rotation.x += (snapRotation.current.x - model.current.rotation.x) * damping
    model.current.rotation.y += (snapRotation.current.y - model.current.rotation.y) * damping
  })

  const handlePointerDown = (event: ThreeEvent<PointerEvent>) => {
    if (!active || !model.current) return
    event.stopPropagation()
    const captureTarget = event.target as HTMLElement
    captureTarget.setPointerCapture(event.pointerId)
    drag.current = {
      active: true,
      moved: false,
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      rotationX: model.current.rotation.x,
      rotationY: model.current.rotation.y,
    }
  }

  const handlePointerMove = (event: ThreeEvent<PointerEvent>) => {
    if (!drag.current.active || !model.current) return
    event.stopPropagation()
    const distanceX = event.clientX - drag.current.startX
    const distanceY = event.clientY - drag.current.startY
    if (Math.hypot(distanceX, distanceY) > 4) drag.current.moved = true
    if (!inspecting) return
    model.current.rotation.y = drag.current.rotationY + distanceX * 0.009
    model.current.rotation.x = Math.max(
      -Math.PI * 0.48,
      Math.min(Math.PI * 0.48, drag.current.rotationX + distanceY * 0.009),
    )
  }

  const handlePointerUp = (event: ThreeEvent<PointerEvent>) => {
    if (!drag.current.active || !model.current) return
    event.stopPropagation()
    const captureTarget = event.target as HTMLElement
    captureTarget.releasePointerCapture(drag.current.pointerId)
    const wasMoved = drag.current.moved
    drag.current.active = false

    if (!inspecting && !wasMoved) {
      onInspect()
      return
    }

    if (inspecting) {
      const rotation = model.current.rotation.y
      const fullTurn = Math.PI * 2
      const nearestFront = Math.round(rotation / fullTurn) * fullTurn
      const nearestBack = Math.round((rotation - Math.PI) / fullTurn) * fullTurn + Math.PI
      snapRotation.current.y =
        Math.abs(rotation - nearestFront) <= Math.abs(rotation - nearestBack)
          ? nearestFront
          : nearestBack
      snapRotation.current.x = 0
    }
  }

  return (
    <group
      ref={model}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerEnter={(event) => {
        if (!active) return
        event.stopPropagation()
      }}
    >
      <RoundedBox args={[2.5, 3.65, 0.2]} radius={0.13} smoothness={8} castShadow>
        <meshPhysicalMaterial
          color="#eaf3f7"
          transparent
          opacity={0.32}
          roughness={0.08}
          transmission={0.72}
          thickness={0.45}
          ior={1.48}
        />
      </RoundedBox>

      <AcrylicRail position={[0, 1.02, 0.11]} size={[2.25, 0.055, 0.07]} />
      <AcrylicRail position={[0, -1.66, 0.11]} size={[2.25, 0.055, 0.07]} />
      <AcrylicRail position={[-1.11, -0.32, 0.11]} size={[0.055, 2.7, 0.07]} />
      <AcrylicRail position={[1.11, -0.32, 0.11]} size={[0.055, 2.7, 0.07]} />

      <mesh position={[0, 1.39, 0.115]}>
        <planeGeometry args={[2.16, 0.63]} />
        <meshBasicMaterial map={frontLabel} toneMapped={false} />
      </mesh>
      <mesh position={[0, -0.34, 0]} castShadow>
        <boxGeometry args={[1.88, 2.38, 0.085]} />
        <meshStandardMaterial attach="material-0" color="#263744" roughness={0.72} />
        <meshStandardMaterial attach="material-1" color="#263744" roughness={0.72} />
        <meshStandardMaterial attach="material-2" color="#52616c" roughness={0.68} />
        <meshStandardMaterial attach="material-3" color="#263744" roughness={0.72} />
        <meshStandardMaterial
          attach="material-4"
          map={projectCard}
          roughness={0.55}
          metalness={0.02}
        />
        <meshStandardMaterial
          attach="material-5"
          map={projectCardBack}
          roughness={0.38}
          metalness={0.08}
        />
      </mesh>

      <mesh position={[0, 1.39, -0.115]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[2.16, 0.63]} />
        <meshBasicMaterial map={backLabel} toneMapped={false} />
      </mesh>
    </group>
  )
}

function CarouselRig({
  selectedIndex,
  inspecting,
  canInspect,
  onInspect,
}: {
  selectedIndex: number
  inspecting: boolean
  canInspect: boolean
  onInspect: () => void
}) {
  const items = useRef<Array<Group | null>>([])
  const phase = useRef(0)

  useFrame((_, delta) => {
    let distance = selectedIndex - phase.current
    while (distance > projects.length / 2) distance -= projects.length
    while (distance < -projects.length / 2) distance += projects.length
    phase.current += distance * (1 - Math.exp(-delta * 4.8))

    items.current.forEach((item, index) => {
      if (!item) return
      item.visible = !inspecting || index === selectedIndex
      if (inspecting && index === selectedIndex) {
        item.position.x += (0 - item.position.x) * (1 - Math.exp(-delta * 5))
        item.position.y += (0 - item.position.y) * (1 - Math.exp(-delta * 5))
        item.position.z += (0.8 - item.position.z) * (1 - Math.exp(-delta * 5))
        const zoomScale = item.scale.x + (1.3 - item.scale.x) * (1 - Math.exp(-delta * 5))
        item.scale.setScalar(zoomScale)
        return
      }

      const angle = (index - phase.current) * (Math.PI * 2 / projects.length)
      const depth = (1 - Math.cos(angle)) * 0.5
      const targetX = Math.sin(angle) * 3.25
      const targetY = -depth * 0.12
      const targetZ = -depth * 3.1
      const movement = 1 - Math.exp(-delta * 6)
      item.position.x += (targetX - item.position.x) * movement
      item.position.y += (targetY - item.position.y) * movement
      item.position.z += (targetZ - item.position.z) * movement
      const scale = 1 - depth * 0.2
      item.scale.setScalar(item.scale.x + (scale - item.scale.x) * movement)
      item.rotation.y = 0
    })
  })

  return (
    <group position={[0, -0.05, 0]}>
      {projects.map((project, index) => (
        <group
          key={project.title}
          ref={(element) => {
            items.current[index] = element
          }}
        >
          <PSASlab
            project={project}
            index={index}
            active={canInspect && index === selectedIndex}
            inspecting={inspecting && index === selectedIndex}
            onInspect={onInspect}
          />
        </group>
      ))}
    </group>
  )
}

export default function ProjectSlabCarousel() {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [inspecting, setInspecting] = useState(false)
  const [storyActive, setStoryActive] = useState(false)
  const story = useRef<HTMLDivElement>(null)
  const progressFill = useRef<HTMLDivElement>(null)
  const progressRunner = useRef<HTMLDivElement>(null)
  const selectionTimer = useRef<number | null>(null)

  useEffect(() => () => {
    if (selectionTimer.current !== null) window.clearTimeout(selectionTimer.current)
  }, [])

  useEffect(() => {
    let animationFrame = 0

    const updateStory = () => {
      animationFrame = 0
      if (!story.current || inspecting) return
      const bounds = story.current.getBoundingClientRect()
      const scrollRange = Math.max(1, bounds.height - window.innerHeight)
      const progress = Math.max(0, Math.min(1, -bounds.top / scrollRange))
      const nextIndex = Math.round(progress * (projects.length - 1))
      const nextStoryActive =
        bounds.top <= 1 && bounds.bottom >= window.innerHeight - 1

      if (progressFill.current) {
        progressFill.current.style.transform = `scaleX(${progress})`
      }
      if (progressRunner.current) {
        progressRunner.current.style.left = `${progress * 100}%`
      }
      setSelectedIndex((current) => current === nextIndex ? current : nextIndex)
      setStoryActive((current) => current === nextStoryActive ? current : nextStoryActive)
    }

    const requestStoryUpdate = () => {
      if (!animationFrame) animationFrame = window.requestAnimationFrame(updateStory)
    }

    updateStory()
    window.addEventListener('scroll', requestStoryUpdate, { passive: true })
    window.addEventListener('resize', requestStoryUpdate)
    return () => {
      window.removeEventListener('scroll', requestStoryUpdate)
      window.removeEventListener('resize', requestStoryUpdate)
      if (animationFrame) window.cancelAnimationFrame(animationFrame)
    }
  }, [inspecting])

  useEffect(() => {
    if (!inspecting) return
    const lockedScrollPosition = window.scrollY
    const preventScroll = (event: Event) => event.preventDefault()
    const preventScrollKeys = (event: KeyboardEvent) => {
      if ([
        'ArrowDown',
        'ArrowUp',
        'PageDown',
        'PageUp',
        'Home',
        'End',
        ' ',
      ].includes(event.key)) {
        event.preventDefault()
      }
    }
    const holdScrollPosition = () => {
      if (Math.abs(window.scrollY - lockedScrollPosition) > 1) {
        window.scrollTo(0, lockedScrollPosition)
      }
    }

    const allowHeaderNavigation = (event: MouseEvent) => {
      const clickedElement = event.target as Element | null
      const link = clickedElement?.closest<HTMLAnchorElement>('.site-header a[href^="#"]')
      if (!link) return
      const destination = document.querySelector(link.hash)
      if (!destination) return
      event.preventDefault()
      if (selectionTimer.current !== null) {
        window.clearTimeout(selectionTimer.current)
        selectionTimer.current = null
      }
      setInspecting(false)
      window.requestAnimationFrame(() => destination.scrollIntoView({ behavior: 'smooth' }))
    }

    document.addEventListener('click', allowHeaderNavigation, true)
    window.addEventListener('wheel', preventScroll, { passive: false })
    window.addEventListener('touchmove', preventScroll, { passive: false })
    window.addEventListener('keydown', preventScrollKeys)
    window.addEventListener('scroll', holdScrollPosition, { passive: true })
    return () => {
      document.removeEventListener('click', allowHeaderNavigation, true)
      window.removeEventListener('wheel', preventScroll)
      window.removeEventListener('touchmove', preventScroll)
      window.removeEventListener('keydown', preventScrollKeys)
      window.removeEventListener('scroll', holdScrollPosition)
    }
  }, [inspecting])

  const selectStoryPoint = (index: number) => {
    const moveToStoryPoint = () => {
      selectionTimer.current = null
      setSelectedIndex(index)
      const progress = index / (projects.length - 1)
      if (progressFill.current) {
        progressFill.current.style.transform = `scaleX(${progress})`
      }
      if (progressRunner.current) {
        progressRunner.current.style.left = `${progress * 100}%`
      }
      if (!story.current) return
      const bounds = story.current.getBoundingClientRect()
      const storyTop = window.scrollY + bounds.top
      const scrollRange = Math.max(0, story.current.offsetHeight - window.innerHeight)
      window.scrollTo({
        top: storyTop + scrollRange * progress,
        behavior: 'smooth',
      })
    }

    if (selectionTimer.current !== null) window.clearTimeout(selectionTimer.current)
    if (inspecting) {
      setInspecting(false)
      selectionTimer.current = window.setTimeout(moveToStoryPoint, 420)
    } else {
      moveToStoryPoint()
    }
  }

  return (
    <div className="slab-story" ref={story}>
      <div className="slab-story-sticky">
        <div className="slab-carousel-shell">
          <div className={`slab-carousel${storyActive ? ' is-inspectable' : ''}${inspecting ? ' is-inspecting' : ''}`}>
        <Canvas
          camera={{ position: [0, 0.05, 8.4], fov: 38 }}
          dpr={[1, 1.75]}
          shadows
          gl={{ antialias: true, alpha: true }}
        >
          <color attach="background" args={[new Color('#edf1f3')]} />
          <ambientLight intensity={1.3} />
          <directionalLight position={[-4, 6, 7]} intensity={2.4} castShadow />
          <directionalLight position={[5, -2, 5]} intensity={1.2} color="#9ec8e0" />
          <pointLight position={[0, 1, 5]} intensity={1.5} color="#ffffff" />
          <CarouselRig
            selectedIndex={selectedIndex}
            inspecting={inspecting}
            canInspect={storyActive}
            onInspect={() => {
              if (storyActive) setInspecting(true)
            }}
          />
        </Canvas>
            {inspecting ? (
              <div className="inspection-controls">
                <button type="button" onClick={() => setInspecting(false)}>← Back to story</button>
                <span>Click and drag to rotate · Release to snap</span>
              </div>
            ) : (
              <div className="carousel-instructions">
                <span>{storyActive ? 'Scroll to explore the collection' : 'Continue scrolling to begin'}</span>
                <span>{storyActive ? 'Click the focused slab to inspect' : 'Inspection unlocks inside the story'}</span>
              </div>
            )}
          </div>

          <div className="carousel-progress" aria-label="Carousel story progress">
            <div className="progress-heading">
              <span>Scroll story · Or select a chapter</span>
              <strong>{String(selectedIndex + 1).padStart(2, '0')} / 04</strong>
            </div>
            <div className="progress-track">
              <div className="progress-fill" ref={progressFill} />
              <div className="progress-runner" ref={progressRunner}><span /></div>
              {projects.map((project, index) => (
                <button
                  type="button"
                  className={`progress-pin${index === selectedIndex ? ' is-active' : ''}${index < selectedIndex ? ' is-complete' : ''}`}
                  key={project.title}
                  aria-label={`Show ${project.title}`}
                  aria-pressed={index === selectedIndex}
                  onClick={() => selectStoryPoint(index)}
                  style={{ left: `${index / (projects.length - 1) * 100}%` }}
                >
                  <i /><i /><i /><i />
                  <span>{String(index + 1).padStart(2, '0')}</span>
                  <small>{project.title}</small>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
