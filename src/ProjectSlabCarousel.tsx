import { RoundedBox, useTexture } from '@react-three/drei'
import { Canvas, type ThreeEvent, useFrame, useThree } from '@react-three/fiber'
import { useEffect, useMemo, useRef, useState } from 'react'
import {
  CanvasTexture,
  Color,
  Group,
  LinearFilter,
  Mesh,
  MeshBasicMaterial,
  PerspectiveCamera,
  SRGBColorSpace,
  Vector3,
} from 'three'
import pokemonCardBack from './assets/back_pokemon.png'
import meiganImg from './assets/meigan.png'
import omniImg from './assets/omni.png'
import fontimizeImg from './assets/fontimize.png'
import kirbyImg from './assets/kirby.webp'

type Project = {
  title: string
  type: string
  year: string
  color: string
  img: string
  mediaFit: 'cover' | 'contain'
  mediaZoom?: number
  summary: string
  abilityTitle: string
  abilityText: string
  attackTitle: string
  attackMetric: string
  attackText: string
  weakness: string
  resistance: string
  illustrator?: string
  copyright?: string
  level?: string
  hp?: string
  link?: string
}

const projects: Project[] = [
  {
    title: 'Meigan',
    type: 'iOS Application',
    year: '2026',
    color: '#d7193f',
    img: meiganImg,
    mediaFit: 'cover',
    summary: 'SwiftUI · ARKit/RealityKit · on-device Core ML (YOLO) · Supabase',
    abilityTitle: 'Ability: Standout Feature',
    abilityText: 'Measure distances and surfaces in AR using camera/LiDAR; get accurate 3D-anchored measurements, real-time object detection, and flattened exports for documenting dimensions',
    attackTitle: 'Ruler, Flatten & Identify',
    attackMetric: '90+',
    attackText: 'Ruler mode: place connected points with snapping and live preview; Flatten mode: flatten four-corner surfaces and calculate dimensions; Identity Mode: run real-time on-device object detection for labeling',
    weakness: 'iOS device & Apple signing; device-dependent performance',
    resistance: 'On-device Core ML & LiDAR; native SwiftUI + ARKit',
    illustrator: 'Ryan Chen',
    copyright: '©2026 Ryan Chen',
    link: 'https://github.com/ryan1337c/meigan',
  },
  {
    title: 'Omni',
    type: 'Web Application',
    year: '2025-2026',
    color: '#6f9fbe',
    img: omniImg,
    mediaFit: 'contain',
    mediaZoom: 1.18,
    summary: 'Next.js (TypeScript) · Tailwind · Supabase · OpenAI/Claude/DeepSeek integrations',
    abilityTitle: 'Ability: Standout Feature',
    abilityText: 'All-in-one AI copilot that routes prompts to the best models (Claude, DeepSeek, OpenAI); delivers faster, higher-quality outputs and preserves conversation history',
    attackTitle: 'Tool automation',
    attackMetric: '80',
    attackText: 'Generate images, quizzes, and flashcards; tailor resumes; and analyze uploaded documents via model APIs to produce polished assets and structured outputs',
    weakness: 'External API keys (OpenAI/DeepSeek); cost & latency risk',
    resistance: 'Model-agnostic routing; Supabase-backed persistence',
    illustrator: 'Ryan Chen',
    copyright: '©2026 Ryan Chen',
    link: 'https://github.com/ryan1337c/omni',
  },
  {
    title: 'Fontimize',
    type: 'Chrome Extension',
    year: '2025',
    color: '#18334e',
    img: fontimizeImg,
    mediaFit: 'contain',
    summary: 'Chrome extension · JS background/content/popup · injected CSS + webfonts',
    abilityTitle: 'Ability: Standout Feature',
    abilityText: 'Customize website typography and highlight content by injecting fonts, sizes, spacing, and styles per site; improves readability and accessibility for personalized web reading',
    attackTitle: 'Font tuner & Highlight tool',
    attackMetric: '70+',
    attackText: 'Inject CSS and webfonts and provide a highlight tool to instantly adjust typography and emphasize content per site',
    weakness: 'Chrome-only; injected CSS can break complex sites;',
    resistance: 'Client-side only; instant local style changes; no backend',
    illustrator: 'Ryan Chen',
    copyright: '©2026 Ryan Chen',
    link: 'https://github.com/ryan1337c/fontimize',
  },
  {
    title: 'Kirby Game',
    type: '2D Platformers',
    year: '2025',
    color: '#8a98a7',
    img: kirbyImg,
    mediaFit: 'cover',
    summary: 'Java (JDK 8+) desktop game · Game.Engine entrypoint',
    abilityTitle: 'Ability: Standout Feature',
    abilityText: 'Play a recreated Kirby-style platformer built in Java; local levels showcase core mechanics, controls, and level design',
    attackTitle: 'Game Engine',
    attackMetric: '60',
    attackText: 'Run the Game.Engine to play recreated levels with local input, physics, and enemy logic for a classic platformer experience',
    weakness: 'Audio/SFX missing; requires JDK/IDE; no installer',
    resistance: 'Self-contained Java codebase; easy to run and modify locally',
    illustrator: 'Ryan Chen',
    copyright: '©2026 Ryan Chen',
    link: 'https://github.com/ryan1337c/kirby',
  },
]

const FRONT_LABEL = {
  canvasWidth: 1024,
  canvasHeight: 300,
  planeWidth: 2.16,
  planeHeight: 0.63,
  position: [0, 1.39, 0.115] as const,
  barcode: {
    startX: 52,
    startY: 230,
    barCount: 42,
    barStep: 10,
    barHeight: 43,
    wideBarWidth: 7,
    narrowBarWidth: 3,
    touchPaddingPx: 10,
  },
}

