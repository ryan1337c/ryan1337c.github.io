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
  type Texture,
  Vector3,
} from 'three'
import cardBack from './assets/back.webp'
import meiganImg from './assets/meigan.webp'
import omniImg from './assets/omni.webp'
import fontimizeImg from './assets/fontimize.png'
import kirbyImg from './assets/kirby.webp'


/** Self-hosted Geist face loaded in main.tsx; quoted for canvas font strings. */
const SITE_FONT = '"Geist Variable"'

let geistReadyPromise: Promise<void> | null = null

function ensureGeistLoaded() {
  if (!geistReadyPromise) {
    const specs = [
      `700 48px ${SITE_FONT}`,
      `800 52px ${SITE_FONT}`,
      `900 52px ${SITE_FONT}`,
      `900 italic 96px ${SITE_FONT}`,
    ]
    geistReadyPromise = Promise.all(specs.map((spec) => document.fonts.load(spec)))
      .then(() => undefined)
      .catch(() => undefined)
  }
  return geistReadyPromise
}

/**
 * Handwriting face for the "CLICK TO SEE REPO" callout. Kalam 700 is
 * self-hosted (imported in main.tsx) because iOS has neither Segoe Print nor
 * Comic Sans and would otherwise fall back to a cursive script face.
 */
const HANDWRITING_FONT = `'Kalam', 'Segoe Print', 'Comic Sans MS', cursive`
const HANDWRITING_WEIGHT = 700

let handwritingReadyPromise: Promise<void> | null = null

function ensureHandwritingLoaded() {
  if (!handwritingReadyPromise) {
    handwritingReadyPromise = document.fonts
      .load(`${HANDWRITING_WEIGHT} 84px 'Kalam'`, 'CLICK TO SEE REPO')
      .then(() => undefined)
      .catch(() => undefined)
  }
  return handwritingReadyPromise
}

/** True once Kalam is available, so the callout texture is drawn in it. */
function useHandwritingReady() {
  const [ready, setReady] = useState(() =>
    document.fonts.check(`${HANDWRITING_WEIGHT} 84px 'Kalam'`, 'CLICK TO SEE REPO'),
  )
  useEffect(() => {
    if (ready) return
    let cancelled = false
    void ensureHandwritingLoaded().then(() => {
      if (!cancelled) setReady(true)
    })
    return () => {
      cancelled = true
    }
  }, [ready])
  return ready
}

/** True once the variable Geist face is available for canvas measurement/drawing. */
function useGeistReady() {
  const [ready, setReady] = useState(() => document.fonts.check(`900 48px ${SITE_FONT}`))
  useEffect(() => {
    if (ready) return
    let cancelled = false
    void ensureGeistLoaded().then(() => {
      if (!cancelled) setReady(true)
    })
    return () => {
      cancelled = true
    }
  }, [ready])
  return ready
}

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

// On narrow screens there is no room beside the slab, so the callout sits
// above the slab instead, with its arrow curving down onto the barcode. Sizes
// are in slab-local units (the slab is 2.5 x 3.65).
const ABOVE_HINT_TAG = {
  canvasWidth: 960,
  canvasHeight: 420,
  width: 1.55,
  height: 1.55 / (960 / 420),
  gap: 0.05,
  // Canvas x of the arrow tip, used to line the tip up with the barcode.
  tipCanvasX: 300,
}
const ABOVE_HINT_RESERVE = ABOVE_HINT_TAG.height + ABOVE_HINT_TAG.gap

/** Live inspection layout, written by CarouselRig every frame. */
type InspectionLayout = {
  tagMode: 'side' | 'above'
  panMin: number
  panMax: number
  worldPerPx: number
}

/** DOM measurements the 3D layout needs (bars that overlap the canvas). */
type StageMetrics = {
  railPx: number
  instructionsPx: number
  controlsPx: number
}

/** Phones and tablets: cap the WebGL pixel ratio to keep frame rates up. */
function isCompactDevice() {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia('(max-width: 900px), (pointer: coarse)').matches
  )
}

