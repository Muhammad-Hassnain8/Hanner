// src/renderer/enhanced-canvas.js
// HANNER - HAWK NETWORK SCANNER
// INTERACTIVE RADIAL NETWORK WITH FULL IP DISPLAY

class CosmicTreeVisualizer {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) {
            console.error('Canvas not found!');
            return;
        }
        
        this.ctx = this.canvas.getContext('2d');
        this.hosts = [];
        this.ports = [];
        this.networkInfo = null;
        
        // Store original positions for reset
        this.originalNodes = [];
        this.originalHosts = [];
        this.originalPorts = [];
        
        // Node storage
        this.nodes = [];
        this.selectedNode = null;
        this.dragging = false;
        this.dragNode = null;
        this.dragOffsetX = 0;
        this.dragOffsetY = 0;
        
        // Animation state
        this.time = 0;
        this.packets = [];
        this.particles = [];
        this.animationFrame = null;
        this.animationEnabled = true;
        
        // Colors
        this.colors = {
            gateway: '#8b5cf6',
            host: '#3b82f6',
            port: '#10b981',
            selected: '#f59e0b',
            text: '#ffffff'
        };
        
        this.init();
        this.createParticles(30);
        this.startAnimation();
        this.setupEventListeners();
    }
    
    init() {
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
    }
    
    setupEventListeners() {
        this.canvas.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        this.canvas.addEventListener('mouseup', () => this.handleMouseUp());
        this.canvas.addEventListener('mouseleave', () => this.handleMouseUp());
    }
    
    handleMouseDown(e) {
        const rect = this.canvas.getBoundingClientRect();
        const scaleX = this.canvas.width / rect.width;
        const scaleY = this.canvas.height / rect.height;
        
        const mouseX = (e.clientX - rect.left) * scaleX;
        const mouseY = (e.clientY - rect.top) * scaleY;
        
        // Check for node click
        for (let i = this.nodes.length - 1; i >= 0; i--) {
            const node = this.nodes[i];
            const dx = mouseX - node.x;
            const dy = mouseY - node.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            if (dist < node.radius + 5) {
                this.selectedNode = node;
                this.dragging = true;
                this.dragNode = node;
                this.dragOffsetX = node.x - mouseX;
                this.dragOffsetY = node.y - mouseY;
                
                this.canvas.style.cursor = 'grabbing';
                
                if (this.onNodeSelected) {
                    this.onNodeSelected(node);
                }
                break;
            }
        }
    }
    
    handleMouseMove(e) {
        if (!this.dragging || !this.dragNode) return;
        
        const rect = this.canvas.getBoundingClientRect();
        const scaleX = this.canvas.width / rect.width;
        const scaleY = this.canvas.height / rect.height;
        
        const mouseX = (e.clientX - rect.left) * scaleX;
        const mouseY = (e.clientY - rect.top) * scaleY;
        
        this.dragNode.x = mouseX + this.dragOffsetX;
        this.dragNode.y = mouseY + this.dragOffsetY;
        
        // Boundary constraints
        this.dragNode.x = Math.max(20, Math.min(this.canvas.width - 20, this.dragNode.x));
        this.dragNode.y = Math.max(20, Math.min(this.canvas.height - 20, this.dragNode.y));
    }
    
    handleMouseUp() {
        this.dragging = false;
        this.dragNode = null;
        this.canvas.style.cursor = 'default';
    }
    
    resizeCanvas() {
        if (!this.canvas) return;
        const container = this.canvas.parentElement;
        if (!container) return;
        
        const oldWidth = this.canvas.width;
        const oldHeight = this.canvas.height;
        
        this.canvas.width = container.clientWidth || 800;
        this.canvas.height = container.clientHeight || 600;
        
        // Only rebuild if dimensions actually changed
        if (oldWidth !== this.canvas.width || oldHeight !== this.canvas.height) {
            this.rebuildNodes();
        }
    }
    
    startAnimation() {
        const animate = () => {
            this.time += 0.02;
            if (this.animationEnabled) {
                this.updatePackets();
                this.updateParticles();
            }
            this.draw();
            this.animationFrame = requestAnimationFrame(animate);
        };
        animate();
    }
    
    stopAnimation() {
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
        }
    }
    
    resetView() {
        if (!this.canvas) return;
        
        console.log('Resetting view...');
        
        // Clear current nodes
        this.nodes = [];
        
        // Rebuild from original data
        if (this.originalHosts.length > 0 || this.originalPorts.length > 0) {
            this.rebuildNodes();
        } else if (this.hosts.length > 0) {
            // Fallback to current data
            this.rebuildNodes();
        }
        
        // Reset state
        this.dragging = false;
        this.dragNode = null;
        this.selectedNode = null;
        
        // Force redraw
        this.draw();
        
        console.log('View reset complete');
    }
    
    createParticles(count) {
        for (let i = 0; i < count; i++) {
            this.particles.push({
                x: Math.random(),
                y: Math.random(),
                size: Math.random() * 2 + 1,
                speed: 0.001 + Math.random() * 0.002,
                angle: Math.random() * Math.PI * 2,
                opacity: 0.3 + Math.random() * 0.3
            });
        }
    }
    
    updateParticles() {
        this.particles.forEach(p => {
            p.x += Math.cos(p.angle) * p.speed;
            p.y += Math.sin(p.angle) * p.speed;
            
            if (p.x < 0) p.x = 1;
            if (p.x > 1) p.x = 0;
            if (p.y < 0) p.y = 1;
            if (p.y > 1) p.y = 0;
            
            p.opacity = 0.3 + Math.sin(this.time * 2 + p.angle) * 0.1;
        });
    }
    
    updatePackets() {
        this.packets = this.packets.filter(p => {
            p.progress += 0.005;
            return p.progress < 1;
        });
        
        if (Math.random() < 0.02 && this.hosts.length > 0) {
            this.createPacket();
        }
    }
    
    createPacket() {
        this.packets.push({
            progress: 0,
            speed: 0.005 + Math.random() * 0.005
        });
    }
    
    updateNetworkData(networkInfo, hosts, ports) {
        this.networkInfo = networkInfo;
        this.hosts = hosts || [];
        this.ports = ports || [];
        
        // Store originals for reset
        this.originalHosts = [...this.hosts];
        this.originalPorts = [...this.ports];
        
        this.rebuildNodes();
    }
    
    rebuildNodes() {
        this.nodes = [];
        
        const w = this.canvas.width;
        const h = this.canvas.height;
        const centerX = w / 2;
        const centerY = h / 2;
        
        // Gateway node
        const gateway = {
            id: 'gateway',
            type: 'gateway',
            x: centerX,
            y: centerY,
            radius: 20,
            color: this.colors.gateway,
            data: { name: 'GATEWAY' },
            fullIp: null
        };
        this.nodes.push(gateway);
        
        if (!this.hosts.length) return;
        
        // Host nodes in circle
        const hostRadius = Math.min(w, h) * 0.3;
        const hostCount = Math.min(this.hosts.length, 12);
        
        for (let i = 0; i < hostCount; i++) {
            const angle = (i / hostCount) * Math.PI * 2 - Math.PI/2;
            const x = centerX + Math.cos(angle) * hostRadius;
            const y = centerY + Math.sin(angle) * hostRadius;
            const host = this.hosts[i];
            
            const hostNode = {
                id: host,
                type: 'host',
                x, y,
                radius: 12,
                color: this.colors.host,
                data: { ip: host, lastOctet: host.split('.')[3] },
                hostIndex: i,
                fullIp: host
            };
            this.nodes.push(hostNode);
            
            // Port nodes for this host
            const hostPorts = this.ports.filter(p => p.host === host).slice(0, 8);
            const portRadius = 35;
            
            hostPorts.forEach((port, j) => {
                const portAngle = angle + (j - hostPorts.length/2) * 0.3;
                const px = x + Math.cos(portAngle) * portRadius;
                const py = y + Math.sin(portAngle) * portRadius;
                
                this.nodes.push({
                    id: `${host}:${port.port}`,
                    type: 'port',
                    x: px,
                    y: py,
                    radius: 6,
                    color: this.colors.port,
                    data: port,
                    hostIndex: i,
                    portIndex: j,
                    fullIp: null
                });
            });
        }
        
        // Save original positions (deep copy)
        this.originalNodes = JSON.parse(JSON.stringify(this.nodes));
    }
    
    draw() {
        if (!this.ctx || !this.canvas) return;
        
        const w = this.canvas.width;
        const h = this.canvas.height;
        if (w <= 0 || h <= 0) return;
        
        this.ctx.clearRect(0, 0, w, h);
        this.drawBackground();
        this.drawParticles();
        this.drawConnections();
        this.drawNodes();
        this.drawPackets();
    }
    
    drawBackground() {
        const gradient = this.ctx.createRadialGradient(
            this.canvas.width/2, this.canvas.height/2, 0,
            this.canvas.width/2, this.canvas.height/2, this.canvas.width/2
        );
        gradient.addColorStop(0, '#0a0a1a');
        gradient.addColorStop(1, '#03030a');
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }
    
    drawParticles() {
        this.particles.forEach(p => {
            this.ctx.fillStyle = `rgba(100, 150, 255, ${p.opacity})`;
            this.ctx.beginPath();
            this.ctx.arc(
                p.x * this.canvas.width,
                p.y * this.canvas.height,
                p.size,
                0,
                Math.PI * 2
            );
            this.ctx.fill();
        });
    }
    
    drawConnections() {
        const gateway = this.nodes.find(n => n.type === 'gateway');
        if (!gateway) return;
        
        const hosts = this.nodes.filter(n => n.type === 'host');
        
        // Gateway to host connections
        hosts.forEach(host => {
            this.ctx.beginPath();
            this.ctx.moveTo(gateway.x, gateway.y);
            this.ctx.lineTo(host.x, host.y);
            
            const pulse = Math.sin(this.time * 2 + (host.hostIndex || 0)) * 0.3 + 0.7;
            this.ctx.strokeStyle = `rgba(59, 130, 246, ${pulse * 0.6})`;
            this.ctx.lineWidth = 1.5;
            this.ctx.stroke();
        });
        
        // Host to port connections
        hosts.forEach(host => {
            const ports = this.nodes.filter(n => n.type === 'port' && n.hostIndex === host.hostIndex);
            
            ports.forEach(port => {
                this.ctx.beginPath();
                this.ctx.moveTo(host.x, host.y);
                this.ctx.lineTo(port.x, port.y);
                this.ctx.strokeStyle = 'rgba(16, 185, 129, 0.4)';
                this.ctx.lineWidth = 1;
                this.ctx.stroke();
            });
        });
    }
    
    drawNode(x, y, radius, color, label, fullIp = null) {
        // Glow effect
        this.ctx.shadowColor = color;
        this.ctx.shadowBlur = 15;
        
        // Main circle
        this.ctx.fillStyle = color;
        this.ctx.beginPath();
        this.ctx.arc(x, y, radius, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Inner highlight
        this.ctx.shadowBlur = 5;
        this.ctx.fillStyle = '#ffffff';
        this.ctx.globalAlpha = 0.3;
        this.ctx.beginPath();
        this.ctx.arc(x - 2, y - 2, radius * 0.3, 0, Math.PI * 2);
        this.ctx.fill();
        
        this.ctx.globalAlpha = 1;
        this.ctx.shadowBlur = 0;
        
        // Label above node
        if (label) {
            this.ctx.font = 'bold 10px "Courier Prime", monospace';
            this.ctx.fillStyle = '#ffffff';
            this.ctx.shadowColor = '#000000';
            this.ctx.shadowBlur = 3;
            this.ctx.textAlign = 'center';
            this.ctx.fillText(label.toString(), x, y - radius - 8);
        }
        
        // Full IP below node
        if (fullIp) {
            this.ctx.font = '8px "Courier Prime", monospace';
            this.ctx.fillStyle = '#a0b0cc';
            this.ctx.shadowBlur = 2;
            this.ctx.fillText(fullIp, x, y + radius + 15);
        }
    }
    
    drawNodes() {
        this.nodes.forEach(node => {
            const isSelected = this.selectedNode === node;
            
            let radius = node.radius;
            if (isSelected) {
                radius *= 1.2 + Math.sin(this.time * 5) * 0.1;
            }
            
            let color = node.color;
            if (isSelected) {
                color = this.colors.selected;
            }
            
            if (node.type === 'host') {
                this.drawNode(
                    node.x, node.y, 
                    radius, 
                    color, 
                    node.data?.lastOctet || node.id.split('.')[3],
                    node.fullIp
                );
            } else if (node.type === 'gateway') {
                this.drawNode(
                    node.x, node.y, 
                    radius, 
                    color, 
                    'GATEWAY',
                    null
                );
            } else {
                let label = node.data?.port ? node.data.port.toString() : '';
                this.drawNode(
                    node.x, node.y, 
                    radius, 
                    color, 
                    label,
                    null
                );
            }
        });
    }
    
    drawPackets() {
        const gateway = this.nodes.find(n => n.type === 'gateway');
        const hosts = this.nodes.filter(n => n.type === 'host');
        
        if (!gateway || !hosts.length) return;
        
        this.packets.forEach(p => {
            const targetHost = hosts[Math.floor(Math.random() * hosts.length)];
            
            const x = gateway.x + (targetHost.x - gateway.x) * p.progress;
            const y = gateway.y + (targetHost.y - gateway.y) * p.progress;
            
            this.ctx.shadowColor = '#00ffff';
            this.ctx.shadowBlur = 10;
            this.ctx.fillStyle = '#ffffff';
            this.ctx.beginPath();
            this.ctx.arc(x, y, 4, 0, Math.PI * 2);
            this.ctx.fill();
            
            this.ctx.shadowBlur = 5;
            this.ctx.fillStyle = 'rgba(100, 200, 255, 0.5)';
            this.ctx.beginPath();
            this.ctx.arc(x - 5, y - 5, 2, 0, Math.PI * 2);
            this.ctx.fill();
        });
        
        this.ctx.shadowBlur = 0;
    }
    
    // Public API
    setMousePosition(x, y) {}
    clearMousePosition() {}
    
    setOnNodeSelected(callback) {
        this.onNodeSelected = callback;
    }
    
    getSelectedNode() {
        return this.selectedNode;
    }
    
    startPortScan(host, ports) {
        if (ports && ports.length) {
            for (let i = 0; i < 3; i++) {
                setTimeout(() => this.createPacket(), i * 200);
            }
        }
    }
}

window.CosmicTreeVisualizer = CosmicTreeVisualizer;