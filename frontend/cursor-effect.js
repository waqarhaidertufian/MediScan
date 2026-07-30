/**
 * Google Antigravity Style Custom Cursor Particle Effect
 * Built using HTML5 Canvas & Vanilla JS for maximum 60FPS performance.
 * Features multi-colored particles (blue, red, yellow, purple, orange),
 * anti-gravity floating physics, and organic streaks/dashes.
 */

(function () {
  'use strict';

  // Prevent duplicate execution if the script is loaded multiple times (e.g. static script tag + dynamic nav loading)
  if (window.customCursorInitialized) {
    return;
  }
  window.customCursorInitialized = true;

  // 1. Disable on touch-only devices (devices without hover capabilities like phones/tablets)
  const isTouchDevice = window.matchMedia && window.matchMedia('(hover: none)').matches;
  if (isTouchDevice) {
    return;
  }

  // 2. State Variables
  let mouseX = 0;
  let mouseY = 0;
  let lastMouseX = 0;
  let lastMouseY = 0;
  
  let ringX = 0;
  let ringY = 0;
  
  let ringScale = 1.0;
  let targetScale = 1.0;
  
  let isMouseInWindow = false;
  let isHovering = false;
  let ambientTimer = 0;

  const particles = [];
  const MAX_PARTICLES = 150; // Performance safeguard cap

  // 3. Multi-colored Palette Config (Blue, Red, Yellow, Purple, Orange)
  const COLORS = [
    { r: 0, g: 98, b: 255 },     // Blue
    { r: 255, g: 65, b: 54 },    // Red
    { r: 255, g: 220, b: 0 },    // Yellow
    { r: 177, g: 13, b: 201 },   // Purple
    { r: 255, g: 133, b: 27 }    // Orange
  ];

  // 4. DOM Elements
  let canvas, ctx;
  let cursorDot, cursorRing;

  function init() {
    // Add activation class to body to enable custom cursor hiding
    document.body.classList.add('luxury-cursor-active');

    // Create Canvas for Particle Layer
    canvas = document.createElement('canvas');
    canvas.id = 'luxury-cursor-canvas';
    document.body.appendChild(canvas);
    ctx = canvas.getContext('2d');

    // Create Custom Cursor Ring
    cursorRing = document.createElement('div');
    cursorRing.className = 'luxury-cursor-ring';
    document.body.appendChild(cursorRing);

    // Create Custom Cursor Dot
    cursorDot = document.createElement('div');
    cursorDot.className = 'luxury-cursor-dot';
    document.body.appendChild(cursorDot);

    // Adjust canvas sizes
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Bind Event Listeners
    setupEventListeners();

    // Start rendering loop
    requestAnimationFrame(tick);
  }

  // 5. Canvas Resize Handler
  function resizeCanvas() {
    const dpr = window.devicePixelRatio || 1;
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    ctx.scale(dpr, dpr);
  }

  // 6. Particle Class definition
  class Particle {
    constructor(x, y) {
      this.x = x;
      this.y = y;
      
      // Keep track of previous coordinates for drawing organic streaks
      this.px = x;
      this.py = y;
      
      // Calculate mouse movement direction and velocity
      const dx = mouseX - lastMouseX;
      const dy = mouseY - lastMouseY;
      
      // Initial velocity: explosion outwards in random directions + cursor momentum
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 2.5 + 0.8;
      this.vx = Math.cos(angle) * speed + dx * 0.15;
      this.vy = Math.sin(angle) * speed + dy * 0.15;
      
      // Size variety
      this.size = Math.random() * 2.5 + 0.8; // 0.8px to 3.3px
      
      // Lifespan & fade parameters
      this.life = 1.0;
      this.decay = Math.random() * 0.015 + 0.01; // Lives for ~40 to 100 frames
      
      // Select random color from the Google Antigravity inspired palette
      this.colorObj = COLORS[Math.floor(Math.random() * COLORS.length)];
      
      // Shape variety: small dots or slight organic streaks/dashes
      this.type = Math.random() > 0.4 ? 'streak' : 'dot';
      
      // Organic drifting wobble offset
      this.wobbleSpeed = Math.random() * 0.04 + 0.02;
      this.wobbleOffset = Math.random() * Math.PI * 2;
    }

    update() {
      // Store current position as previous position
      this.px = this.x;
      this.py = this.y;
      
      // Apply friction/drag (particles slow down gradually)
      this.vx *= 0.95;
      this.vy *= 0.95;
      
      // Anti-gravity floating force (upwards movement)
      this.vy -= 0.06;
      
      // Apply velocities
      this.x += this.vx;
      this.y += this.vy;
      
      // Organic drifting wobble (wave-like horizontal movement)
      this.x += Math.sin(this.life * 6 + this.wobbleOffset) * 0.25;
      
      // Decay lifespan
      this.life -= this.decay;
    }

    draw() {
      if (this.life <= 0) return;
      
      // Smooth fade transition
      const easedOpacity = this.life * this.life;
      const rgb = this.colorObj;

      if (this.type === 'dot') {
        // Draw Outer Soft Glow
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size * 3, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${easedOpacity * 0.12})`;
        ctx.fill();

        // Draw Sharp Core
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${easedOpacity * 0.85})`;
        ctx.fill();
      } else {
        // Draw organic streak/dash
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(this.px, this.py);
        
        ctx.lineWidth = this.size;
        ctx.strokeStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${easedOpacity * 0.8})`;
        ctx.lineCap = 'round';
        ctx.stroke();
      }
    }
  }

  // 7. Event Listeners Setup
  function setupEventListeners() {
    window.addEventListener('mousemove', (e) => {
      if (!isMouseInWindow) {
        isMouseInWindow = true;
        mouseX = e.clientX;
        mouseY = e.clientY;
        ringX = mouseX;
        ringY = mouseY;
        cursorDot.style.opacity = '1';
        cursorRing.style.opacity = '1';
      } else {
        mouseX = e.clientX;
        mouseY = e.clientY;
      }

      // Calculate travel distance to control spawn rate
      const dx = mouseX - lastMouseX;
      const dy = mouseY - lastMouseY;
      const distance = Math.sqrt(dx * dx + dy * dy);

      // Spawn particles on movement
      if (distance > 2) {
        const spawnCount = Math.min(5, Math.floor(distance / 4) + 1);
        for (let i = 0; i < spawnCount; i++) {
          if (particles.length < MAX_PARTICLES) {
            // Slight spatial jitter for natural dispersion
            const jitterX = (Math.random() - 0.5) * 5;
            const jitterY = (Math.random() - 0.5) * 5;
            particles.push(new Particle(mouseX + jitterX, mouseY + jitterY));
          }
        }
      }

      lastMouseX = mouseX;
      lastMouseY = mouseY;
    });

    document.addEventListener('mouseleave', () => {
      cursorDot.style.opacity = '0';
      cursorRing.style.opacity = '0';
      isMouseInWindow = false;
    });

    document.addEventListener('mouseenter', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      ringX = mouseX;
      ringY = mouseY;
      cursorDot.style.opacity = '1';
      cursorRing.style.opacity = '1';
      isMouseInWindow = true;
    });

    // Elegant hover interactions
    document.addEventListener('mouseover', (e) => {
      const target = e.target.closest('a, button, [role="button"], input, select, textarea, .stat-item, .workflow-item, .feature, .testimonial, .clickable, .reset-button');
      if (target) {
        isHovering = true;
        targetScale = 1.6;
        cursorRing.classList.add('hover-active');
        cursorDot.classList.add('hover-active');
      }
    });

    document.addEventListener('mouseout', (e) => {
      const target = e.target.closest('a, button, [role="button"], input, select, textarea, .stat-item, .workflow-item, .feature, .testimonial, .clickable, .reset-button');
      if (target) {
        isHovering = false;
        targetScale = 1.0;
        cursorRing.classList.remove('hover-active');
        cursorDot.classList.remove('hover-active');
      }
    });
    
    // Spurt of particles on click
    window.addEventListener('click', () => {
      const clickSpurt = 12;
      for (let i = 0; i < clickSpurt; i++) {
        if (particles.length < MAX_PARTICLES + 20) {
          const p = new Particle(mouseX, mouseY);
          // Give stronger burst velocity
          const angle = Math.random() * Math.PI * 2;
          const speed = Math.random() * 4 + 2;
          p.vx = Math.cos(angle) * speed;
          p.vy = Math.sin(angle) * speed - 1.5; // Upwards momentum
          particles.push(p);
        }
      }
    });
  }

  // 8. Animation Loop
  function tick() {
    // Clear Canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (isMouseInWindow) {
      // Easing calculations for custom cursor Ring and Dot
      ringX += (mouseX - ringX) * 0.14;
      ringY += (mouseY - ringY) * 0.14;

      ringScale += (targetScale - ringScale) * 0.15;

      cursorRing.style.transform = `translate3d(${ringX - 17}px, ${ringY - 17}px, 0) scale(${ringScale})`;
      cursorDot.style.transform = `translate3d(${mouseX - 3}px, ${mouseY - 3}px, 0)`;

      // Ambient particle spawn when cursor is idle
      ambientTimer++;
      if (ambientTimer % 15 === 0) {
        if (particles.length < MAX_PARTICLES) {
          const jitterX = (Math.random() - 0.5) * 8;
          const jitterY = (Math.random() - 0.5) * 8;
          particles.push(new Particle(mouseX + jitterX, mouseY + jitterY));
        }
      }
    }

    // Update and draw particles
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.update();
      p.draw();

      if (p.life <= 0) {
        particles.splice(i, 1);
      }
    }

    requestAnimationFrame(tick);
  }

  // Initialize
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
