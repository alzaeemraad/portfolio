import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { useTheme } from '../../context/ThemeContext';

class LogoPlaneWithVelocity extends THREE.Mesh {
  velocity: THREE.Vector3;
  basePosition: THREE.Vector3;

  constructor(geometry: THREE.PlaneGeometry, material: THREE.MeshBasicMaterial) {
    super(geometry, material);
    this.velocity = new THREE.Vector3();
    this.basePosition = new THREE.Vector3();
  }
}

const InteractiveBalls: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();

  // Programming language symbols to display
  const symbols = ["JS", "TS", "Py", "Java", "C++", "Go", "Ruby", "PHP", "Swift", "Rust", "Kotlin", "Dart", "R", "Scala", "C#", "HTML", "CSS"];

  // Primary blue colors for themes
  const primaryBlueDark = '#1E40AF'; // dark mode primary blue
  const primaryBlueLight = '#60A5FA'; // light mode primary blue

  // Function to create canvas texture for a symbol with given color
  const createLogoTexture = (symbol: string, color: string): THREE.Texture => {
    const size = 512; // Increased canvas size for higher resolution texture
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Failed to get canvas context');

    // Clear canvas with transparent background
    ctx.clearRect(0, 0, size, size);

    // Set text properties
    ctx.fillStyle = color;
    // Adjust font size based on symbol length to prevent clipping
    const maxFontSize = 240;
    const fontSize = symbol.length > 2 ? maxFontSize - (symbol.length - 2) * 30 : maxFontSize;
    ctx.font = `bold ${fontSize}px Arial, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Draw text centered
    ctx.fillText(symbol, size / 2, size / 2);

    const texture = new THREE.Texture(canvas);
    texture.needsUpdate = true;
    return texture;
  };

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

    // Apply blur filter to renderer's canvas in both light and dark modes
    renderer.domElement.style.filter = 'blur(4px)';

    const logos: LogoPlaneWithVelocity[] = [];
    const logoCount = symbols.length; // Set logoCount to number of unique symbols
    const boundary = 40;

    // Function to get color based on theme
    const getColor = () => (theme === 'light' ? primaryBlueLight : primaryBlueDark);

    // Create logo planes with random symbols, positions, velocities, and scales
    for (let i = 0; i < logoCount; i++) {
      const symbol = symbols[i]; // Use symbol directly without modulo to avoid repetition
      const color = getColor();
      const texture = createLogoTexture(symbol, color);
      const material = new THREE.MeshBasicMaterial({ map: texture, transparent: true });
      const geometry = new THREE.PlaneGeometry(8, 8);
      const logo = new LogoPlaneWithVelocity(geometry, material);

      logo.position.set(
        THREE.MathUtils.randFloatSpread(boundary * 2),
        THREE.MathUtils.randFloatSpread(boundary * 2),
        THREE.MathUtils.randFloatSpread(boundary * 2)
      );
      logo.basePosition = logo.position.clone();
      logo.velocity = new THREE.Vector3(
        THREE.MathUtils.randFloat(-0.01, 0.01),
        THREE.MathUtils.randFloat(-0.01, 0.01),
        THREE.MathUtils.randFloat(-0.01, 0.01)
      );

      // Random scale between 0.5 and 1.5
      const scale = THREE.MathUtils.randFloat(0.5, 1.5);
      logo.scale.set(scale, scale, 1);

      scene.add(logo);
      logos.push(logo);
    }

    // Lights (not needed for MeshBasicMaterial, but keep ambient for consistency)
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

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

    // Update logo colors on theme change by regenerating textures
    const updateLogoColors = () => {
      const color = getColor();
      logos.forEach((logo, index) => {
        const symbol = symbols[index]; // Use symbol directly without modulo to avoid repetition
        // Dispose old texture
        if (!Array.isArray(logo.material) && 'map' in logo.material && logo.material.map) {
          (logo.material.map as THREE.Texture).dispose();
        }
        const newTexture = createLogoTexture(symbol, color);
        if (!Array.isArray(logo.material) && 'map' in logo.material) {
          logo.material.map = newTexture;
          logo.material.needsUpdate = true;
        }
      });
    };

    updateLogoColors();

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);

      raycaster.setFromCamera(mouse, camera);

      logos.forEach((logo) => {
        // Move logos by velocity
        logo.position.add(logo.velocity);

        // Bounce off boundaries
        (['x', 'y', 'z'] as (keyof THREE.Vector3)[]).forEach((axis) => {
          if (typeof logo.position[axis] === 'number') {
            if (logo.position[axis] > boundary) {
              logo.position[axis] = boundary;
              // Mutate velocity component instead of reassigning
              const idx = axis === 'x' ? 0 : axis === 'y' ? 1 : 2;
              logo.velocity.setComponent(idx, -logo.velocity.getComponent(idx));
            } else if (logo.position[axis] < -boundary) {
              logo.position[axis] = -boundary;
              // Mutate velocity component instead of reassigning
              const idx = axis === 'x' ? 0 : axis === 'y' ? 1 : 2;
              logo.velocity.setComponent(idx, -logo.velocity.getComponent(idx));
            }
          }
        });

        // Check intersection with mouse raycaster
        const intersects = raycaster.intersectObject(logo);
        if (intersects.length > 0) {
          // On mouse hover, change velocity randomly to simulate interaction
          // Reduce velocity change magnitude to slow down on hover
          const deltaV = new THREE.Vector3(
            THREE.MathUtils.randFloat(-0.005, 0.005),
            THREE.MathUtils.randFloat(-0.005, 0.005),
            THREE.MathUtils.randFloat(-0.005, 0.005)
          );
          logo.velocity.add(deltaV);

          // Limit velocity magnitude
          logo.velocity.clampLength(0, 0.03);

          // Scale up on hover
          // Zoom until 3 times original size, then stop scaling
          if (logo.scale.x < (logo.userData.originalScale as number) * 3) {
            logo.scale.multiplyScalar(1.02);
          }
        } else {
          // Reset scale to original random scale
          if (logo.userData.originalScale) {
            const s = logo.userData.originalScale as number;
            logo.scale.set(s, s, 1);
          }
        }
      });

      renderer.render(scene, camera);
    };

    // Store original scales in userData for reset on hover out
    logos.forEach((logo) => {
      logo.userData.originalScale = logo.scale.x;
    });

    animate();

    // Cleanup on unmount
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      logos.forEach((logo) => {
        scene.remove(logo);
        if (!Array.isArray(logo.material) && 'map' in logo.material && logo.material.map) {
          (logo.material.map as THREE.Texture).dispose();
        }
        if (!Array.isArray(logo.material)) {
          logo.material.dispose();
        }
        logo.geometry.dispose();
      });
      renderer.dispose();
      if (mountRef.current) {
        mountRef.current.removeChild(renderer.domElement);
      }
    };
  }, [theme]);

  return <div ref={mountRef} className="absolute inset-0 w-full h-full" style={{ width: '100%', height: '100%' }} />;
};

export default InteractiveBalls;
