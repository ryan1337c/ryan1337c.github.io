import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
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
  varying vec2 vUv;
  varying float vFold;

  void main() {
    vUv = uv;
    vec3 p = position;
    float longWave = sin(uv.y * 34.0 - uTime * 0.9);
    float fineWave = cos(uv.y * 71.0 + uTime * 1.3);
    float pointerWave = sin((uv.y + uPointer.y * 0.08) * 18.0 + uPointer.x);

    p.z += longWave * 0.24 + fineWave * 0.07 + pointerWave * 0.05;
    p.x += sin(uv.y * 22.0 + uTime * 0.45) * 0.08;
    vFold = longWave * 0.5 + 0.5;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
  }
`

const fragmentShader = `
  uniform float uTime;
  varying vec2 vUv;
  varying float vFold;

  void main() {
    vec3 blue = vec3(0.27, 0.58, 0.78);
    vec3 ice = vec3(0.88, 0.95, 0.98);
    vec3 red = vec3(0.94, 0.10, 0.26);
    vec3 pink = vec3(1.0, 0.45, 0.57);

    float flow = sin(vUv.y * 24.0 - uTime * 0.75) * 0.5 + 0.5;
    vec3 leftColor = mix(blue, ice, flow * 0.48);
    vec3 rightColor = mix(red, pink, flow * 0.35);
    vec3 color = mix(leftColor, rightColor, smoothstep(0.05, 0.95, vUv.x));

    float sheen = pow(max(0.0, sin(vUv.x * 3.14159)), 2.5);
    color += sheen * (0.15 + vFold * 0.12);
    float edge = smoothstep(0.0, 0.05, vUv.x) * smoothstep(1.0, 0.95, vUv.x);

    gl_FragColor = vec4(color, edge * 0.78);
  }
`

function RibbonMesh() {
  const material = useRef<ShaderMaterial>(null)
  const group = useRef<Group>(null)
  const { viewport } = useThree()
  const reducedMotion = useMemo(
    () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    [],
  )

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
    const segments = 360
    const positions: number[] = []
    const uvs: number[] = []
    const indices: number[] = []

    for (let index = 0; index <= segments; index += 1) {
      const t = index / segments
      const center = curve.getPointAt(t)
      const tangent = curve.getTangentAt(t).normalize()
      const normal = new Vector3(-tangent.y, tangent.x, 0).normalize()
      const pulse = 1 + Math.sin(t * Math.PI * 8) * 0.12
      const ribbonWidth = Math.min(width * 0.15, 2.5) * pulse
      const left = center.clone().addScaledVector(normal, ribbonWidth)
      const right = center.clone().addScaledVector(normal, -ribbonWidth)

      positions.push(left.x, left.y, left.z, right.x, right.y, right.z)
      uvs.push(0, t, 1, t)

      if (index < segments) {
        const offset = index * 2
        indices.push(offset, offset + 1, offset + 2, offset + 1, offset + 3, offset + 2)
      }
    }

    const result = new BufferGeometry()
    result.setAttribute('position', new Float32BufferAttribute(positions, 3))
    result.setAttribute('uv', new Float32BufferAttribute(uvs, 2))
    result.setIndex(indices)
    result.computeVertexNormals()
    return result
  }, [viewport.height, viewport.width])

  useFrame((state, delta) => {
    if (!material.current || !group.current) return
    if (!reducedMotion) material.current.uniforms.uTime.value += delta
    material.current.uniforms.uPointer.value.lerp(state.pointer, 0.035)
    group.current.position.y = window.scrollY / 80
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
        dpr={[1, 1.5]}
        gl={{ alpha: true, antialias: true }}
      >
        <RibbonMesh />
      </Canvas>
    </div>
  )
}