function getBarcodeCanvasBounds(paddingPx = 0) {
  const { startX, startY, barCount, barStep, barHeight, wideBarWidth, narrowBarWidth } =
    FRONT_LABEL.barcode
  let right = startX
  for (let bar = 0; bar < barCount; bar += 1) {
    const width = bar % 3 === 0 ? wideBarWidth : narrowBarWidth
    right = Math.max(right, startX + bar * barStep + width)
  }
  return {
    left: startX - paddingPx,
    top: startY - paddingPx,
    right: right + paddingPx,
    bottom: startY + barHeight + paddingPx,
  }
}

function canvasRectToLabelHitBox(bounds: {
  left: number
  top: number
  right: number
  bottom: number
}) {
  const { canvasWidth, canvasHeight, planeWidth, planeHeight } = FRONT_LABEL
  const pxToLocalX = (px: number) => (px / canvasWidth - 0.5) * planeWidth
  const pxToLocalY = (py: number) => (0.5 - py / canvasHeight) * planeHeight
  const left = pxToLocalX(bounds.left)
  const right = pxToLocalX(bounds.right)
  const top = pxToLocalY(bounds.top)
  const bottom = pxToLocalY(bounds.bottom)
  return {
    x: (left + right) / 2,
    y: (top + bottom) / 2,
    width: right - left,
    height: top - bottom,
  }
}

const LABEL_BARCODE_HIT_BOX = canvasRectToLabelHitBox(
  getBarcodeCanvasBounds(FRONT_LABEL.barcode.touchPaddingPx),
)

// The callout tag floats to the left of the slab at barcode height, like a
// reviewer annotation pointing at the circled barcode. localX is only the
// initial mount position — every frame the tag is re-anchored to the slab's
// left edge so it stays in view at every inspection zoom level.
const LABEL_BARCODE_HINT_TAG = {
  localX: -1.72,
  localY: FRONT_LABEL.position[1] + LABEL_BARCODE_HIT_BOX.y,
  width: 1.15,
  height: 1.15 / (960 / 280),
  tilt: -0.035,
}

// The pencil circle is an oversized wobbly ellipse around the barcode hit
// area, drawn out progressively once the inspection zoom settles. The canvas
// keeps generous margins around the stroke so the wobble, tilt, and line
// width can never clip at the texture edges.
const BARCODE_PENCIL_CIRCLE = {
  width: 1.42,
  height: 1.42 / (1320 / 480),
  drawStart: 0.5,
  drawDuration: 1.25,
}

// Annotations sit in front of the acrylic rails, whose front faces reach
// z ≈ 0.145, so the slab hardware never occludes them.
const ANNOTATION_Z = FRONT_LABEL.position[2] + 0.04

function smoothstep01(value: number) {
  const x = Math.max(0, Math.min(1, value))
  return x * x * (3 - 2 * x)
}

function easeOutCubic(value: number) {
  const x = Math.max(0, Math.min(1, value))
  return 1 - Math.pow(1 - x, 3)
}

// Deterministic pseudo-random so the hand-drawn wobble stays stable between
// frames instead of crawling.
function hashNoise(value: number) {
  const x = Math.sin(value * 127.1 + 311.7) * 43758.5453
  return x - Math.floor(x)
}

function createBarcodeHintTagTexture() {
  const canvas = document.createElement('canvas')
  canvas.width = 960
  canvas.height = 280
  const context = canvas.getContext('2d')!

  const ink = '#d7193f'
  context.fillStyle = ink
  context.strokeStyle = ink
  context.lineCap = 'round'
  context.lineJoin = 'round'
  context.textBaseline = 'middle'

  // Hand-style lettering with a tiny per-letter jitter so the callout reads
  // as an annotation rather than UI chrome.
  const label = 'CLICK TO SEE REPO'
  const fontFamily = `'Segoe Print', 'Comic Sans MS', cursive`
  let fontSize = 84
  context.font = `900 ${fontSize}px ${fontFamily}`
  while (context.measureText(label).width > canvas.width - 160 && fontSize > 40) {
    fontSize -= 4
    context.font = `900 ${fontSize}px ${fontFamily}`
  }
  const letters = [...label]
  const widths = letters.map((letter) => context.measureText(letter).width)
  const totalWidth = widths.reduce((sum, width) => sum + width, 0)
  let cursor = (canvas.width - totalWidth) / 2
  letters.forEach((letter, index) => {
    context.save()
    context.translate(cursor + widths[index] / 2, 106 + (hashNoise(index + 11) - 0.5) * 5)
    context.rotate((hashNoise(index + 47) - 0.5) * 0.06)
    context.fillText(letter, -widths[index] / 2, 0)
    context.restore()
    cursor += widths[index]
  })

  // Sketchy swoosh arrow pointing right toward the pencil circle.
  const arrowSegments = 26
  const arrowPoints: Array<[number, number]> = []
  for (let segment = 0; segment <= arrowSegments; segment += 1) {
    const t = segment / arrowSegments
    arrowPoints.push([
      150 + (canvas.width - 30 - 150) * t,
      188 + Math.sin(t * Math.PI) * 24 + Math.sin(t * 9 + 1.2) * 2.5,
    ])
  }
  for (let segment = 0; segment < arrowSegments; segment += 1) {
    const noise = hashNoise(segment * 3 + 5)
    context.globalAlpha = 0.7 + noise * 0.3
    context.lineWidth = 6.5 + noise * 4
    context.beginPath()
    context.moveTo(arrowPoints[segment][0], arrowPoints[segment][1])
    context.lineTo(arrowPoints[segment + 1][0], arrowPoints[segment + 1][1])
    context.stroke()
  }
  const [tipX, tipY] = arrowPoints[arrowSegments]
  const [beforeTipX, beforeTipY] = arrowPoints[arrowSegments - 1]
  const headAngle = Math.atan2(tipY - beforeTipY, tipX - beforeTipX)
  for (const spread of [0.45, -0.45]) {
    context.globalAlpha = 0.9
    context.lineWidth = 7
    context.beginPath()
    context.moveTo(
      tipX - Math.cos(headAngle + spread) * 30,
      tipY - Math.sin(headAngle + spread) * 30,
    )
    context.lineTo(tipX, tipY)
    context.stroke()
  }
  context.globalAlpha = 1

  return finishTexture(new CanvasTexture(canvas))
}

