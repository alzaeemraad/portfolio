import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { useTheme } from '../../context/ThemeContext';

class BallWithVelocity extends THREE.Mesh {
  velocity: THREE.Vector3;
  basePosition: THREE.Vector3;

  constructor(geometry: THREE.SphereGeometry, material: THREE.MeshStandardMaterial) {
    super(geometry, material);
    this.velocity = new THREE.Vector3();
    this.basePosition = new THREE.Vector3();
  }
}

const InteractiveBalls: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();

  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.z = 50;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    mountRef.current.appendChild(renderer.domElement);

    const balls: BallWithVelocity[] = [];
    const ballCount = 20;
    const boundary = 40;

    // Define colors
    const blueColor = new THREE.Color('#0ea5e9'); // primary-500 from tailwind config
    const lightGreyColor = new THREE.Color('hsl(0, 0%, 95%)'); // very light grey

    // Function to get color based on theme
    const getBallColor = () => {
      return theme === 'dark' ? blueColor : lightGreyColor;
    };

    for (let i = 0; i < ballCount; i++) {
      const radius = THREE.MathUtils.randFloat(1, 4);
      const geometry = new THREE.SphereGeometry(radius, 32, 32);
      const material = new THREE.MeshStandardMaterial({
        color: getBallColor(),
        roughness: 0.5,
        metalness: 0.5,
      });
      const ball = new BallWithVelocity(geometry, material);
      ball.position.set(
        THREE.MathUtils.randFloatSpread(boundary * 2),
        THREE.MathUtils.randFloatSpread(boundary * 2),
        THREE.MathUtils.randFloatSpread(boundary * 2)
      );
      ball.basePosition = ball.position.clone();
      ball.velocity = new THREE.Vector3(
        THREE.MathUtils.randFloat(-0.02, 0.02),
        THREE.MathUtils.randFloat(-0.02, 0.02),
        THREE.MathUtils.randFloat(-0.02, 0.02)
      );
      scene.add(ball);
      balls.push(ball);
    }

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(0, 1, 1);
    scene.add(directionalLight);

    // Mouse interaction
    const mouse = new THREE.Vector2();
    const raycaster = new THREE.Raycaster();

    const onMouseMove = (event: MouseEvent) => {
      if (!mountRef.current) return;
      const rect = mountRef.current.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    };

    window.addEventListener('mousemove', onMouseMove);

    // Update ball colors on theme change
    const updateBallColors = () => {
      const newColor = getBallColor();
      balls.forEach((ball) => {
        (ball.material as THREE.MeshStandardMaterial).color = newColor;
        (ball.material as THREE.MeshStandardMaterial).needsUpdate = true;
      });
    };

    updateBallColors();

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);

      // Update raycaster
      raycaster.setFromCamera(mouse, camera);

      balls.forEach((ball) => {
        // Move balls by velocity
        ball.position.add(ball.velocity);

        // Bounce off boundaries
        (['x', 'y', 'z'] as (keyof THREE.Vector3)[]).forEach((axis) => {
          if (typeof ball.position[axis] === 'number') {
            if (ball.position[axis] > boundary) {
              ball.position[axis] = boundary;
              ball.velocity[axis] = -ball.velocity[axis];
            } else if (ball.position[axis] < -boundary) {
              ball.position[axis] = -boundary;
              ball.velocity[axis] = -ball.velocity[axis];
            }
          }
        });

        // Check intersection with mouse raycaster
        const intersects = raycaster.intersectObject(ball);
        if (intersects.length > 0) {
          // On mouse hover, change velocity randomly to simulate interaction
          ball.velocity.add(new THREE.Vector3(
            THREE.MathUtils.randFloat(-0.05, 0.05),
            THREE.MathUtils.randFloat(-0.05, 0.05),
            THREE.MathUtils.randFloat(-0.05, 0.05)
          ));

          // Limit velocity magnitude
          ball.velocity.clampLength(0, 0.1);

          // Scale up on hover
          ball.scale.set(1.5, 1.5, 1.5);
        } else {
          // Reset scale
          ball.scale.set(1, 1, 1);
        }
      });

      renderer.render(scene, camera);
    };

    animate();

    // Cleanup on unmount
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      balls.forEach((ball) => {
        scene.remove(ball);
        ball.geometry.dispose();
        if (Array.isArray(ball.material)) {
          ball.material.forEach((m) => m.dispose());
        } else {
          ball.material.dispose();
        }
      });
      renderer.dispose();
      if (mountRef.current) {
        mountRef.current.removeChild(renderer.domElement);
      }
    };
  }, [theme]);

  return <div ref={mountRef} className="absolute inset-0 z-0" style={{ width: '100%', height: '100%' }} />;
};

export default InteractiveBalls;