function setRefValue<T>(ref: { current: T }, value: T) {
  ref.current = value
}

function setCanvasCursor(canvas: HTMLCanvasElement, cursor: string) {
  canvas.style.cursor = cursor
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

function createBarcodeHintTagTexture(variant: 'side' | 'above' = 'side') {
  const canvas = document.createElement('canvas')
  canvas.width = 960
  canvas.height = variant === 'above' ? ABOVE_HINT_TAG.canvasHeight : 280
  const context = canvas.getContext('2d')!

  const ink = '#4d5c3c'
  context.fillStyle = ink
  context.strokeStyle = ink
  context.lineCap = 'round'
  context.lineJoin = 'round'
  context.textBaseline = 'middle'

  // Hand-style lettering with a tiny per-letter jitter so the callout reads
  // as an annotation rather than UI chrome.
  const label = 'CLICK TO SEE REPO'
  const fontFamily = HANDWRITING_FONT
  let fontSize = 84
  context.font = `${HANDWRITING_WEIGHT} ${fontSize}px ${fontFamily}`
  while (context.measureText(label).width > canvas.width - 160 && fontSize > 40) {
    fontSize -= 4
    context.font = `${HANDWRITING_WEIGHT} ${fontSize}px ${fontFamily}`
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

  // Sketchy swoosh arrow pointing right toward the pencil circle (or, for
  // the narrow-screen variant, curving down onto the barcode below).
  const arrowSegments = 26
  const arrowPoints: Array<[number, number]> = []
  for (let segment = 0; segment <= arrowSegments; segment += 1) {
    const t = segment / arrowSegments
    if (variant === 'above') {
      arrowPoints.push([
        600 + (ABOVE_HINT_TAG.tipCanvasX - 600) * t + Math.sin(t * Math.PI) * 70,
        172 + (canvas.height - 26 - 172) * t + Math.sin(t * 9 + 1.2) * 2.5,
      ])
    } else {
      arrowPoints.push([
        150 + (canvas.width - 30 - 150) * t,
        188 + Math.sin(t * Math.PI) * 24 + Math.sin(t * 9 + 1.2) * 2.5,
      ])
    }
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
    context.strokeStyle = `rgba(77, 92, 60, ${pass === 0 ? 0.6 + 0.4 * noise : 0.16})`
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

function BarcodeLinkHint(props: {
  link: string
  inspecting: boolean
  onOpen: (event: ThreeEvent<MouseEvent>) => void
  modelRef: { current: Group | null }
  layoutRef: { current: InspectionLayout }
}) {
  // Mounted only while inspecting, so hover and animation state start fresh
  // every time a slab is opened.
  if (!props.inspecting || !props.link) return null
  return <ActiveBarcodeLinkHint {...props} />
}

function ActiveBarcodeLinkHint({
  onOpen,
  modelRef,
  layoutRef,
}: {
  link: string
  inspecting: boolean
  onOpen: (event: ThreeEvent<MouseEvent>) => void
  modelRef: { current: Group | null }
  layoutRef: { current: InspectionLayout }
}) {
  const inspecting = true
  const { gl } = useThree()
  const [hovered, setHovered] = useState(false)
  const hoverOpacity = useRef(0)
  const hoverMaterial = useRef<MeshBasicMaterial>(null)
  const hintTime = useRef(0)
  const tagOpacity = useRef(0)
  const tagMaterial = useRef<MeshBasicMaterial>(null)
  const tagMesh = useRef<Mesh>(null)
  const aboveTagOpacity = useRef(0)
  const aboveTagMaterial = useRef<MeshBasicMaterial>(null)
  const aboveTagMesh = useRef<Mesh>(null)
  const circleMaterial = useRef<MeshBasicMaterial>(null)
  const worldScaleScratch = useRef(new Vector3())
  // Redraw the callout once Kalam has loaded, in case it was first drawn
  // with a fallback face.
  const handwritingReady = useHandwritingReady()
  const tagTexture = useMemo(() => {
    void handwritingReady
    return createBarcodeHintTagTexture()
  }, [handwritingReady])
  const aboveTagTexture = useMemo(() => {
    void handwritingReady
    return createBarcodeHintTagTexture('above')
  }, [handwritingReady])
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

  // Line the down-arrow tip up with the barcode, keeping the tag over the slab.
  const aboveTagPosition = useMemo(() => {
    const tipOffset = (ABOVE_HINT_TAG.tipCanvasX / ABOVE_HINT_TAG.canvasWidth - 0.5) * ABOVE_HINT_TAG.width
    const limit = 1.25 - ABOVE_HINT_TAG.width / 2
    const x = Math.max(-limit, Math.min(limit, hitPosition[0] - tipOffset))
    return [x, SLAB_HALF_HEIGHT + ABOVE_HINT_TAG.gap + ABOVE_HINT_TAG.height / 2, ANNOTATION_Z] as const
  }, [hitPosition])

  useEffect(
    () => () => {
      tagTexture.dispose()
      aboveTagTexture.dispose()
      pencilCircle.texture.dispose()
    },
    [tagTexture, aboveTagTexture, pencilCircle],
  )

  // Reset the cursor when inspection ends and this hint unmounts.
  useEffect(() => () => setCanvasCursor(gl.domElement, ''), [gl])

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
      const sideMode = layoutRef.current.tagMode === 'side'
      const fits = sideMode && tagWorldWidth / LABEL_BARCODE_HINT_TAG.width >= 0.6
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

      if (aboveTagMaterial.current && aboveTagMesh.current) {
        const aboveTarget = inspecting && !sideMode ? intro * facing : 0
        aboveTagOpacity.current +=
          (aboveTarget - aboveTagOpacity.current) * (1 - Math.exp(-delta / 0.1))
        aboveTagMaterial.current.opacity = aboveTagOpacity.current
        aboveTagMesh.current.position.y =
          aboveTagPosition[1] + Math.sin(elapsed * 2.6) * 0.012 * aboveTagOpacity.current
      }
    }
  })

  const handlePointerEnter = () => {
    setHovered(true)
    setCanvasCursor(gl.domElement, 'pointer')
    // Restart the annotation clock so the circle redraws and the tag
    // reappears with the full animation sequence.
    hintTime.current = 0
  }

  const handlePointerLeave = () => {
    setHovered(false)
    setCanvasCursor(gl.domElement, 'grab')
  }

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
      <mesh
        ref={aboveTagMesh}
        position={aboveTagPosition}
        rotation={[0, 0, LABEL_BARCODE_HINT_TAG.tilt]}
        raycast={() => null}
      >
        <planeGeometry args={[ABOVE_HINT_TAG.width, ABOVE_HINT_TAG.height]} />
        <meshBasicMaterial
          ref={aboveTagMaterial}
          map={aboveTagTexture}
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

  context.fillStyle = '#4d5c3c'
  context.fillRect(0, 0, canvas.width, canvas.height)
  context.fillStyle = '#f5f3ed'
  context.fillRect(24, 24, canvas.width - 48, canvas.height - 48)
  context.fillStyle = '#252521'
  context.font = '700 48px "Geist Variable"'
  context.fillText(`${year}  —  ${type.toUpperCase()}`, 52, 88)
  context.font = '800 46px "Geist Variable"'
  context.fillText(title.toUpperCase(), 52, 153)
  context.font = '700 32px "Geist Variable"'
  context.fillText('PERSONAL PROJECT', 52, 210)
  context.textAlign = 'right'
  context.font = '800 48px "Geist Variable"'
  context.fillText(`#00${index + 1}`, 968, 88)
  context.font = '700 38px "Geist Variable"'
  context.fillText('GEM MINT 10', 968, 153)

  context.textAlign = 'left'
  const { startX, startY, barCount, barStep, barHeight, wideBarWidth, narrowBarWidth } =
    FRONT_LABEL.barcode
  for (let bar = 0; bar < barCount; bar += 1) {
    const width = bar % 3 === 0 ? wideBarWidth : narrowBarWidth
    context.fillRect(startX + bar * barStep, startY, width, barHeight)
  }
  context.fillStyle = '#252521'
  context.font = '900 italic 56px "Geist Variable"'
  context.fillText('P', 520, 267)
  context.fillStyle = '#4d5c3c'
  context.fillText('F', 560, 267)

  return finishTexture(new CanvasTexture(canvas))
}

function createBackLabel() {
  const canvas = document.createElement('canvas')
  canvas.width = 1024
  canvas.height = 300
  const context = canvas.getContext('2d')!

  context.fillStyle = '#deddd4'
  context.fillRect(0, 0, canvas.width, canvas.height)
  context.fillStyle = '#252521'
  context.font = '900 italic 96px "Geist Variable"'
  context.fillText('P', 427, 142)
  context.fillStyle = '#4d5c3c'
  context.fillText('F', 493, 142)
  context.fillStyle = '#252521'
  context.textAlign = 'center'
  context.font = '700 34px "Geist Variable"'
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
  const typeFont = '800 21px "Geist Variable"'
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
  context.font = '900 52px "Geist Variable"'
  context.fillText(title.toUpperCase(), 56, 137)
  context.font = '800 23px "Geist Variable"'
  context.fillText(level, 560, 127)
  context.font = '900 34px "Geist Variable"'
  context.fillText(hp, 674, 128)
  context.beginPath()
  context.arc(827, 113, 29, 0, Math.PI * 2)
  context.fillStyle = '#182f55'
  context.fill()
  context.fillStyle = '#fff'
  context.textAlign = 'center'
  context.font = '900 18px "Geist Variable"'
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
    context.font = '900 245px "Geist Variable"'
    context.textAlign = 'center'
    context.fillText(`0${index + 1}`, 450, 446)
    context.fillStyle = '#fff'
    context.font = '900 46px "Geist Variable"'
    context.fillText('PROJECT MEDIA', 450, 505)
    context.fillStyle = 'rgba(255,255,255,.72)'
    context.font = '700 20px "Geist Variable"'
    context.fillText('SCREENSHOT / LOOPING GIF', 450, 542)
    context.textAlign = 'left'
  }

  // Architecture summary bar
  const summaryBarX = 74
  const summaryBarY = 615
  const summaryBarWidth = 752
  const summaryPaddingX = 24
  const summaryPaddingY = 8
  const summaryLineHeight = 22
  const summaryFontSize = 19
  context.font = `800 ${summaryFontSize}px "Geist Variable"`
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
  context.font = '800 21px "Geist Variable"'
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
  context.font = '900 40px "Geist Variable"'
  context.fillText(attackMetric, 830, 877)
  context.textAlign = 'left'
  context.font = '800 20px "Geist Variable"'
  drawWrappedText(context, attackText, 74, 918, 748, 25, 3)

  // Footer stats
  context.strokeStyle = 'rgba(23,35,51,.58)'
  context.lineWidth = 4
  context.beginPath()
  context.moveTo(70, 990)
  context.lineTo(830, 990)
  context.stroke()
  context.fillStyle = '#172333'
  context.font = '800 17px "Geist Variable"'
  context.fillText('weakness', 74, 1026)
  context.font = '800 17px "Geist Variable"'
  context.fillText(weakness, 196, 1026)
  context.font = '800 17px "Geist Variable"'
  context.fillText('resistance', 74, 1060)
  context.font = '800 17px "Geist Variable"'
  context.fillText(resistance, 196, 1060)
  context.font = '800 14px "Geist Variable"'
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
        color="#deddd4"
        transparent
        opacity={0.44}
        roughness={0.12}
        metalness={0.04}
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
  inspectionPan,
  layoutRef,
  cardBackTexture,
}: {
  project: (typeof projects)[number]
  index: number
  active: boolean
  inspecting: boolean
  onInspect: () => void
  inspectionPan: { current: number }
  layoutRef: { current: InspectionLayout }
  cardBackTexture: Texture
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
    startPan: 0,
    touchPan: false,
  })
  const snapRotation = useRef({ x: 0, y: 0 })
  const geistReady = useGeistReady()
  const frontLabel = useMemo(() => {
    // Rebuild once Geist is available so labels aren't measured in a fallback face.
    void geistReady
    return createFrontLabel(project.title, project.type, project.year, index)
  }, [index, project, geistReady])
  const backLabel = useMemo(() => {
    void geistReady
    return createBackLabel()
  }, [geistReady])
  const loadedProjectImage = useTexture(project.img)
  const projectCard = useMemo(() => {
    void geistReady
    return createProjectCard(project, index, loadedProjectImage.image as HTMLImageElement)
  }, [index, project, loadedProjectImage, geistReady])

  useEffect(
    () => () => {
      frontLabel.dispose()
      backLabel.dispose()
      projectCard.dispose()
    },
    [backLabel, frontLabel, projectCard],
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
      startPan: inspectionPan.current,
      // Touch screens have no wheel: when zoomed past the screen, a vertical
      // finger drag pans the slab instead of tilting it.
      touchPan:
        inspecting &&
        event.pointerType !== 'mouse' &&
        layoutRef.current.panMax - layoutRef.current.panMin > 0.001,
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
    if (drag.current.touchPan) {
      const { panMin, panMax, worldPerPx } = layoutRef.current
      setRefValue(
        inspectionPan,
        Math.max(panMin, Math.min(panMax, drag.current.startPan - distanceY * worldPerPx)),
      )
      return
    }
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
      <RoundedBox args={[2.5, 3.65, 0.2]} radius={0.13} smoothness={8}>
        <meshPhysicalMaterial
          color="#faf9f5"
          transparent
          opacity={0.32}
          roughness={0.08}
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
          layoutRef={layoutRef}
        />
      ) : null}
      <mesh position={[0, -0.34, 0]}>
        <boxGeometry args={[1.78, 2.38, 0.085]} />
        <meshStandardMaterial attach="material-0" color="#252521" roughness={0.72} />
        <meshStandardMaterial attach="material-1" color="#252521" roughness={0.72} />
        <meshStandardMaterial attach="material-2" color="#6b6a61" roughness={0.68} />
        <meshStandardMaterial attach="material-3" color="#252521" roughness={0.72} />
        <meshStandardMaterial
          attach="material-4"
          map={projectCard}
          roughness={0.55}
          metalness={0.02}
        />
        <meshStandardMaterial
          attach="material-5"
          map={cardBackTexture}
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
const SLAB_HALF_WIDTH = 2.5 / 2
const INSPECTION_SLAB_Y = 0.18
const INSPECTION_SLAB_Z = 0.8
const INSPECTION_BASE_SCALE = 1.32
const STORY_SLAB_SCALE = 1.25
const RIG_OFFSET_Y = -0.05