function createPencilCircle() {
  const canvas = document.createElement('canvas')
  canvas.width = 1320
  canvas.height = 480
  const context = canvas.getContext('2d')!
  context.lineCap = 'round'
  context.lineJoin = 'round'

  const centerX = canvas.width / 2
  const centerY = canvas.height / 2
  const radiusX = canvas.width / 2 - 120
  const radiusY = canvas.height / 2 - 76
  const tilt = -0.045
  // Start near the upper-left and sweep past the start point so the stroke
  // crosses over itself, like a marker circle drawn by hand.
  const startAngle = (212 * Math.PI) / 180
  const sweep = (392 * Math.PI) / 180
  const segments = 120

  const points: Array<[number, number]> = []
  for (let point = 0; point <= segments; point += 1) {
    const t = point / segments
    const angle = startAngle + sweep * t
    const wobble =
      1 +
      0.028 * Math.sin(3 * angle + 1.4) +
      0.018 * Math.sin(7 * angle + 4.2) +
      0.011 * Math.sin(12 * angle + 0.7)
    const ellipseX = radiusX * wobble * Math.cos(angle)
    const ellipseY = radiusY * (wobble + 0.015 * Math.sin(5 * angle + 2.9)) * Math.sin(angle)
    points.push([
      centerX + ellipseX * Math.cos(tilt) - ellipseY * Math.sin(tilt),
      centerY + ellipseX * Math.sin(tilt) + ellipseY * Math.cos(tilt),
    ])
  }

  const texture = finishTexture(new CanvasTexture(canvas))
  let lastDrawn = -1

  const strokeSegment = (index: number, fraction: number, pass: 0 | 1) => {
    const [x1, y1] = points[index]
    const [x2, y2] = points[index + 1]
    const noise = hashNoise(index * 2 + pass * 131)
    const offsetX = pass === 0 ? 0 : 1.6
    const offsetY = pass === 0 ? 0 : 1.1
    context.strokeStyle = `rgba(215, 25, 63, ${pass === 0 ? 0.6 + 0.4 * noise : 0.16})`
    context.lineWidth = pass === 0 ? 8 + 7 * noise : 4.5
    context.beginPath()
    context.moveTo(x1 + offsetX, y1 + offsetY)
    context.lineTo(
      x1 + (x2 - x1) * fraction + offsetX,
      y1 + (y2 - y1) * fraction + offsetY,
    )
    context.stroke()
  }

  // Redraws the stroke up to `progress` (0..1). Called every frame while the
  // inspection hint runs; skips work when the visible length is unchanged.
  const draw = (progress: number) => {
    const clamped = Math.max(0, Math.min(1, progress))
    const exact = clamped * segments
    if (Math.abs(exact - lastDrawn) < 0.25) return
    lastDrawn = exact
    context.clearRect(0, 0, canvas.width, canvas.height)
    const fullSegments = Math.min(segments, Math.floor(exact))
    const fraction = exact - fullSegments
    for (const pass of [0, 1] as const) {
      for (let segment = 0; segment < fullSegments; segment += 1) {
        strokeSegment(segment, 1, pass)
      }
      if (fraction > 0.001 && fullSegments < segments) {
        strokeSegment(fullSegments, fraction, pass)
      }
    }
    texture.needsUpdate = true
  }

  return { texture, draw }
}

