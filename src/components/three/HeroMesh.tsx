'use client'

import { useRef, useState, useEffect } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Float, MeshDistortMaterial, Environment } from '@react-three/drei'
import type { Mesh } from 'three'

function CrystalMesh() {
  const meshRef = useRef<Mesh>(null)
  const [mouse, setMouse] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMouse({
        x: (e.clientX / window.innerWidth) * 2 - 1,
        y: -(e.clientY / window.innerHeight) * 2 + 1,
      })
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  useFrame(() => {
    if (!meshRef.current) return
    meshRef.current.rotation.x += (mouse.y * 0.3 - meshRef.current.rotation.x) * 0.02
    meshRef.current.rotation.y += (mouse.x * 0.3 - meshRef.current.rotation.y) * 0.02
  })

  return (
    <Float speed={1.2} rotationIntensity={0.4} floatIntensity={0.6}>
      <mesh ref={meshRef} scale={1.8}>
        <icosahedronGeometry args={[1, 1]} />
        <MeshDistortMaterial
          color="#60a5fa"
          roughness={0}
          metalness={0.6}
          distort={0.25}
          speed={1.2}
          transparent
          opacity={0.85}
        />
      </mesh>
    </Float>
  )
}

export default function HeroMesh() {
  return (
    <div className="w-full h-full min-h-[300px]">
      <Canvas
        camera={{ position: [0, 0, 5], fov: 45 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.4} />
        <directionalLight position={[5, 5, 5]} intensity={0.8} />
        <Environment preset="city" />
        <CrystalMesh />
      </Canvas>
    </div>
  )
}