function CarouselRig({
  selectedIndex,
  inspecting,
  inspectionZoom,
  inspectionPan,
  canInspect,
  onInspect,
  stageMetrics,
  layoutRef,
}: {
  selectedIndex: number
  inspecting: boolean
  inspectionZoom: number
  inspectionPan: { current: number }
  canInspect: boolean
  onInspect: () => void
  stageMetrics: { current: StageMetrics }
  layoutRef: { current: InspectionLayout }
}) {
  const items = useRef<Array<Group | null>>([])
  const rig = useRef<Group>(null)
  const phase = useRef(0)

  // One card-back texture shared by every slab (previously each slab cloned
  // it, which uploaded the same image to the GPU once per slab).
  const loadedCardBack = useTexture(cardBack)
  const cardBackTexture = useMemo(() => {
    const texture = loadedCardBack.clone()
    texture.colorSpace = SRGBColorSpace
    texture.anisotropy = 8
    texture.needsUpdate = true
    return texture
  }, [loadedCardBack])
  useEffect(() => () => cardBackTexture.dispose(), [cardBackTexture])

  useFrame((state, delta) => {
    const camera = state.camera as PerspectiveCamera
    const targetFov = inspecting ? 38 : 54
    const cameraDamping = 1 - Math.exp(-delta * 5)
    const nextFov = camera.fov + (targetFov - camera.fov) * cameraDamping
    if (Math.abs(nextFov - camera.fov) > 0.001) {
      camera.fov = nextFov
      camera.updateProjectionMatrix()
    }
    // The standard crop is centered together with the progress rail, so its
    // visual midpoint sits half a rail above the full canvas midpoint. On
    // short or narrow screens the slabs are also scaled down (and nudged) so
    // the whole focused slab stays clear of the instructions bar. Large
    // screens keep the original scale and centering.
    const { width: stageWidth, height: stageHeight } = state.size
    const metrics = stageMetrics.current
    const viewportHeight = state.viewport.getCurrentViewport(camera, [0, 0, 0]).height
    const storyWorldPerPx = viewportHeight / stageHeight
    const cropHeight = Math.min(stageHeight * 0.78, stageHeight - metrics.railPx)
    const cropTop = Math.max(0, (stageHeight - cropHeight - metrics.railPx) / 2)
    const regionTop = cropTop + 8
    const regionBottom = cropTop + cropHeight - metrics.instructionsPx - 8
    const slabHeightPx = (SLAB_HALF_HEIGHT * 2 * STORY_SLAB_SCALE) / storyWorldPerPx
    const slabWidthPx = (SLAB_HALF_WIDTH * 2 * STORY_SLAB_SCALE) / storyWorldPerPx
    const storyFit = Math.max(
      0.35,
      Math.min(1, (regionBottom - regionTop) / slabHeightPx, (stageWidth * 0.86) / slabWidthPx),
    )
    const halfSlabPx = (slabHeightPx * storyFit) / 2
    const cropCenter = cropTop + cropHeight / 2
    const storyCenterPx =
      regionTop + halfSlabPx > regionBottom - halfSlabPx
        ? (regionTop + regionBottom) / 2
        : Math.max(regionTop + halfSlabPx, Math.min(regionBottom - halfSlabPx, cropCenter))
    const cropCenterOffset = inspecting ? 0 : (stageHeight / 2 - storyCenterPx) * storyWorldPerPx
    const targetCameraY = 0.05 - cropCenterOffset
    camera.position.y += (targetCameraY - camera.position.y) * cameraDamping
    if (rig.current) {
      const rigScale = inspecting ? 1 : storyFit
      rig.current.scale.setScalar(rig.current.scale.x + (rigScale - rig.current.scale.x) * cameraDamping)
    }

    // Inspection layout: fit the slab (plus the callout when it sits above
    // the slab) inside the area between the top edge and the controls bar,
    // by both width and height.
    const viewHalfHeight =
      Math.tan((camera.fov * Math.PI) / 360) * (camera.position.z - INSPECTION_SLAB_Z)
    const viewHalfWidth = viewHalfHeight * (stageWidth / stageHeight)
    const worldPerPx = (viewHalfHeight * 2) / stageHeight
    const margin = stageWidth >= 1024 ? 0 : 10
    const availableHeight = Math.max(1, stageHeight - metrics.controlsPx - margin * 2) * worldPerPx
    const availableWidth = Math.max(1, stageWidth - margin * 2) * worldPerPx
    let tagMode: InspectionLayout['tagMode'] = 'side'
    let baseScale = Math.min(
      INSPECTION_BASE_SCALE,
      availableHeight / (SLAB_HALF_HEIGHT * 2),
      availableWidth / (SLAB_HALF_WIDTH * 2),
    )
    // Same rule the side callout uses to decide whether it fits.
    if (viewHalfWidth - SLAB_HALF_WIDTH * baseScale - 0.18 < LABEL_BARCODE_HINT_TAG.width * 0.6) {
      tagMode = 'above'
      baseScale = Math.min(
        INSPECTION_BASE_SCALE,
        availableHeight / (SLAB_HALF_HEIGHT * 2 + ABOVE_HINT_RESERVE),
        availableWidth / (SLAB_HALF_WIDTH * 2),
      )
    }
    const contentTop = SLAB_HALF_HEIGHT + (tagMode === 'above' ? ABOVE_HINT_RESERVE : 0)
    const regionTopWorld = camera.position.y + viewHalfHeight - margin * worldPerPx
    const regionBottomWorld =
      camera.position.y - viewHalfHeight + (metrics.controlsPx + margin) * worldPerPx

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
        // Keep the complete slab inside the visible area above the controls.
        const inspectionScale = baseScale * (1 + inspectionZoom * 0.1)
        const zoomScale =
          item.scale.x + (inspectionScale - item.scale.x) * (1 - Math.exp(-delta * 5))
        item.scale.setScalar(zoomScale)
        // Slab y values where the content's top / bottom edge meets the
        // visible region (item y is relative to the rig group).
        const yTopAligned = regionTopWorld - RIG_OFFSET_Y - contentTop * inspectionScale
        const yBottomAligned = regionBottomWorld - RIG_OFFSET_Y + SLAB_HALF_HEIGHT * inspectionScale
        let baseY: number
        const panMin = 0
        let panMax = 0
        if (yBottomAligned <= yTopAligned) {
          // Fits: large screens keep the original resting height; smaller
          // screens center the slab (and callout) in the free area.
          const centeredY =
            (regionTopWorld + regionBottomWorld) / 2 -
            RIG_OFFSET_Y -
            ((contentTop - SLAB_HALF_HEIGHT) / 2) * inspectionScale
          const preferredY = stageWidth >= 1024 ? INSPECTION_SLAB_Y : centeredY
          baseY = Math.max(yBottomAligned, Math.min(yTopAligned, preferredY))
        } else {
          // Zoomed past the screen: start with the label in view and let
          // wheel, keys, or a touch drag pan down to the bottom edge.
          baseY = yTopAligned
          panMax = yBottomAligned - yTopAligned
        }
        inspectionPan.current = Math.max(panMin, Math.min(panMax, inspectionPan.current))
        layoutRef.current.tagMode = tagMode
        layoutRef.current.panMin = panMin
        layoutRef.current.panMax = panMax
        layoutRef.current.worldPerPx = worldPerPx
        item.position.y +=
          (baseY + inspectionPan.current - item.position.y) *
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
      const scale = STORY_SLAB_SCALE - depth * 0.2
      item.scale.setScalar(item.scale.x + (scale - item.scale.x) * movement)
      item.rotation.y = 0
    })
  })

  return (
    <group ref={rig} position={[0, RIG_OFFSET_Y, 0]}>
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
            inspectionPan={inspectionPan}
            layoutRef={layoutRef}
            cardBackTexture={cardBackTexture}
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
  // True while the story section is within about half a screen of the viewport.
  const [inView, setInView] = useState(true)
  const progressFill = useRef<HTMLDivElement>(null)
  const progressRunner = useRef<HTMLDivElement>(null)
  const selectionTimer = useRef<number | null>(null)
  const shell = useRef<HTMLDivElement>(null)
  const instructionsBar = useRef<HTMLDivElement>(null)
  const controlsBar = useRef<HTMLDivElement>(null)
  const stageMetrics = useRef<StageMetrics>({ railPx: 132, instructionsPx: 64, controlsPx: 64 })
  const inspectionLayout = useRef<InspectionLayout>({
    tagMode: 'side',
    panMin: 0,
    panMax: 0,
    worldPerPx: 0.006,
  })
  const [compactDevice] = useState(isCompactDevice)
  const [coarsePointer] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches,
  )

  // Measure the HTML bars that sit over the canvas so the 3D layout can keep
  // the slab clear of them (they change height at CSS breakpoints and with
  // the iOS safe-area inset).
  useEffect(() => {
    const measure = () => {
      const metrics = stageMetrics.current
      if (shell.current) {
        const rail = parseFloat(
          getComputedStyle(shell.current).getPropertyValue('--progress-rail-height'),
        )
        if (Number.isFinite(rail)) metrics.railPx = rail
      }
      if (instructionsBar.current) metrics.instructionsPx = instructionsBar.current.offsetHeight
      if (controlsBar.current) metrics.controlsPx = controlsBar.current.offsetHeight
    }
    measure()
    const observer = new ResizeObserver(measure)
    for (const element of [shell.current, instructionsBar.current, controlsBar.current]) {
      if (element) observer.observe(element)
    }
    window.addEventListener('resize', measure)
    return () => {
      observer.disconnect()
      window.removeEventListener('resize', measure)
    }
  }, [inspecting])

  useEffect(() => () => {
    if (selectionTimer.current !== null) window.clearTimeout(selectionTimer.current)
  }, [])

  // Start fetching the callout's handwriting font before the first
  // inspection so the texture is usually drawn in it straight away.
  useEffect(() => {
    void ensureHandwritingLoaded()
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
      const { panMin, panMax, worldPerPx } = inspectionLayout.current
      if (panMax - panMin <= 0.001) return
      inspectionPan.current = Math.max(
        panMin,
        Math.min(panMax, inspectionPan.current + deltaPx * worldPerPx),
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
      closeInspection()
      selectionTimer.current = window.setTimeout(moveToStoryPoint, 420)
    } else {
      moveToStoryPoint()
    }
  }

  // Only run the WebGL render loop while the carousel is on (or near) the
  // screen. Scroll-driven state (selected slab, progress rail) is computed from
  // scroll events above, not from the render loop, so pausing here doesn't
  // break it; the slabs simply glide into place when rendering resumes.
  useEffect(() => {
    const element = story.current
    if (!element || typeof IntersectionObserver === 'undefined') return
    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { rootMargin: '50% 0px 50% 0px' },
    )
    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  return (
    <div className={`slab-story${inspecting ? ' is-inspecting' : ''}`} ref={story}>
      <div className="slab-story-sticky">
        <div className={`slab-carousel-shell${inspecting ? ' is-inspecting' : ''}`} ref={shell}>
          <div className={`slab-carousel${storyActive ? ' is-inspectable' : ''}${inspecting ? ' is-inspecting' : ''}`}>
            <div className="slab-canvas-stage">
              <Canvas
                camera={{ position: [0, 0.05, 8.4], fov: 54 }}
                dpr={compactDevice ? [1, 1.5] : [1, 1.75]}
                frameloop={inView || inspecting ? 'always' : 'never'}
                gl={{ antialias: true, alpha: true }}
              >
                {inspecting ? <color attach="background" args={[new Color('#f5f3ed')]} /> : null}
                <ambientLight intensity={1.3} />
                <directionalLight position={[-4, 6, 7]} intensity={2.4} />
                <directionalLight position={[5, -2, 5]} intensity={1.2} color="#cdcfb5" />
                <pointLight position={[0, 1, 5]} intensity={1.5} color="#ffffff" />
                <CarouselRig
                  selectedIndex={selectedIndex}
                  inspecting={inspecting}
                  inspectionZoom={inspectionZoom}
                  inspectionPan={inspectionPan}
                  canInspect={storyActive}
                  stageMetrics={stageMetrics}
                  layoutRef={inspectionLayout}
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
              <div className="inspection-controls" ref={controlsBar}>
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
              <div className="carousel-instructions" ref={instructionsBar}>
                <span className={`instructions-cta${storyActive ? ' is-live' : ''}`}>
                  {storyActive
                    ? `${coarsePointer ? 'Tap' : 'Click'} the focused slab to inspect`
                    : 'Inspection unlocks inside the story'}
                </span>
              </div>
            )}
          </div>

          <div className="carousel-progress" aria-label="Carousel story progress">
            <div className="progress-heading">
              <span>Scroll story · Or select a chapter</span>
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
                  <span />
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