function BarcodeLinkHint({
  link,
  inspecting,
  onOpen,
  modelRef,
}: {
  link: string
  inspecting: boolean
  onOpen: (event: ThreeEvent<MouseEvent>) => void
  modelRef: { current: Group | null }
}) {
  const { gl } = useThree()
  const [hovered, setHovered] = useState(false)
  const hoverOpacity = useRef(0)
  const hoverMaterial = useRef<MeshBasicMaterial>(null)
  const hintTime = useRef(0)
  const tagOpacity = useRef(0)
  const tagMaterial = useRef<MeshBasicMaterial>(null)
  const tagMesh = useRef<Mesh>(null)
  const circleMaterial = useRef<MeshBasicMaterial>(null)
  const worldScaleScratch = useRef(new Vector3())
  const tagTexture = useMemo(() => createBarcodeHintTagTexture(), [])
  const pencilCircle = useMemo(() => createPencilCircle(), [])

  const hitPosition = useMemo(
    () =>
      [
        FRONT_LABEL.position[0] + LABEL_BARCODE_HIT_BOX.x,
        FRONT_LABEL.position[1] + LABEL_BARCODE_HIT_BOX.y,
        FRONT_LABEL.position[2] + 0.006,
      ] as const,
    [],
  )

  const tagPosition = useMemo(
    () =>
      [
        LABEL_BARCODE_HINT_TAG.localX,
        LABEL_BARCODE_HINT_TAG.localY,
        ANNOTATION_Z,
      ] as const,
    [],
  )

  useEffect(
    () => () => {
      tagTexture.dispose()
      pencilCircle.texture.dispose()
    },
    [tagTexture, pencilCircle],
  )

  useEffect(() => {
    if (inspecting) {
      // Restart the callout every time a slab is opened for inspection.
      hintTime.current = 0
      tagOpacity.current = 0
      return
    }
    hoverOpacity.current = 0
    setHovered(false)
    gl.domElement.style.cursor = ''
  }, [gl, inspecting])

  useFrame((state, delta) => {
    if (inspecting) hintTime.current += delta
    const elapsed = hintTime.current

    if (hoverMaterial.current) {
      const target = inspecting && hovered ? 0.3 : 0
      hoverOpacity.current += (target - hoverOpacity.current) * (1 - Math.exp(-delta / 0.2))
      hoverMaterial.current.opacity = hoverOpacity.current
    }

    // The pencil circle draws itself around the barcode shortly after the
    // inspection zoom settles, holds, then fades out together with the tag.
    // Hovering the barcode restarts the clock so the whole sequence replays.
    const fadeOut = 1 - smoothstep01((elapsed - 3.8) / 0.6)
    if (inspecting) {
      const progress = easeOutCubic(
        (elapsed - BARCODE_PENCIL_CIRCLE.drawStart) / BARCODE_PENCIL_CIRCLE.drawDuration,
      )
      pencilCircle.draw(progress)
    }
    if (circleMaterial.current) {
      circleMaterial.current.opacity = inspecting ? fadeOut : 0
    }

    // The tag floats to the left of the slab: it fades in once the circle
    // starts, holds for a few seconds, then fades out with the circle. Its
    // anchor is re-computed every frame so it hugs the slab's left edge with
    // a constant gap instead of drifting outward as the inspection zoom
    // scales the slab. When the space beside the slab runs out the tag
    // shrinks, and it only disappears entirely when there is genuinely no
    // room (narrow portrait layouts, where the bottom hint copy covers it).
    if (tagMaterial.current && tagMesh.current) {
      const camera = state.camera as PerspectiveCamera
      // Read the parent's world scale — the tag's own counter-scale below
      // must not feed back into this measurement.
      const worldScale = tagMesh.current.parent
        ? tagMesh.current.parent.getWorldScale(worldScaleScratch.current).x || 1
        : 1
      const halfHeight = Math.tan((camera.fov * Math.PI) / 360) * (camera.position.z - 0.8)
      const halfWidth = halfHeight * (state.size.width / state.size.height)
      const slabHalfWidth = 1.25 * worldScale
      const gap = 0.08
      const available = halfWidth - slabHalfWidth - gap - 0.1
      const naturalWidth = LABEL_BARCODE_HINT_TAG.width * worldScale
      const tagWorldWidth = Math.max(0, Math.min(naturalWidth, available))
      const fits = tagWorldWidth / LABEL_BARCODE_HINT_TAG.width >= 0.6
      tagMesh.current.scale.setScalar(
        Math.max(0.0001, naturalWidth > 0 ? tagWorldWidth / naturalWidth : 0),
      )
      tagMesh.current.position.x = -(slabHalfWidth + gap + tagWorldWidth / 2) / worldScale
      const facing = smoothstep01((Math.cos(modelRef.current?.rotation.y ?? 0) - 0.4) / 0.2)
      const intro = smoothstep01((elapsed - 0.75) / 0.35) * fadeOut
      const target = inspecting && fits ? intro * facing : 0
      tagOpacity.current += (target - tagOpacity.current) * (1 - Math.exp(-delta / 0.1))
      tagMaterial.current.opacity = tagOpacity.current
      tagMesh.current.position.y =
        tagPosition[1] + Math.sin(elapsed * 2.6) * 0.012 * tagOpacity.current
    }
  })

  const handlePointerEnter = () => {
    setHovered(true)
    gl.domElement.style.cursor = 'pointer'
    // Restart the annotation clock so the circle redraws and the tag
    // reappears with the full animation sequence.
    hintTime.current = 0
  }

  const handlePointerLeave = () => {
    setHovered(false)
    gl.domElement.style.cursor = inspecting ? 'grab' : ''
  }

  if (!inspecting || !link) return null

  return (
    <group>
      <mesh position={[hitPosition[0], hitPosition[1], hitPosition[2] + 0.001]}>
        <planeGeometry args={[LABEL_BARCODE_HIT_BOX.width, LABEL_BARCODE_HIT_BOX.height]} />
        <meshBasicMaterial
          ref={hoverMaterial}
          transparent
          color="#ffffff"
          opacity={0}
          depthWrite={false}
        />
      </mesh>
      <mesh
        position={[hitPosition[0], hitPosition[1], hitPosition[2] + 0.002]}
        onPointerDown={(event) => event.stopPropagation()}
        onPointerEnter={handlePointerEnter}
        onPointerLeave={handlePointerLeave}
        onClick={onOpen}
      >
        <planeGeometry args={[LABEL_BARCODE_HIT_BOX.width, LABEL_BARCODE_HIT_BOX.height]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
      {/* Decorative annotation layers — excluded from raycasting so they
          never interfere with the barcode hit target or slab drag gestures,
          and floated in front of the acrylic rails so nothing occludes them. */}
      <mesh
        position={[hitPosition[0], hitPosition[1], ANNOTATION_Z]}
        raycast={() => null}
      >
        <planeGeometry args={[BARCODE_PENCIL_CIRCLE.width, BARCODE_PENCIL_CIRCLE.height]} />
        <meshBasicMaterial
          ref={circleMaterial}
          map={pencilCircle.texture}
          transparent
          opacity={0}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
      <mesh
        ref={tagMesh}
        position={tagPosition}
        rotation={[0, 0, LABEL_BARCODE_HINT_TAG.tilt]}
        raycast={() => null}
      >
        <planeGeometry args={[LABEL_BARCODE_HINT_TAG.width, LABEL_BARCODE_HINT_TAG.height]} />
        <meshBasicMaterial
          ref={tagMaterial}
          map={tagTexture}
          transparent
          opacity={0}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
    </group>
  )
}

function finishTexture(texture: CanvasTexture) {
  texture.colorSpace = SRGBColorSpace
  texture.minFilter = LinearFilter
  texture.magFilter = LinearFilter
  texture.needsUpdate = true
  return texture
}

function createFrontLabel(title: string, type: string, year: string, index: number) {
  const canvas = document.createElement('canvas')
  canvas.width = FRONT_LABEL.canvasWidth
  canvas.height = FRONT_LABEL.canvasHeight
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
  const { startX, startY, barCount, barStep, barHeight, wideBarWidth, narrowBarWidth } =
    FRONT_LABEL.barcode
  for (let bar = 0; bar < barCount; bar += 1) {
    const width = bar % 3 === 0 ? wideBarWidth : narrowBarWidth
    context.fillRect(startX + bar * barStep, startY, width, barHeight)
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
  context.fillText('PORTFOLIO', canvas.width / 2, 220)

  return finishTexture(new CanvasTexture(canvas))
}

function wrapTextLines(
  context: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  maxLines: number,
): string[] {
  const words = text.split(' ')
  const lines: string[] = []
  let line = ''

  for (const word of words) {
    const testLine = line ? `${line} ${word}` : word
    if (context.measureText(testLine).width > maxWidth && line) {
      lines.push(line)
      line = word
      if (lines.length >= maxLines) break
    } else {
      line = testLine
    }
  }

  if (lines.length < maxLines && line) lines.push(line)
  return lines
}

function drawWrappedText(
  context: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
  maxLines = 3,
) {
  const lines = wrapTextLines(context, text, maxWidth, maxLines)
  lines.forEach((lineText, lineNumber) => {
    context.fillText(lineText, x, y + lineNumber * lineHeight)
  })
}

function drawImageCover(
  context: CanvasRenderingContext2D,
  image: CanvasImageSource,
  x: number,
  y: number,
  width: number,
  height: number,
  zoom = 1,
) {
  const img = image as HTMLImageElement
  const scale = Math.max(width / img.width, height / img.height) * zoom
  const drawWidth = img.width * scale
  const drawHeight = img.height * scale
  context.drawImage(image, x + (width - drawWidth) / 2, y + (height - drawHeight) / 2, drawWidth, drawHeight)
}

function drawImageContain(
  context: CanvasRenderingContext2D,
  image: CanvasImageSource,
  x: number,
  y: number,
  width: number,
  height: number,
  zoom = 1,
) {
  const img = image as HTMLImageElement
  const scale = Math.min(width / img.width, height / img.height) * zoom
  const drawWidth = img.width * scale
  const drawHeight = img.height * scale
  context.drawImage(image, x + (width - drawWidth) / 2, y + (height - drawHeight) / 2, drawWidth, drawHeight)
}

function createProjectCard(project: Project, index: number, mediaImage?: CanvasImageSource) {
  const {
    title,
    type,
    color,
    mediaFit,
    mediaZoom = 1,
    summary,
    abilityTitle,
    abilityText,
    attackTitle,
    attackMetric,
    attackText,
    weakness,
    resistance,
    illustrator = 'Ryan Chen',
    copyright = '©2026 Ryan Chen',
    level = 'LV. 1.0',
    hp = '99 HP',
  } = project

  const canvas = document.createElement('canvas')
  canvas.width = 900
  canvas.height = 1200
  const context = canvas.getContext('2d')!

  // The gold outer frame remains consistent while each project receives its
  // own collectible-card color treatment.
  context.fillStyle = '#e8c326'
  context.fillRect(0, 0, canvas.width, canvas.height)
  const gradient = context.createLinearGradient(50, 30, 850, 1170)
  gradient.addColorStop(0, color)
  gradient.addColorStop(0.55, '#e8e1d2')
  gradient.addColorStop(1, color)
  context.fillStyle = gradient
  context.fillRect(28, 28, 844, 1144)

  context.fillStyle = 'rgba(255,255,255,.14)'
  for (let dot = 0; dot < 260; dot += 1) {
    const x = 34 + ((dot * 67) % 824)
    const y = 34 + ((dot * 113) % 1124)
    context.fillRect(x, y, 3, 3)
  }

  // Card header
  const typeLabel = type.toUpperCase()
  const typeFont = '800 21px Arial'
  const typePaddingX = 18
  const typeBadgeX = 54
  const typeBadgeY = 48
  const typeBadgeHeight = 38
  const typeBadgeRadius = 18
  context.font = typeFont
  const typeBadgeWidth = context.measureText(typeLabel).width + typePaddingX * 2
  context.fillStyle = '#e8c326'
  context.beginPath()
  context.roundRect(typeBadgeX, typeBadgeY, typeBadgeWidth, typeBadgeHeight, typeBadgeRadius)
  context.fill()
  context.fillStyle = '#172333'
  context.fillText(typeLabel, typeBadgeX + typePaddingX, 74)
  context.font = '900 52px Arial'
  context.fillText(title.toUpperCase(), 56, 137)
  context.font = '800 23px Arial'
  context.fillText(level, 560, 127)
  context.font = '900 34px Arial'
  context.fillText(hp, 674, 128)
  context.beginPath()
  context.arc(827, 113, 29, 0, Math.PI * 2)
  context.fillStyle = '#182f55'
  context.fill()
  context.fillStyle = '#fff'
  context.textAlign = 'center'
  context.font = '900 18px Arial'
  context.fillText('</>', 827, 120)
  context.textAlign = 'left'

  // Framed project media
  context.fillStyle = '#b39116'
  context.fillRect(54, 165, 792, 435)
  context.fillStyle = '#f1d24b'
  context.fillRect(65, 176, 770, 413)
  const artwork = context.createRadialGradient(450, 340, 20, 450, 380, 460)
  artwork.addColorStop(0, color)
  artwork.addColorStop(1, '#0b1427')
  context.fillStyle = artwork
  context.fillRect(79, 190, 742, 385)

  const mediaX = 79
  const mediaY = 190
  const mediaWidth = 742
  const mediaHeight = 385

  if (mediaImage) {
    context.save()
    context.beginPath()
    context.rect(mediaX, mediaY, mediaWidth, mediaHeight)
    context.clip()
    if (mediaFit === 'contain') {
      drawImageContain(context, mediaImage, mediaX, mediaY, mediaWidth, mediaHeight, mediaZoom)
    } else {
      drawImageCover(context, mediaImage, mediaX, mediaY, mediaWidth, mediaHeight, mediaZoom)
    }
    context.restore()
  } else {
    context.fillStyle = 'rgba(255,255,255,.16)'
    context.font = '900 245px Arial'
    context.textAlign = 'center'
    context.fillText(`0${index + 1}`, 450, 446)
    context.fillStyle = '#fff'
    context.font = '900 46px Arial'
    context.fillText('PROJECT MEDIA', 450, 505)
    context.fillStyle = 'rgba(255,255,255,.72)'
    context.font = '700 20px Arial'
    context.fillText('SCREENSHOT / LOOPING GIF', 450, 542)
    context.textAlign = 'left'
  }

  context.strokeStyle = 'rgba(255,255,255,.38)'
  context.lineWidth = 2
  for (let ring = 0; ring < 4; ring += 1) {
    context.beginPath()
    context.ellipse(450, 370, 120 + ring * 62, 48 + ring * 28, -.22, 0, Math.PI * 2)
    context.stroke()
  }
  context.textAlign = 'left'

  // Architecture summary bar
  const summaryBarX = 74
  const summaryBarY = 615
  const summaryBarWidth = 752
  const summaryPaddingX = 24
  const summaryPaddingY = 8
  const summaryLineHeight = 22
  const summaryFontSize = 19
  context.font = `800 ${summaryFontSize}px Arial`
  const summaryLines = wrapTextLines(
    context,
    summary,
    summaryBarWidth - summaryPaddingX * 2,
    2,
  )
  const summaryBarHeight = Math.max(
    48,
    summaryPaddingY * 2 + (summaryLines.length - 1) * summaryLineHeight + summaryFontSize,
  )
  context.fillStyle = '#d6b52b'
  context.beginPath()
  context.roundRect(summaryBarX, summaryBarY, summaryBarWidth, summaryBarHeight, 9)
  context.fill()
  context.fillStyle = '#172333'
  context.textAlign = 'center'
  const summaryTextStartY = summaryBarY + summaryPaddingY + summaryFontSize - 4
  summaryLines.forEach((line, lineIndex) => {
    context.fillText(line, summaryBarX + summaryBarWidth / 2, summaryTextStartY + lineIndex * summaryLineHeight)
  })
  context.textAlign = 'left'

  // Primary ability
  context.fillStyle = '#b5162f'
  context.font = '900 32px Georgia'
  context.fillText(abilityTitle, 72, 715)
  context.fillStyle = '#172333'
  context.font = '800 21px Arial'
  drawWrappedText(context, abilityText, 74, 750, 748, 26, 3)
  context.strokeStyle = 'rgba(23,35,51,.5)'
  context.lineWidth = 4
  context.beginPath()
  context.moveTo(70, 823)
  context.lineTo(830, 823)
  context.stroke()

  // Secondary attack and technology energy costs
  const energyColors = ['#d7193f', '#6f9fbe', '#18334e']
  energyColors.forEach((energyColor, energyIndex) => {
    context.beginPath()
    context.arc(92 + energyIndex * 52, 866, 19, 0, Math.PI * 2)
    context.fillStyle = energyColor
    context.fill()
    context.strokeStyle = '#f5df77'
    context.lineWidth = 4
    context.stroke()
  })
  context.fillStyle = '#172333'
  context.font = '900 31px Georgia'
  context.fillText(attackTitle, 240, 876)
  context.textAlign = 'right'
  context.font = '900 40px Arial'
  context.fillText(attackMetric, 830, 877)
  context.textAlign = 'left'
  context.font = '800 20px Arial'
  drawWrappedText(context, attackText, 74, 918, 748, 25, 3)

  // Footer stats
  context.strokeStyle = 'rgba(23,35,51,.58)'
  context.lineWidth = 4
  context.beginPath()
  context.moveTo(70, 990)
  context.lineTo(830, 990)
  context.stroke()
  context.fillStyle = '#172333'
  context.font = '800 17px Arial'
  context.fillText('weakness', 74, 1026)
  context.font = '800 17px Arial'
  context.fillText(weakness, 196, 1026)
  context.font = '800 17px Arial'
  context.fillText('resistance', 74, 1060)
  context.font = '800 17px Arial'
  context.fillText(resistance, 196, 1060)
  context.font = '800 14px Arial'
  context.fillText(`Illus. ${illustrator}`, 72, 1127)
  context.textAlign = 'center'
  context.fillText(copyright, 450, 1127)
  context.textAlign = 'right'
  context.fillText(`${String(index + 1).padStart(3, '0')} / 100`, 826, 1127)

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
  const loadedProjectImage = useTexture(project.img)
  const projectCard = useMemo(
    () => createProjectCard(project, index, loadedProjectImage.image as HTMLImageElement),
    [index, project, loadedProjectImage],
  )
  const loadedProjectCardBack = useTexture(pokemonCardBack)
  const projectCardBack = useMemo(() => {
    const texture = loadedProjectCardBack.clone()
    texture.colorSpace = SRGBColorSpace
    texture.anisotropy = 8
    texture.needsUpdate = true
    return texture
  }, [loadedProjectCardBack])

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

  const handleBarcodeClick = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation()
    if (project.link) window.open(project.link, '_blank', 'noopener,noreferrer')
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

      <mesh position={FRONT_LABEL.position}>
        <planeGeometry args={[FRONT_LABEL.planeWidth, FRONT_LABEL.planeHeight]} />
        <meshBasicMaterial map={frontLabel} toneMapped={false} />
      </mesh>
      {project.link ? (
        <BarcodeLinkHint
          link={project.link}
          inspecting={inspecting}
          onOpen={handleBarcodeClick}
          modelRef={model}
        />
      ) : null}
      <mesh position={[0, -0.34, 0]} castShadow>
        <boxGeometry args={[1.78, 2.38, 0.085]} />
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

const SLAB_HALF_HEIGHT = 3.65 / 2
const INSPECTION_SLAB_Y = 0.18
const INSPECTION_SLAB_Z = 0.8
const INSPECTION_CAMERA_Y = 0.05
// Half the visible world height at the slab's depth while inspecting
// (fov 38, camera z 8.4).
const INSPECTION_VIEW_HALF_HEIGHT = Math.tan((38 * Math.PI) / 360) * (8.4 - INSPECTION_SLAB_Z)
// The slab rests slightly above the camera's vertical center, so the pan
// limits that align the slab's edges with the viewport are asymmetric.
const INSPECTION_CENTER_BIAS = INSPECTION_SLAB_Y - INSPECTION_CAMERA_Y

function CarouselRig({
  selectedIndex,
  inspecting,
  inspectionZoom,
  inspectionPan,
  canInspect,
  onInspect,
}: {
  selectedIndex: number
  inspecting: boolean
  inspectionZoom: number
  inspectionPan: { current: number }
  canInspect: boolean
  onInspect: () => void
}) {
  const items = useRef<Array<Group | null>>([])
  const phase = useRef(0)

  useFrame((state, delta) => {
    const camera = state.camera as PerspectiveCamera
    const targetFov = inspecting ? 38 : 54
    const cameraDamping = 1 - Math.exp(-delta * 5)
    const nextFov = camera.fov + (targetFov - camera.fov) * cameraDamping
    if (Math.abs(nextFov - camera.fov) > 0.001) {
      camera.fov = nextFov
      camera.updateProjectionMatrix()
    }
    // The standard crop is centered together with the 132px progress rail,
    // so its visual midpoint sits 66px above the full canvas midpoint.
    // Convert that pixel offset to world units to keep the slabs centered at
    // every viewport height without changing the WebGL surface dimensions.
    const viewportHeight = state.viewport.getCurrentViewport(camera, [0, 0, 0]).height
    const cropCenterOffset = inspecting ? 0 : viewportHeight * 66 / state.size.height
    const targetCameraY = 0.05 - cropCenterOffset
    camera.position.y += (targetCameraY - camera.position.y) * cameraDamping

    let distance = selectedIndex - phase.current
    while (distance > projects.length / 2) distance -= projects.length
    while (distance < -projects.length / 2) distance += projects.length
    phase.current += distance * (1 - Math.exp(-delta * 4.8))

    items.current.forEach((item, index) => {
      if (!item) return
      item.visible = !inspecting || index === selectedIndex
      if (inspecting && index === selectedIndex) {
        item.position.x += (0 - item.position.x) * (1 - Math.exp(-delta * 5))
        item.position.z += (INSPECTION_SLAB_Z - item.position.z) * (1 - Math.exp(-delta * 5))
        // Keep the complete slab inside the camera's vertical field of view.
        // A taller inspection stage increases its rendered pixel size without
        // pushing the slab's label or lower edge outside the viewport.
        const inspectionScale = 1.32 * (1 + inspectionZoom * 0.1)
        const zoomScale =
          item.scale.x + (inspectionScale - item.scale.x) * (1 - Math.exp(-delta * 5))
        item.scale.setScalar(zoomScale)
        // Vertical pan while zoomed past 100%: clamp the pan target so the
        // slab's top and bottom edges can never scroll past the viewport,
        // then ease the slab toward it. Collapses to zero when the slab fits.
        const viewHalfHeight =
          Math.tan((camera.fov * Math.PI) / 360) * (camera.position.z - item.position.z)
        const overflow = Math.max(0, SLAB_HALF_HEIGHT * zoomScale - viewHalfHeight)
        const centerBias = INSPECTION_SLAB_Y - camera.position.y
        const panMin = overflow > 0 ? Math.min(0, -overflow - centerBias) : 0
        const panMax = overflow > 0 ? Math.max(0, overflow - centerBias) : 0
        inspectionPan.current = Math.max(panMin, Math.min(panMax, inspectionPan.current))
        item.position.y +=
          (INSPECTION_SLAB_Y + inspectionPan.current - item.position.y) *
          (1 - Math.exp(-delta * 5))
        return
      }

      const angle = (index - phase.current) * (Math.PI * 2 / projects.length)
      const depth = (1 - Math.cos(angle)) * 0.5
      const targetX = Math.sin(angle) * 3.65
      const targetY = -depth * 0.12
      const targetZ = -depth * 3.1
      const movement = 1 - Math.exp(-delta * 6)
      item.position.x += (targetX - item.position.x) * movement
      item.position.y += (targetY - item.position.y) * movement
      item.position.z += (targetZ - item.position.z) * movement
      // Scale the complete slab group so its label typography, internal
      // spacing, and barcode hit target retain their exact proportions.
      const scale = 1.25 - depth * 0.2
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
  const [inspectionZoom, setInspectionZoom] = useState(0)
  const [storyActive, setStoryActive] = useState(false)
  const inspectionPan = useRef(0)
  const story = useRef<HTMLDivElement>(null)
  const progressFill = useRef<HTMLDivElement>(null)
  const progressRunner = useRef<HTMLDivElement>(null)
  const selectionTimer = useRef<number | null>(null)

  useEffect(() => () => {
    if (selectionTimer.current !== null) window.clearTimeout(selectionTimer.current)
  }, [])

  const closeInspection = () => {
    setInspecting(false)
    setInspectionZoom(0)
    inspectionPan.current = 0
  }

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

    // While zoomed past 100%, wheel/trackpad and arrow keys pan the slab
    // vertically instead of scrolling the page. The pan target is clamped so
    // the slab's top and bottom edges can never scroll past the viewport.
    const applyPanDelta = (deltaPx: number) => {
      const scale = 1.32 * (1 + inspectionZoom * 0.1)
      const overflow = Math.max(0, SLAB_HALF_HEIGHT * scale - INSPECTION_VIEW_HALF_HEIGHT)
      if (overflow <= 0) return
      const panMin = Math.min(0, -overflow - INSPECTION_CENTER_BIAS)
      const panMax = Math.max(0, overflow - INSPECTION_CENTER_BIAS)
      const worldPerPixel = (INSPECTION_VIEW_HALF_HEIGHT * 2) / window.innerHeight
      inspectionPan.current = Math.max(
        panMin,
        Math.min(panMax, inspectionPan.current + deltaPx * worldPerPixel),
      )
    }

    const handleWheel = (event: WheelEvent) => {
      event.preventDefault()
      const unit = event.deltaMode === 1 ? 16 : 1
      applyPanDelta(event.deltaY * unit)
    }
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
      if (event.key === 'ArrowDown') applyPanDelta(120)
      else if (event.key === 'ArrowUp') applyPanDelta(-120)
      else if (event.key === 'PageDown') applyPanDelta(window.innerHeight * 0.8)
      else if (event.key === 'PageUp') applyPanDelta(-window.innerHeight * 0.8)
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
      closeInspection()
      window.requestAnimationFrame(() => destination.scrollIntoView({ behavior: 'smooth' }))
    }

    document.addEventListener('click', allowHeaderNavigation, true)
    window.addEventListener('wheel', handleWheel, { passive: false })
    window.addEventListener('touchmove', preventScroll, { passive: false })
    window.addEventListener('keydown', preventScrollKeys)
    window.addEventListener('scroll', holdScrollPosition, { passive: true })
    return () => {
      document.removeEventListener('click', allowHeaderNavigation, true)
      window.removeEventListener('wheel', handleWheel)
      window.removeEventListener('touchmove', preventScroll)
      window.removeEventListener('keydown', preventScrollKeys)
      window.removeEventListener('scroll', holdScrollPosition)
    }
  }, [inspecting, inspectionZoom])

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
      closeInspection()
      selectionTimer.current = window.setTimeout(moveToStoryPoint, 420)
    } else {
      moveToStoryPoint()
    }
  }

  return (
    <div className="slab-story" ref={story}>
      <div className="slab-story-sticky">
        <div className={`slab-carousel-shell${inspecting ? ' is-inspecting' : ''}`}>
          <div className={`slab-carousel${storyActive ? ' is-inspectable' : ''}${inspecting ? ' is-inspecting' : ''}`}>
            <div className="slab-canvas-stage">
              <Canvas
                camera={{ position: [0, 0.05, 8.4], fov: 54 }}
                dpr={[1, 1.75]}
                shadows
                gl={{ antialias: true, alpha: true }}
              >
                {inspecting ? <color attach="background" args={[new Color('#edf1f3')]} /> : null}
                <ambientLight intensity={1.3} />
                <directionalLight position={[-4, 6, 7]} intensity={2.4} castShadow />
                <directionalLight position={[5, -2, 5]} intensity={1.2} color="#9ec8e0" />
                <pointLight position={[0, 1, 5]} intensity={1.5} color="#ffffff" />
                <CarouselRig
                  selectedIndex={selectedIndex}
                  inspecting={inspecting}
                  inspectionZoom={inspectionZoom}
                  inspectionPan={inspectionPan}
                  canInspect={storyActive}
                  onInspect={() => {
                    if (storyActive) {
                      setInspectionZoom(0)
                      inspectionPan.current = 0
                      setInspecting(true)
                    }
                  }}
                />
              </Canvas>
            </div>
            {inspecting ? (
              <div className="inspection-controls">
                <button type="button" onClick={closeInspection}>← Back to story</button>
                <div className="inspection-zoom-controls" aria-label="Inspection zoom controls">
                  <button
                    type="button"
                    className="inspection-zoom-button"
                    aria-label="Zoom out"
                    disabled={inspectionZoom === 0}
                    onClick={() => setInspectionZoom((zoom) => Math.max(0, zoom - 1))}
                  >
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <circle cx="10.5" cy="10.5" r="6.5" />
                      <path d="M6.8 10.5h7.4M15.3 15.3 21 21" />
                    </svg>
                  </button>
                  <span aria-live="polite">{100 + inspectionZoom * 10}%</span>
                  <button
                    type="button"
                    className="inspection-zoom-button"
                    aria-label="Zoom in"
                    disabled={inspectionZoom === 5}
                    onClick={() => setInspectionZoom((zoom) => Math.min(5, zoom + 1))}
                  >
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <circle cx="10.5" cy="10.5" r="6.5" />
                      <path d="M6.8 10.5h7.4M10.5 6.8v7.4M15.3 15.3 21 21" />
                    </svg>
                  </button>
                </div>
                <div className="inspection-controls-copy">
                  <span>Drag to rotate · Release to snap</span>
                  <span className="inspection-controls-barcode">Tap barcode to open project ↗</span>
                </div>
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
