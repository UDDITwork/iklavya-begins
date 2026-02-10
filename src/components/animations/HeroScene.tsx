'use client'

import { Canvas } from '@react-three/fiber'
import { OrbitControls, Float, Stars, Environment } from '@react-three/drei'
import { useRef } from 'react'
import * as THREE from 'three'

function HolographicSphere() {
  const meshRef = useRef<THREE.Mesh>(null)

  return (
    <Float speed={2} rotationIntensity={1} floatIntensity={2}>
      <mesh ref={meshRef}>
        <icosahedronGeometry args={[1.5, 1]} />
        <meshStandardMaterial
          color="#8b5cf6"
          wireframe
          transparent
          opacity={0.3}
          emissive="#3b82f6"
          emissiveIntensity={0.2}
        />
      </mesh>
      <mesh>
        <icosahedronGeometry args={[1.2, 2]} />
        <meshStandardMaterial
          color="#3b82f6"
          wireframe
          transparent
          opacity={0.15}
          emissive="#8b5cf6"
          emissiveIntensity={0.1}
        />
      </mesh>
      {/* Inner glowing core */}
      <mesh>
        <sphereGeometry args={[0.5, 32, 32]} />
        <meshStandardMaterial
          color="#a855f7"
          emissive="#a855f7"
          emissiveIntensity={0.8}
          transparent
          opacity={0.6}
        />
      </mesh>
    </Float>
  )
}

export default function HeroScene() {
  return (
    <Canvas camera={{ position: [0, 0, 6], fov: 50 }}>
      <ambientLight intensity={0.3} />
      <pointLight position={[10, 10, 10]} intensity={0.5} color="#3b82f6" />
      <pointLight position={[-10, -10, -10]} intensity={0.3} color="#8b5cf6" />
      <Stars
        radius={100}
        depth={50}
        count={3000}
        factor={4}
        saturation={0}
        fade
        speed={1}
      />
      <HolographicSphere />
      <OrbitControls
        enableZoom={false}
        enablePan={false}
        autoRotate
        autoRotateSpeed={0.5}
        maxPolarAngle={Math.PI / 1.5}
        minPolarAngle={Math.PI / 3}
      />
      <Environment preset="night" />
    </Canvas>
  )
}
