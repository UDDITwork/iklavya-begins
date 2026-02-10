// Three.js scene configurations for Iklavya
// Used across multiple 3D components

export const heroSceneConfig = {
  camera: { position: [0, 0, 6] as [number, number, number], fov: 50 },
  lights: {
    ambient: { intensity: 0.3 },
    point1: { position: [10, 10, 10] as [number, number, number], intensity: 0.5, color: '#3b82f6' },
    point2: { position: [-10, -10, -10] as [number, number, number], intensity: 0.3, color: '#8b5cf6' },
  },
  stars: { radius: 100, depth: 50, count: 3000, factor: 4 },
  controls: { autoRotateSpeed: 0.5, enableZoom: false, enablePan: false },
}

export const interviewAvatarConfig = {
  camera: { position: [0, 0.5, 3.5] as [number, number, number], fov: 45 },
  lights: {
    ambient: { intensity: 0.4 },
    key: { position: [5, 5, 5] as [number, number, number], intensity: 0.6, color: '#3b82f6' },
    fill: { position: [-5, 3, 5] as [number, number, number], intensity: 0.3, color: '#8b5cf6' },
    spot: { position: [0, 5, 5] as [number, number, number], intensity: 0.5, angle: 0.3 },
  },
  headColor: '#4a90d9',
  bodyColor: '#2a4a7a',
}

export const materialPresets = {
  holographic: {
    wireframe: true,
    transparent: true,
    opacity: 0.3,
    emissiveIntensity: 0.2,
  },
  glowCore: {
    emissiveIntensity: 0.8,
    transparent: true,
    opacity: 0.6,
  },
}
