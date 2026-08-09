import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import {
  BufferGeometry,
  CatmullRomCurve3,
  DoubleSide,
  Float32BufferAttribute,
  Group,
  ShaderMaterial,
  Vector2,
  Vector3,
} from 'three'

const vertexShader = `
  uniform float uTime;
  uniform vec2 uPointer;
  attribute vec2 aRibbonNormal;
  attribute float aSide;
  varying vec2 vUv;
  varying float vFold;
  varying float vTwist;
  varying float vDepth;
  varying float vConcavity;

  void main() {
    vUv = uv;
    vec3 p = position;
    float phase = uTime * 0.15;
    float longWave = sin(uv.y * 12.0 - phase);
    float pointerWave = sin((uv.y + uPointer.y * 0.06) * 17.0 + uPointer.x);
    float travellingTwist = sin(uv.y * 9.0 + phase) * 0.24;
    float twist = uv.y * 20.0 - phase + travellingTwist;

    // Rotate every point around the ribbon's centerline. This turns the
    // strip through full revolutions like a towel being wrung by two hands.
    p.xy += aRibbonNormal * aSide * (cos(twist) - 1.0);
    p.z += aSide * sin(twist);
    p.z += longWave * 0.08 + pointerWave * 0.04;
    p.x += sin(uv.y * 8.0 + phase) * 0.035;

    vTwist = twist;
    vFold = longWave * 0.5 + 0.5;
    vDepth = p.z;
    vConcavity = max(0.0, -sin(uv.y * 12.0 - phase));

    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
  }
`

const fragmentShader = `
  uniform float uTime;
  varying vec2 vUv;
  varying float vFold;
  varying float vTwist;
  varying float vDepth;
  varying float vConcavity;

  float threadLine(float coordinate, float width) {
    float distanceToCenter = abs(fract(coordinate) - 0.5);
    return 1.0 - smoothstep(width, width + 0.08, distanceToCenter);
  }

  void main() {
    float phase = uTime * 0.15;
    vec3 blue = vec3(0.22, 0.53, 0.76);
    vec3 ice = vec3(0.82, 0.93, 0.98);
    vec3 red = vec3(0.91, 0.07, 0.22);
    vec3 pink = vec3(1.0, 0.39, 0.52);

    float flow = sin(vUv.y * 12.0 - phase) * 0.5 + 0.5;
    vec3 leftColor = mix(blue, ice, flow * 0.48);
    vec3 rightColor = mix(red, pink, flow * 0.35);
    vec3 color = mix(leftColor, rightColor, smoothstep(0.05, 0.95, vUv.x));

    // Individual yarns follow the length of the strip. The small sideways
    // drift keeps them organic while preserving the clear top-to-bottom grain.
    float yarnCoordinate = vUv.x * 142.0 + sin(vUv.y * 32.0 + phase) * 0.04;
    float yarn = threadLine(yarnCoordinate, 0.30);
    float yarnCore = threadLine(yarnCoordinate + 0.15, 0.12);
    color *= 0.77 + yarn * 0.23;
    color += yarnCore * 0.10;

    // Fake directional lighting follows the physical twist from the vertex
    // shader, producing a bright face and deep folds as the ribbon turns.
    float facingLight = cos(vTwist) * 0.5 + 0.5;
    float depthShade = smoothstep(-2.4, 2.4, vDepth);
    color *= 0.60 + facingLight * 0.40;
    color += depthShade * 0.10;

    // Fold occlusion darkens the inward-facing part of each broad bend.
    // Smooth interpolation avoids a visible boundary when the face turns over.
    float foldDirection = smoothstep(-0.65, 0.65, sin(vTwist));
    float foldedEdge = mix(1.0 - vUv.x, vUv.x, foldDirection);
    float foldShadow = vConcavity * smoothstep(0.18, 0.92, foldedEdge);
    float turnShadow = pow(1.0 - abs(cos(vTwist)), 2.2) * 0.22;
    color *= 1.0 - foldShadow * 0.34 - turnShadow;

    float centerSheen = pow(max(0.0, sin(vUv.x * 3.14159)), 5.0);
    float movingSheen = pow(max(0.0, sin(vUv.y * 16.0 - phase + vUv.x * 2.0)), 12.0);
    color += centerSheen * movingSheen * (0.2 + vFold * 0.12);
    float edge = smoothstep(0.0, 0.025, vUv.x) * smoothstep(1.0, 0.975, vUv.x);

    gl_FragColor = vec4(color, edge * 0.88);
  }
`

