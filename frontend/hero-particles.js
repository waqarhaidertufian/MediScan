/**
 * MediScan - Hero Section Interactive Neural Mesh Particle Effect
 * Custom background canvas script that creates a flowing, medical-tech neural network.
 * Features ambient floating data nodes, cursor attraction connection lines,
 * and high-performance rendering.
 */

(function () {
  'use strict';

  // 1. Mobile/touch check (Disable tracking on touch-only devices but keep ambient drifting)
  const isTouchDevice = window.matchMedia && window.matchMedia('(hover: none)').matches;

  const heroSection = document.querySelector('.hero');
  if (!heroSection) return;

  // Create or select the canvas
  let canvas = document.getElementById('hero-particles-canvas');
  if (!canvas) {
    canvas = document.createElement('canvas');
    canvas.id = 'hero-particles-canvas';
    // Insert behind the hero content grid
    heroSection.insertBefore(canvas, heroSection.firstChild);
  }

  const ctx = canvas.getContext('2d');

  let mouseX = 0;
  let mouseY = 0;
  let lastMouseX = 0;
  let lastMouseY = 0;
  let mouseInHero = false;

  const particles = [];
  const ambientParticles = [];
  const AMBIENT_COUNT = 65; // Balanced number of neural network nodes
  const MAX_TEMP_PARTICLES = 60; // Max cursor-emitted particles

  // Clinical Medical AI Palette (Electric Blue, Glowing Cyan, Clean Soft White)
  const COLORS = [
    { r: 0, g: 98, b: 255 },     // Electric Blue (#0062FF)
    { r: 0, g: 209, b: 255 },    // Tech Glowing Cyan (#00D1FF)
    { r: 255, g: 255, b: 255 }   // Clean Pure White
  ];

  // Dynamic canvas resizing matching the hero element bounds
  function resize() {
    const rect = heroSection.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
  }
  
  resize();
  window.addEventListener('resize', resize, { passive: true });
  window.addEventListener('load', resize, { passive: true });

  // Node Blueprint
  class Node {
    constructor(isAmbient = false, x = 0, y = 0) {
      this.isAmbient = isAmbient;
      this.x = isAmbient ? Math.random() * canvas.width : x;
      this.y = isAmbient ? Math.random() * canvas.height : y;
      
      if (isAmbient) {
        // Slow, organic drifting motion
        this.vx = (Math.random() - 0.5) * 0.35;
        this.vy = (Math.random() - 0.5) * 0.35 - 0.08; // Very slight upward drift (anti-gravity)
        this.size = Math.random() * 2 + 1; // 1px to 3px
        this.life = 1.0;
        this.decay = 0;
      } else {
        // Burst outwards from cursor + momentum
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 1.6 + 0.4;
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed - 0.3; // Upward drift
        this.size = Math.random() * 1.5 + 0.5; // Fine medical tech dust
        this.life = 1.0;
        this.decay = Math.random() * 0.018 + 0.008; // Fade duration
      }
      
      this.colorObj = COLORS[Math.floor(Math.random() * COLORS.length)];
      this.wobbleSpeed = Math.random() * 0.03 + 0.01;
      this.wobbleOffset = Math.random() * Math.PI * 2;
    }

    update() {
      if (!this.isAmbient) {
        // Apply friction to cursor particles
        this.vx *= 0.96;
        this.vy *= 0.96;
        this.vy -= 0.02; // anti-gravity lift
        this.life -= this.decay;
      } else {
        // Gentle upward drift limits
        this.vy -= 0.001;
        if (this.vy < -0.5) this.vy = -0.25;

        // Warp bounds for seamless ambient drift
        if (this.x < -10) this.x = canvas.width + 10;
        if (this.x > canvas.width + 10) this.x = -10;
        if (this.y < -10) this.y = canvas.height + 10;
        if (this.y > canvas.height + 10) this.y = -10;
      }

      this.x += this.vx;
      this.y += this.vy;
      
      // Floating sinusoidal wobble
      this.x += Math.sin(Date.now() * this.wobbleSpeed + this.wobbleOffset) * 0.08;
    }

    draw() {
      const alpha = this.isAmbient ? 0.3 : this.life * 0.55;
      const rgb = this.colorObj;

      // Draw Main Node Circle
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
      ctx.fill();

      // Soft Glow Ring
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size * 3.5, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha * 0.2})`;
      ctx.fill();
    }
  }

  // Populate ambient nodes
  for (let i = 0; i < AMBIENT_COUNT; i++) {
    ambientParticles.push(new Node(true));
  }

  // Event Listeners for Cursor tracking
  if (!isTouchDevice) {
    heroSection.addEventListener('mousemove', (e) => {
      const rect = heroSection.getBoundingClientRect();
      mouseX = e.clientX - rect.left;
      mouseY = e.clientY - rect.top;
      mouseInHero = true;

      // Distance traveled control to spawn rate
      const dx = mouseX - lastMouseX;
      const dy = mouseY - lastMouseY;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist > 1.5) {
        const count = Math.min(2, Math.floor(dist / 6) + 1);
        for (let i = 0; i < count; i++) {
          if (particles.length < MAX_TEMP_PARTICLES) {
            const jitterX = (Math.random() - 0.5) * 5;
            const jitterY = (Math.random() - 0.5) * 5;
            particles.push(new Node(false, mouseX + jitterX, mouseY + jitterY));
          }
        }
      }

      lastMouseX = mouseX;
      lastMouseY = mouseY;
    }, { passive: true });

    heroSection.addEventListener('mouseenter', (e) => {
      const rect = heroSection.getBoundingClientRect();
      mouseX = e.clientX - rect.left;
      mouseY = e.clientY - rect.top;
      mouseInHero = true;
    }, { passive: true });

    heroSection.addEventListener('mouseleave', () => {
      mouseInHero = false;
    }, { passive: true });
  }

  // Primary animation loop
  function tick() {
    // Dynamic fallback resize check
    if (canvas.width === 0 || canvas.height === 0) {
      resize();
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Merge lists to draw full interconnected network
    const allNodes = [...ambientParticles, ...particles];

    // Update and Draw Nodes
    allNodes.forEach(node => {
      node.update();
      node.draw();
    });

    // Cleanup expired particles
    for (let i = particles.length - 1; i >= 0; i--) {
      if (particles[i].life <= 0) {
        particles.splice(i, 1);
      }
    }

    // Draw Neural Connection Mesh
    ctx.lineWidth = 0.45;
    for (let i = 0; i < allNodes.length; i++) {
      const n1 = allNodes[i];
      const n1Alpha = n1.isAmbient ? 0.3 : n1.life * 0.55;

      for (let j = i + 1; j < allNodes.length; j++) {
        const n2 = allNodes[j];
        const dx = n1.x - n2.x;
        const dy = n1.y - n2.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        // Distance threshold for inter-node lines
        const threshold = 85;
        if (dist < threshold) {
          const n2Alpha = n2.isAmbient ? 0.3 : n2.life * 0.55;
          const lineAlpha = (1 - (dist / threshold)) * 0.12 * Math.min(n1Alpha, n2Alpha);
          
          ctx.beginPath();
          ctx.moveTo(n1.x, n1.y);
          ctx.lineTo(n2.x, n2.y);
          ctx.strokeStyle = `rgba(0, 130, 255, ${lineAlpha})`; // Electric Blue Connections
          ctx.stroke();
        }
      }

      // Draw Cursor interaction connections
      if (mouseInHero) {
        const dx = n1.x - mouseX;
        const dy = n1.y - mouseY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const cursorThreshold = 120; // Active connection radius for cursor

        if (dist < cursorThreshold) {
          const lineAlpha = (1 - (dist / cursorThreshold)) * 0.24 * n1Alpha;
          ctx.beginPath();
          ctx.moveTo(n1.x, n1.y);
          ctx.lineTo(mouseX, mouseY);
          ctx.strokeStyle = `rgba(0, 209, 255, ${lineAlpha})`; // Glowing Cyan connections
          ctx.stroke();
        }
      }
    }

    requestAnimationFrame(tick);
  }

  requestAnimationFrame(tick);
})();
