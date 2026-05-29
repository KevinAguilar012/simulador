/**
 * background.js
 * Animated and interactive technological background for the Simulator.
 * Creates a constellation of floating nodes with connecting lines,
 * mouse attraction/interaction, moving data packets, and a digital grid.
 */

class TechBackground {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return;
        this.ctx = this.canvas.getContext('2d');
        
        this.particles = [];
        this.dataPackets = [];
        this.mouse = { x: null, y: null, radius: 150 };
        
        // Configuration
        this.config = {
            particleCount: 80,
            maxDistance: 120, // Max distance for lines between nodes
            particleSpeed: 0.5,
            gridSize: 50,     // Pixel size of the digital grid background
            gridOpacity: 0.04,
            glowColor: 'rgba(0, 210, 255, 0.8)',
            packetSpawnChance: 0.01 // Chance of spawning a data packet along a link per frame
        };
        
        // Colors matching the exam subjects (Cyan/Blue for Math, Purple/Pink for Verbal)
        this.colors = [
            '#00d2ff', // Cyan
            '#0066ff', // Deep Blue
            '#7928ca', // Purple
            '#ff007f'  // Neon Pink
        ];

        this.init();
    }

    init() {
        this.resize();
        this.createParticles();
        this.setupEvents();
        this.animate();
    }

    resize() {
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        
        // Adjust particle density based on screen size
        const area = this.width * this.height;
        this.config.particleCount = Math.min(120, Math.floor(area / 15000));
        this.createParticles();
    }

    createParticles() {
        this.particles = [];
        for (let i = 0; i < this.config.particleCount; i++) {
            this.particles.push({
                x: Math.random() * this.width,
                y: Math.random() * this.height,
                vx: (Math.random() - 0.5) * this.config.particleSpeed * 2,
                vy: (Math.random() - 0.5) * this.config.particleSpeed * 2,
                radius: Math.random() * 2.5 + 1,
                color: this.colors[Math.floor(Math.random() * this.colors.length)],
                originalRadius: Math.random() * 2.5 + 1,
                pulseSpeed: 0.02 + Math.random() * 0.03,
                pulseTime: Math.random() * Math.PI * 2
            });
        }
    }

    setupEvents() {
        window.addEventListener('resize', () => this.resize());
        
        window.addEventListener('mousemove', (e) => {
            this.mouse.x = e.clientX;
            this.mouse.y = e.clientY;
        });

        window.addEventListener('mouseout', () => {
            this.mouse.x = null;
            this.mouse.y = null;
        });
    }

    drawGrid() {
        this.ctx.strokeStyle = `rgba(0, 210, 255, ${this.config.gridOpacity})`;
        this.ctx.lineWidth = 1;

        // Draw vertical lines
        for (let x = 0; x < this.width; x += this.config.gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.height);
            this.ctx.stroke();
        }

        // Draw horizontal lines
        for (let y = 0; y < this.height; y += this.config.gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.width, y);
            this.ctx.stroke();
        }
        
        // Draw subtle technological crosshairs/decorations at some intersections
        this.ctx.fillStyle = `rgba(0, 210, 255, ${this.config.gridOpacity * 2.5})`;
        for (let x = this.config.gridSize * 2; x < this.width; x += this.config.gridSize * 5) {
            for (let y = this.config.gridSize * 2; y < this.height; y += this.config.gridSize * 5) {
                this.ctx.beginPath();
                this.ctx.arc(x, y, 2, 0, Math.PI * 2);
                this.ctx.fill();
            }
        }
    }

    updateAndDrawParticles() {
        this.particles.forEach(p => {
            // Update position
            p.x += p.vx;
            p.y += p.vy;

            // Bounce off edges with a slight offset so they don't clip
            if (p.x < 0 || p.x > this.width) p.vx *= -1;
            if (p.y < 0 || p.y > this.height) p.vy *= -1;

            // Subtle pulsing size effect for node glow
            p.pulseTime += p.pulseSpeed;
            p.radius = p.originalRadius + Math.sin(p.pulseTime) * 0.8;

            // Mouse interaction: gentle repulsion or attraction
            if (this.mouse.x !== null && this.mouse.y !== null) {
                const dx = p.x - this.mouse.x;
                const dy = p.y - this.mouse.y;
                const dist = Math.hypot(dx, dy);
                
                if (dist < this.mouse.radius) {
                    const force = (this.mouse.radius - dist) / this.mouse.radius;
                    // Gentle push away
                    p.x += (dx / dist) * force * 1.2;
                    p.y += (dy / dist) * force * 1.2;
                }
            }

            // Draw particle
            this.ctx.fillStyle = p.color;
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            this.ctx.fill();

            // Glow effect
            if (p.radius > 2) {
                this.ctx.shadowColor = p.color;
                this.ctx.shadowBlur = 10;
                this.ctx.beginPath();
                this.ctx.arc(p.x, p.y, p.radius + 1, 0, Math.PI * 2);
                this.ctx.fillStyle = `rgba(${this.hexToRgb(p.color)}, 0.3)`;
                this.ctx.fill();
                this.ctx.shadowBlur = 0; // Reset shadow
            }
        });
    }

    drawConnections() {
        for (let i = 0; i < this.particles.length; i++) {
            const p1 = this.particles[i];
            
            for (let j = i + 1; j < this.particles.length; j++) {
                const p2 = this.particles[j];
                const dx = p1.x - p2.x;
                const dy = p1.y - p2.y;
                const dist = Math.hypot(dx, dy);

                if (dist < this.config.maxDistance) {
                    // Alpha gets lower as distance gets larger
                    const alpha = (1 - dist / this.config.maxDistance) * 0.22;
                    
                    // Gradient connection between the two particle colors
                    const grad = this.ctx.createLinearGradient(p1.x, p1.y, p2.x, p2.y);
                    grad.addColorStop(0, `rgba(${this.hexToRgb(p1.color)}, ${alpha})`);
                    grad.addColorStop(1, `rgba(${this.hexToRgb(p2.color)}, ${alpha})`);
                    
                    this.ctx.strokeStyle = grad;
                    this.ctx.lineWidth = 1;
                    this.ctx.beginPath();
                    this.ctx.moveTo(p1.x, p1.y);
                    this.ctx.lineTo(p2.x, p2.y);
                    this.ctx.stroke();

                    // Randomly spawn a data packet traveling along this path
                    if (Math.random() < this.config.packetSpawnChance && this.dataPackets.length < 15) {
                        this.dataPackets.push({
                            start: p1,
                            end: p2,
                            progress: 0,
                            speed: 0.015 + Math.random() * 0.02,
                            color: Math.random() > 0.5 ? p1.color : p2.color
                        });
                    }
                }
            }

            // Connection to mouse
            if (this.mouse.x !== null && this.mouse.y !== null) {
                const dx = p1.x - this.mouse.x;
                const dy = p1.y - this.mouse.y;
                const dist = Math.hypot(dx, dy);

                if (dist < this.mouse.radius) {
                    const alpha = (1 - dist / this.mouse.radius) * 0.35;
                    this.ctx.strokeStyle = `rgba(0, 210, 255, ${alpha})`;
                    this.ctx.lineWidth = 1.2;
                    this.ctx.beginPath();
                    this.ctx.moveTo(p1.x, p1.y);
                    this.ctx.lineTo(this.mouse.x, this.mouse.y);
                    this.ctx.stroke();
                }
            }
        }
    }

    updateAndDrawPackets() {
        for (let i = this.dataPackets.length - 1; i >= 0; i--) {
            const dp = this.dataPackets[i];
            
            // Advance progress along the segment
            dp.progress += dp.speed;

            if (dp.progress >= 1) {
                // Packet reached destination, remove it
                this.dataPackets.splice(i, 1);
                continue;
            }

            // Calculate current position
            const x = dp.start.x + (dp.end.x - dp.start.x) * dp.progress;
            const y = dp.start.y + (dp.end.y - dp.start.y) * dp.progress;

            // Draw glowing data packet (small bright dot with trail)
            this.ctx.shadowColor = dp.color;
            this.ctx.shadowBlur = 8;
            this.ctx.fillStyle = '#ffffff';
            this.ctx.beginPath();
            this.ctx.arc(x, y, 2.2, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.shadowBlur = 0; // Reset

            // Draw a subtle trail
            const trailLength = 0.15;
            const trailProgress = Math.max(0, dp.progress - trailLength);
            const tx = dp.start.x + (dp.end.x - dp.start.x) * trailProgress;
            const ty = dp.start.y + (dp.end.y - dp.start.y) * trailProgress;
            
            const grad = this.ctx.createLinearGradient(x, y, tx, ty);
            grad.addColorStop(0, `rgba(${this.hexToRgb(dp.color)}, 0.6)`);
            grad.addColorStop(1, `rgba(${this.hexToRgb(dp.color)}, 0)`);
            
            this.ctx.strokeStyle = grad;
            this.ctx.lineWidth = 2.5;
            this.ctx.beginPath();
            this.ctx.moveTo(x, y);
            this.ctx.lineTo(tx, ty);
            this.ctx.stroke();
        }
    }

    hexToRgb(hex) {
        // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
        const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
        hex = hex.replace(shorthandRegex, (m, r, g, b) => r + r + g + g + b + b);

        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? 
            `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` 
            : '0, 210, 255';
    }

    animate() {
        // Clearing canvas with a very slight semi-transparency creates a beautiful faint motion blur
        this.ctx.fillStyle = 'rgba(8, 16, 38, 0.25)'; // Deep high-tech background color dark blue
        this.ctx.fillRect(0, 0, this.width, this.height);

        this.drawGrid();
        this.drawConnections();
        this.updateAndDrawParticles();
        this.updateAndDrawPackets();

        requestAnimationFrame(() => this.animate());
    }
}

// Instantiate when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new TechBackground('bg-canvas');
});
