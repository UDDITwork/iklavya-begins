'use client'

import { Canvas } from '@react-three/fiber'
import { OrbitControls, Float, Environment } from '@react-three/drei'
import { useRef, useMemo } from 'react'
import * as THREE from 'three'

function InterviewerHead({ speaking }: { speaking: boolean }) {
  const headRef = useRef<THREE.Group>(null)

  const mouthScale = useMemo(() => (speaking ? [1, 0.3, 1] : [1, 0.05, 1]) as [number, number, number], [speaking])

  return (
    <Float speed={1} rotationIntensity={0.3} floatIntensity={0.5}>
      <group ref={headRef}>
        {/* Head */}
        <mesh position={[0, 0.2, 0]}>
          <sphereGeometry args={[1, 32, 32]} />
          <meshStandardMaterial color="#4a90d9" metalness={0.3} roughness={0.4} />
        </mesh>

        {/* Eyes */}
        <mesh position={[-0.3, 0.45, 0.85]}>
          <sphereGeometry args={[0.12, 16, 16]} />
          <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.3} />
        </mesh>
        <mesh position={[0.3, 0.45, 0.85]}>
          <sphereGeometry args={[0.12, 16, 16]} />
          <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.3} />
        </mesh>

        {/* Pupils */}
        <mesh position={[-0.3, 0.45, 0.96]}>
          <sphereGeometry args={[0.06, 16, 16]} />
          <meshStandardMaterial color="#1a1a2e" />
        </mesh>
        <mesh position={[0.3, 0.45, 0.96]}>
          <sphereGeometry args={[0.06, 16, 16]} />
          <meshStandardMaterial color="#1a1a2e" />
        </mesh>

        {/* Mouth */}
        <mesh position={[0, -0.15, 0.9]} scale={mouthScale}>
          <boxGeometry args={[0.4, 0.15, 0.1]} />
          <meshStandardMaterial color="#2a2a4a" />
        </mesh>

        {/* Body/Shoulders */}
        <mesh position={[0, -1.2, 0]}>
          <cylinderGeometry args={[0.8, 1.2, 1.2, 16]} />
          <meshStandardMaterial color="#2a4a7a" metalness={0.2} roughness={0.6} />
        </mesh>
      </group>
    </Float>
  )
}

interface AIAvatarSceneProps {
  speaking?: boolean
}

export default function AIAvatarScene({ speaking = false }: AIAvatarSceneProps) {
  return (
    <Canvas camera={{ position: [0, 0.5, 3.5], fov: 45 }}>
      <ambientLight intensity={0.4} />
      <pointLight position={[5, 5, 5]} intensity={0.6} color="#3b82f6" />
      <pointLight position={[-5, 3, 5]} intensity={0.3} color="#8b5cf6" />
      <spotLight position={[0, 5, 5]} intensity={0.5} angle={0.3} penumbra={0.5} />
      <InterviewerHead speaking={speaking} />
      <OrbitControls
        enableZoom={false}
        enablePan={false}
        maxPolarAngle={Math.PI / 2}
        minPolarAngle={Math.PI / 3}
      />
      <Environment preset="city" />
    </Canvas>
  )
}