function RibbonMesh() {
  const material = useRef<ShaderMaterial>(null)
  const group = useRef<Group>(null)
  const storySection = useRef<HTMLElement | null>(null)
  const { viewport } = useThree()
  const reducedMotion = useMemo(
    () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    [],
  )

  useEffect(() => {
    storySection.current = document.querySelector<HTMLElement>('.slab-story')
    return () => {
      storySection.current = null
    }
  }, [])

  const geometry = useMemo(() => {
    const width = viewport.width
    const height = viewport.height
    const points = [
      new Vector3(width * 0.60, height * 0.67, 0),
      new Vector3(width * 0.48, height * 0.30, 0),
      new Vector3(width * 0.12, height * 0.02, 0),
      new Vector3(-width * 0.34, -height * 0.30, 0),
      new Vector3(-width * 0.30, -height * 0.86, 0),
      new Vector3(width * 0.30, -height * 1.18, 0),
      new Vector3(width * 0.34, -height * 1.72, 0),
      new Vector3(-width * 0.31, -height * 2.10, 0),
      new Vector3(-width * 0.34, -height * 2.70, 0),
      new Vector3(width * 0.29, -height * 3.08, 0),
      new Vector3(width * 0.32, -height * 3.68, 0),
      new Vector3(-width * 0.27, -height * 4.08, 0),
      new Vector3(-width * 0.38, -height * 4.65, 0),
      new Vector3(width * 0.24, -height * 5.10, 0),
      new Vector3(width * 0.48, -height * 5.68, 0),
    ]
    const curve = new CatmullRomCurve3(points, false, 'catmullrom', 0.42)
    const segments = 1440
    const positions: number[] = []
    const uvs: number[] = []
    const indices: number[] = []
    const ribbonNormals: number[] = []
    const sides: number[] = []

    for (let index = 0; index <= segments; index += 1) {
      const t = index / segments
      const center = curve.getPoint(t)
      const tangent = curve.getTangent(t).normalize()
      const normal = new Vector3(-tangent.y, tangent.x, 0).normalize()
      const ribbonWidth = Math.min(width * 0.15, 2.5)
      const left = center.clone().addScaledVector(normal, ribbonWidth)
      const right = center.clone().addScaledVector(normal, -ribbonWidth)

      positions.push(left.x, left.y, left.z, right.x, right.y, right.z)
      uvs.push(0, t, 1, t)
      ribbonNormals.push(normal.x, normal.y, normal.x, normal.y)
      sides.push(ribbonWidth, -ribbonWidth)

      if (index < segments) {
        const offset = index * 2
        indices.push(offset, offset + 1, offset + 2, offset + 1, offset + 3, offset + 2)
      }
    }

    const result = new BufferGeometry()
    result.setAttribute('position', new Float32BufferAttribute(positions, 3))
    result.setAttribute('uv', new Float32BufferAttribute(uvs, 2))
    result.setAttribute('aRibbonNormal', new Float32BufferAttribute(ribbonNormals, 2))
    result.setAttribute('aSide', new Float32BufferAttribute(sides, 1))
    result.setIndex(indices)
    result.computeVertexNormals()
    return result
  }, [viewport.height, viewport.width])

  useFrame((state, delta) => {
    if (!material.current || !group.current) return
    if (!reducedMotion) material.current.uniforms.uTime.value += delta
    material.current.uniforms.uPointer.value.lerp(state.pointer, 0.035)

    const lockedBodyOffset = document.body.style.position === 'fixed'
      ? Math.abs(Number.parseFloat(document.body.style.top) || 0)
      : window.scrollY
    let ribbonScrollPosition = lockedBodyOffset

    if (storySection.current) {
      const storyBounds = storySection.current.getBoundingClientRect()
      const storyTop = lockedBodyOffset + storyBounds.top
      const storyScrollDistance = Math.max(
        0,
        storySection.current.offsetHeight - window.innerHeight,
      )
      const consumedStoryScroll = Math.max(
        0,
        Math.min(storyScrollDistance, lockedBodyOffset - storyTop),
      )
      ribbonScrollPosition -= consumedStoryScroll
    }

    group.current.position.y = ribbonScrollPosition / 80
  })

  return (
    <group ref={group}>
      <mesh geometry={geometry}>
        <shaderMaterial
          ref={material}
          vertexShader={vertexShader}
          fragmentShader={fragmentShader}
          uniforms={{
            uTime: { value: 0 },
            uPointer: { value: new Vector2() },
          }}
          transparent
          depthWrite={false}
          side={DoubleSide}
        />
      </mesh>
    </group>
  )
}

export default function WavyRibbon() {
  return (
    <div className="ribbon-canvas" aria-hidden="true">
      <Canvas
        orthographic
        camera={{ position: [0, 0, 10], zoom: 80 }}
        dpr={[1.5, 2]}
        gl={{ alpha: true, antialias: true }}
      >
        <RibbonMesh />
      </Canvas>
    </div>
  )
}
