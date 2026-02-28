'use client'

import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

interface FishViewerProps {
  modelPath: string
}

export default function FishViewer({ modelPath }: FishViewerProps) {
  const mountRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!mountRef.current || !modelPath) return

    const container = mountRef.current
    const width = container.clientWidth || 400
    const height = container.clientHeight || 300

    // Scene
    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x111827)

    // Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000)
    camera.position.set(0, 0, 5)

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(width, height)
    renderer.setPixelRatio(window.devicePixelRatio)
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.2
    container.appendChild(renderer.domElement)

    // Lighting
    const ambient = new THREE.AmbientLight(0xffffff, 1.5)
    scene.add(ambient)
    
    const mainLight = new THREE.DirectionalLight(0xffffff, 2)
    mainLight.position.set(5, 10, 7.5)
    scene.add(mainLight)

    const fillLight = new THREE.PointLight(0xffffff, 1)
    fillLight.position.set(-5, 0, -5)
    scene.add(fillLight)

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.05
    controls.autoRotate = true
    controls.autoRotateSpeed = 1

    // Animation variables
    let mixer: THREE.AnimationMixer | null = null
    const clock = new THREE.Clock()

    // Load Model
    const loader = new GLTFLoader()
    
    loader.load(
      modelPath,
      (gltf) => {
        const model = gltf.scene
        
        // Ensure materials are visible
        model.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh
            if (mesh.material) {
              mesh.material.side = THREE.DoubleSide
            }
          }
        })

        // Setup Animations
        if (gltf.animations && gltf.animations.length > 0) {
          mixer = new THREE.AnimationMixer(model)
          // Play the first animation clip by default
          const action = mixer.clipAction(gltf.animations[0])
          action.play()
        }

        // Auto center & scale
        const box = new THREE.Box3().setFromObject(model)
        const size = box.getSize(new THREE.Vector3())
        const center = box.getCenter(new THREE.Vector3())
        
        const maxDim = Math.max(size.x, size.y, size.z)
        if (maxDim > 0) {
          const scale = 3.5 / maxDim 
          model.scale.setScalar(scale)
          model.position.x = -center.x * scale
          model.position.y = -center.y * scale
          model.position.z = -center.z * scale
        }
        
        scene.add(model)
      },
      undefined,
      (error) => {
        console.error('Error loading GLB:', error)
      }
    )

    // Handle Resize
    const handleResize = () => {
      const w = container.clientWidth
      const h = container.clientHeight
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      renderer.setSize(w, h)
    }
    window.addEventListener('resize', handleResize)

    // Animate
    let animId: number
    const animate = () => {
      animId = requestAnimationFrame(animate)
      
      const delta = clock.getDelta()
      if (mixer) mixer.update(delta)
      
      controls.update()
      renderer.render(scene, camera)
    }
    animate()

    // Cleanup
    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', handleResize)
      renderer.dispose()
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement)
      }
    }
  }, [modelPath])

  return <div ref={mountRef} className="w-full h-full min-h-[300px]" />
}