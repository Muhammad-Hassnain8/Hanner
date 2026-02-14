// src/renderer/app.js
// HANNER - HAWK NETWORK SCANNER
// COMPLETE UI CONTROLLER

class HannerUI {
    constructor() {
        this.hosts = [];
        this.openPorts = [];
        this.networkInfo = null;
        this.isScanning = false;
        this.scanProgress = 0;
        this.currentTarget = null;
        
        this.init();
    }

    async init() {
        this.cacheDOM();
        this.setupEventListeners();
        this.setupVisualizer();
        this.initLayout();
        
        await this.autoDetectAndScan();
        this.updateSystemInfo();
    }

    cacheDOM() {
        // Canvas
        this.canvas = document.getElementById('networkCanvas');
        this.canvasContainer = document.getElementById('canvasContainer');
        this.visualizer = null;
        
        // Status elements
        this.statusLed = document.getElementById('statusLed');
        this.statusMessage = document.getElementById('statusMessage');
        this.footerStatus = document.getElementById('footerStatus');
        
        // Stat elements
        this.networkStat = document.getElementById('networkStat');
        this.hostStat = document.getElementById('hostStat');
        this.portStat = document.getElementById('portStat');
        
        // Tables
        this.hostsTableBody = document.getElementById('hostsTableBody');
        this.portsTableBody = document.getElementById('portsTableBody');
        
        // Host selector
        this.hostSelector = document.getElementById('hostSelector');
        
        // Banner output
        this.bannerOutput = document.getElementById('bannerOutput');
        
        // Event log
        this.eventLog = document.getElementById('eventLog');
        
        // Progress elements
        this.scanProgressContainer = document.getElementById('scanProgressContainer');
        this.scanProgressFill = document.getElementById('scanProgressFill');
        this.scanProgressPercent = document.getElementById('scanProgressPercent');
        
        // Buttons
        this.quickScanBtn = document.getElementById('quickScanBtn');
        this.deepScanBtn = document.getElementById('deepScanBtn');
        this.scanAllHostsBtn = document.getElementById('scanAllHostsBtn');
        this.rescanNetworkBtn = document.getElementById('rescanNetworkBtn');
        this.emergencyStopBtn = document.getElementById('emergencyStopBtn');
        this.exportAllDataBtn = document.getElementById('exportAllDataBtn');
        this.resetViewBtn = document.getElementById('resetViewBtn');
        this.fullscreenCanvasBtn = document.getElementById('fullscreenCanvas');
        this.toggleIpPanel = document.getElementById('toggleIpPanel');
        this.closeIpPanel = document.getElementById('closeIpPanel');
        
        // System info elements
        this.sysPlatform = document.getElementById('sysPlatformValue');
        this.sysArch = document.getElementById('sysArchValue');
        this.firewallStatus = document.getElementById('firewallStatusValue');
        this.stealthStatus = document.getElementById('stealthStatusValue');
        
        // Scan indicator
        this.scanIndicator = document.getElementById('scanIndicator');
    }

    setupEventListeners() {
        // Tab navigation
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.switchTab(e));
        });
        
        // Control buttons
        if (this.quickScanBtn) {
            this.quickScanBtn.addEventListener('click', () => this.startQuickScan());
        }
        
        if (this.deepScanBtn) {
            this.deepScanBtn.addEventListener('click', () => this.deepNetworkScan());
        }
        
        if (this.scanAllHostsBtn) {
            this.scanAllHostsBtn.addEventListener('click', () => this.scanAllHosts());
        }
        
        if (this.rescanNetworkBtn) {
            this.rescanNetworkBtn.addEventListener('click', () => this.autoDetectAndScan());
        }
        
        if (this.emergencyStopBtn) {
            this.emergencyStopBtn.addEventListener('click', () => this.stopScan());
        }
        
        if (this.exportAllDataBtn) {
            this.exportAllDataBtn.addEventListener('click', () => this.exportAllData());
        }
        
        // Reset view button
        if (this.resetViewBtn) {
            this.resetViewBtn.addEventListener('click', () => {
                if (this.visualizer) {
                    this.visualizer.resetView();
                    this.showMessage('View reset', 'success');
                }
            });
        }
        
        // Fullscreen button
        if (this.fullscreenCanvasBtn && this.canvasContainer) {
            this.fullscreenCanvasBtn.addEventListener('click', async () => {
                try {
                    if (!document.fullscreenElement) {
                        await this.canvasContainer.requestFullscreen();
                        this.fullscreenCanvasBtn.innerHTML = '<i class="fas fa-compress"></i>';
                    } else {
                        await document.exitFullscreen();
                        this.fullscreenCanvasBtn.innerHTML = '<i class="fas fa-expand"></i>';
                    }
                } catch (error) {
                    console.error('Fullscreen error:', error);
                    this.showMessage('Fullscreen failed', 'error');
                }
            });
        }
        
        // Listen for fullscreen change
        document.addEventListener('fullscreenchange', () => {
            if (this.fullscreenCanvasBtn) {
                this.fullscreenCanvasBtn.innerHTML = document.fullscreenElement ? 
                    '<i class="fas fa-compress"></i>' : 
                    '<i class="fas fa-expand"></i>';
            }
            
            setTimeout(() => {
                if (this.visualizer) {
                    this.visualizer.resizeCanvas();
                }
            }, 100);
        });
        
        // Toggle IP panel
        if (this.toggleIpPanel) {
            this.toggleIpPanel.addEventListener('click', () => {
                document.getElementById('ipListPanel')?.classList.add('open');
                this.updateIpListPanel();
            });
        }
        
        if (this.closeIpPanel) {
            this.closeIpPanel.addEventListener('click', () => {
                document.getElementById('ipListPanel')?.classList.remove('open');
            });
        }
        
        // Host selector change
        if (this.hostSelector) {
            this.hostSelector.addEventListener('change', (e) => {
                this.currentTarget = e.target.value;
            });
        }
        
        // Execute port scan
        document.getElementById('executePortScanBtn')?.addEventListener('click', () => this.executePortScan());
        
        // Banner grabbing
        document.getElementById('grabSingleBannerBtn')?.addEventListener('click', () => this.grabSingleBanner());
        document.getElementById('grabAllBannersBtn')?.addEventListener('click', () => this.grabAllBanners());
        document.getElementById('clearBannersBtn')?.addEventListener('click', () => {
            if (this.bannerOutput) this.bannerOutput.value = '';
        });
        document.getElementById('copyBannersBtn')?.addEventListener('click', () => this.copyBanners());
        
        // Host search
        document.getElementById('hostSearchInput')?.addEventListener('input', (e) => this.filterHosts(e.target.value));
        
        // Clear log
        document.getElementById('clearLogBtn')?.addEventListener('click', () => {
            if (this.eventLog) this.eventLog.innerHTML = '';
        });
        
        // Export hosts
        document.getElementById('exportHostsBtn')?.addEventListener('click', () => this.exportHosts());
        
        // Port preset
        document.getElementById('portPresetSelect')?.addEventListener('change', (e) => {
            const customInput = document.getElementById('customPortsInput');
            if (customInput) {
                customInput.style.display = e.target.value === 'custom' ? 'inline-block' : 'none';
            }
        });
    }

    setupVisualizer() {
        if (window.CosmicTreeVisualizer) {
            this.visualizer = new CosmicTreeVisualizer('networkCanvas');
            
            this.visualizer.setOnNodeSelected((node) => {
                if (node.type === 'host') {
                    this.currentTarget = node.data.ip;
                    if (this.hostSelector) {
                        this.hostSelector.value = node.data.ip;
                    }
                    this.showMessage(`Selected: ${node.data.ip}`, 'info');
                    this.updateHostsTable();
                } else if (node.type === 'port') {
                    this.showMessage(`Port ${node.data.port} on ${node.data.host}`, 'info');
                }
            });
        }
    }

    async autoDetectAndScan() {
        if (this.isScanning) {
            this.showMessage('Scan already in progress', 'warning');
            return;
        }
        
        this.updateStatus('Detecting network...', 'scanning');
        this.setScanning(true);
        
        try {
            this.networkInfo = await window.electronAPI.autoDetectNetwork();
            
            if (this.networkInfo && this.networkInfo.length > 0) {
                const primaryNetwork = this.networkInfo[0];
                
                if (this.networkStat) {
                    this.networkStat.textContent = primaryNetwork.cidr;
                }
                
                this.hosts = await window.electronAPI.discoverHosts({
                    subnet: primaryNetwork.subnet,
                    cidr: parseInt(primaryNetwork.cidr.split('/')[1])
                });
                
                this.updateHostsTable();
                this.updateHostSelector();
                this.updateIpListPanel();
                
                if (this.hostStat) {
                    this.hostStat.textContent = this.hosts.length;
                }
                
                if (this.hosts.length > 0) {
                    this.currentTarget = this.hosts[0];
                    if (this.hostSelector) {
                        this.hostSelector.value = this.hosts[0];
                    }
                }
                
                if (this.visualizer) {
                    this.visualizer.updateNetworkData(this.networkInfo, this.hosts, this.openPorts);
                }
                
                this.updateStatus(`Found ${this.hosts.length} hosts`, 'success');
                this.addLogEntry(`Network scan: ${this.hosts.length} hosts found`, 'success');
            }
        } catch (error) {
            console.error('Auto-detect failed:', error);
            this.updateStatus('Network scan failed', 'error');
            this.addLogEntry(`Scan failed: ${error.message}`, 'error');
        } finally {
            this.setScanning(false);
        }
    }

    async startQuickScan() {
        if (this.isScanning) {
            this.showMessage('Scan already in progress', 'warning');
            return;
        }
        
        let target = this.currentTarget;
        if (!target && this.hosts.length > 0) target = this.hosts[0];
        if (!target) {
            this.showMessage('No host selected', 'warning');
            return;
        }
        
        this.updateStatus(`Quick scanning ${target}...`, 'scanning');
        this.setScanning(true);
        
        if (this.scanProgressContainer) {
            this.scanProgressContainer.style.display = 'flex';
        }
        
        try {
            const ports = '21,22,23,25,53,80,110,135,139,143,443,445,993,995,1723,3306,3389,5900,8080,8443';
            
            const result = await window.electronAPI.scanPorts({
                host: target,
                ports: ports,
                options: { timeout: 300, concurrent: 50, serviceDetection: true, bannerGrab: false }
            });
            
            if (result.ports && result.ports.length > 0) {
                result.ports.forEach(p => p.host = target);
                
                const newPorts = result.ports.filter(
                    np => !this.openPorts.some(ep => ep.port === np.port && ep.host === target)
                );
                
                this.openPorts = [...this.openPorts, ...newPorts];
                this.updatePortsTable();
                this.updateIpListPanel();
                
                if (this.portStat) {
                    this.portStat.textContent = this.openPorts.length;
                }
                
                if (this.visualizer) {
                    this.visualizer.updateNetworkData(this.networkInfo, this.hosts, this.openPorts);
                    this.visualizer.startPortScan(target, newPorts.map(p => p.port));
                }
                
                this.showMessage(`Found ${newPorts.length} open ports on ${target}`, 'success');
                this.addLogEntry(`Quick scan: ${newPorts.length} ports on ${target}`, 'success');
            } else {
                this.showMessage('No open ports found', 'info');
            }
            
            this.updateStatus('Quick scan complete', 'success');
            
        } catch (error) {
            console.error('Quick scan failed:', error);
            this.updateStatus('Quick scan failed', 'error');
            this.showMessage(`Scan failed: ${error.message}`, 'error');
        } finally {
            this.setScanning(false);
            if (this.scanProgressContainer) {
                this.scanProgressContainer.style.display = 'none';
            }
        }
    }

    async executePortScan() {
        if (this.isScanning) {
            this.showMessage('Scan already in progress', 'warning');
            return;
        }
        
        let target = this.hostSelector?.value || this.currentTarget;
        if (!target && this.hosts.length > 0) target = this.hosts[0];
        if (!target) {
            this.showMessage('No host selected', 'warning');
            return;
        }
        
        const preset = document.getElementById('portPresetSelect')?.value || 'quick';
        let ports = '21,22,23,25,53,80,110,135,139,143,443,445,993,995,1723,3306,3389,5900,8080,8443';
        
        if (preset === 'common') ports = '1-1024';
        if (preset === 'full') ports = '1-65535';
        if (preset === 'custom') ports = document.getElementById('customPortsInput')?.value || ports;
        
        this.updateStatus(`Scanning ports on ${target}...`, 'scanning');
        this.setScanning(true);
        
        if (this.scanProgressContainer) {
            this.scanProgressContainer.style.display = 'flex';
        }
        
        try {
            const result = await window.electronAPI.scanPorts({
                host: target,
                ports,
                options: { timeout: 500, concurrent: 100, serviceDetection: true, bannerGrab: true }
            });
            
            if (result.ports) {
                result.ports.forEach(p => p.host = target);
            }
            
            this.openPorts = this.openPorts.filter(p => p.host !== target);
            this.openPorts = [...this.openPorts, ...(result.ports || [])];
            
            this.updatePortsTable();
            this.updateIpListPanel();
            
            if (this.portStat) {
                this.portStat.textContent = this.openPorts.length;
            }
            
            if (this.visualizer) {
                this.visualizer.updateNetworkData(this.networkInfo, this.hosts, this.openPorts);
                if (result.ports) {
                    this.visualizer.startPortScan(target, result.ports.map(p => p.port));
                }
            }
            
            this.updateStatus(`Found ${result.ports?.length || 0} open ports`, 'success');
            this.addLogEntry(`Port scan on ${target}: ${result.ports?.length || 0} ports`, 'success');
            
            this.switchTabTo('ports');
        } catch (error) {
            console.error('Port scan failed:', error);
            this.updateStatus('Port scan failed', 'error');
            this.showMessage(`Scan failed: ${error.message}`, 'error');
        } finally {
            this.setScanning(false);
            if (this.scanProgressContainer) {
                this.scanProgressContainer.style.display = 'none';
            }
        }
    }

    async deepNetworkScan() {
        if (this.isScanning) {
            this.showMessage('Scan already in progress', 'warning');
            return;
        }
        
        if (!this.hosts || this.hosts.length === 0) {
            this.showMessage('No hosts discovered. Run network scan first.', 'warning');
            await this.autoDetectAndScan();
            if (!this.hosts || this.hosts.length === 0) {
                this.showMessage('No hosts available', 'error');
                return;
            }
        }
        
        this.updateStatus('Deep scanning all hosts (1-65535)...', 'scanning');
        this.setScanning(true);
        
        if (this.scanProgressContainer) {
            this.scanProgressContainer.style.display = 'flex';
        }
        
        let completed = 0;
        const totalHosts = this.hosts.length;
        
        for (const host of this.hosts) {
            if (!this.isScanning) {
                this.addLogEntry('Deep scan cancelled by user', 'warning');
                break;
            }
            
            try {
                this.updateStatus(`Deep scanning ${host} (${completed + 1}/${totalHosts})...`, 'scanning');
                
                const result = await window.electronAPI.scanPorts({
                    host,
                    ports: '1-65535',
                    options: { 
                        timeout: 800, 
                        concurrent: 100, 
                        serviceDetection: true, 
                        bannerGrab: true 
                    }
                });
                
                if (result.ports) {
                    result.ports.forEach(p => p.host = host);
                    
                    this.openPorts = this.openPorts.filter(p => p.host !== host);
                    this.openPorts = [...this.openPorts, ...result.ports];
                    
                    this.addLogEntry(`Deep scan ${host}: ${result.ports.length} open ports`, 'success');
                }
                
            } catch (error) {
                console.error(`Deep scan failed for ${host}:`, error);
                this.addLogEntry(`Deep scan ${host} failed: ${error.message}`, 'error');
            }
            
            completed++;
            const percent = Math.round((completed / totalHosts) * 100);
            this.updateProgress(percent);
        }
        
        this.updatePortsTable();
        this.updateIpListPanel();
        
        if (this.portStat) {
            this.portStat.textContent = this.openPorts.length;
        }
        
        if (this.visualizer) {
            this.visualizer.updateNetworkData(this.networkInfo, this.hosts, this.openPorts);
        }
        
        this.setScanning(false);
        this.updateStatus(`Deep scan complete: ${this.openPorts.length} total open ports`, 'success');
        
        if (this.scanProgressContainer) {
            this.scanProgressContainer.style.display = 'none';
        }
        
        this.switchTabTo('ports');
    }

    async scanAllHosts() {
        if (this.isScanning) {
            this.showMessage('Scan already in progress', 'warning');
            return;
        }
        
        if (!this.hosts || this.hosts.length === 0) {
            this.showMessage('No hosts discovered. Run network scan first.', 'warning');
            await this.autoDetectAndScan();
            if (!this.hosts || this.hosts.length === 0) {
                this.showMessage('No hosts available', 'error');
                return;
            }
        }
        
        this.updateStatus('Scanning all hosts...', 'scanning');
        this.setScanning(true);
        
        if (this.scanProgressContainer) {
            this.scanProgressContainer.style.display = 'flex';
        }
        
        const ports = '21,22,23,25,53,80,110,135,139,143,443,445,993,995,1723,3306,3389,5900,8080,8443';
        let completed = 0;
        const totalHosts = this.hosts.length;
        
        for (const host of this.hosts) {
            if (!this.isScanning) break;
            
            try {
                const result = await window.electronAPI.scanPorts({
                    host,
                    ports,
                    options: { timeout: 500, concurrent: 80, serviceDetection: true, bannerGrab: false }
                });
                
                if (result.ports) {
                    result.ports.forEach(p => p.host = host);
                }
                
                this.openPorts = this.openPorts.filter(p => p.host !== host);
                this.openPorts = [...this.openPorts, ...(result.ports || [])];
                
                this.addLogEntry(`Scan ${host}: ${result.ports?.length || 0} ports`, 'success');
            } catch (error) {
                this.addLogEntry(`Scan ${host} failed`, 'error');
            }
            
            completed++;
            this.updateProgress(Math.round((completed / totalHosts) * 100));
        }
        
        this.updatePortsTable();
        this.updateIpListPanel();
        
        if (this.portStat) {
            this.portStat.textContent = this.openPorts.length;
        }
        
        if (this.visualizer) {
            this.visualizer.updateNetworkData(this.networkInfo, this.hosts, this.openPorts);
        }
        
        this.setScanning(false);
        this.updateStatus('Scan all hosts complete', 'success');
        
        if (this.scanProgressContainer) {
            this.scanProgressContainer.style.display = 'none';
        }
    }

    updateHostsTable() {
        if (!this.hostsTableBody) return;
        
        this.hostsTableBody.innerHTML = '';
        
        if (this.hosts.length === 0) {
            this.hostsTableBody.innerHTML = '<tr class="empty-row"><td colspan="5">No hosts discovered</td></tr>';
            return;
        }
        
        this.hosts.forEach((host, index) => {
            const row = document.createElement('tr');
            const isSelected = (host === this.currentTarget);
            const hostPorts = this.openPorts.filter(p => p.host === host);
            
            row.innerHTML = `
                <td style="${isSelected ? 'border-left: 3px solid #3b82f6; background: rgba(59, 130, 246, 0.05);' : ''}">
                    <span style="color: #10b981;">●</span> 
                    <span class="full-ip">${host}</span>
                    ${isSelected ? '<span style="color: #3b82f6; margin-left: 8px;">(selected)</span>' : ''}
                </td>
                <td>${host.split('.')[3]}</td>
                <td><span class="status-badge">ACTIVE</span></td>
                <td>${hostPorts.length}</td>
                <td>
                    <button class="icon-btn small" onclick="window.hannerUI.setTarget('${host}')">
                        <i class="fas fa-crosshairs"></i>
                    </button>
                </td>
            `;
            
            this.hostsTableBody.appendChild(row);
        });
        
        const hostsBadge = document.getElementById('hostsBadge');
        if (hostsBadge) {
            hostsBadge.textContent = this.hosts.length;
        }
    }

    updatePortsTable() {
        if (!this.portsTableBody) return;
        
        this.portsTableBody.innerHTML = '';
        
        if (this.openPorts.length === 0) {
            this.portsTableBody.innerHTML = '<tr class="empty-row"><td colspan="5">No open ports found</td></tr>';
            return;
        }
        
        const portsByHost = {};
        this.openPorts.forEach(p => {
            if (!portsByHost[p.host]) portsByHost[p.host] = [];
            portsByHost[p.host].push(p);
        });
        
        Object.keys(portsByHost).sort().forEach(host => {
            // Host header with FULL IP
            const headerRow = document.createElement('tr');
            headerRow.style.background = 'rgba(59, 130, 246, 0.1)';
            headerRow.innerHTML = `<td colspan="5" style="color: #3b82f6; font-weight: bold; padding: 8px 10px;">
                <i class="fas fa-server"></i> ${host} (${portsByHost[host].length} ports)
            </td>`;
            this.portsTableBody.appendChild(headerRow);
            
            // Port rows
            portsByHost[host].slice(0, 20).forEach(p => {
                const row = document.createElement('tr');
                const bannerPreview = p.banner ? p.banner.substring(0, 30) + '...' : '—';
                
                row.innerHTML = `
                    <td><strong style="color: #10b981;">${p.port}</strong></td>
                    <td style="color: #8b5cf6;">${p.service || 'unknown'}</td>
                    <td><span class="status-badge" style="background: rgba(59,130,246,0.1); color: #3b82f6;">OPEN</span></td>
                    <td class="banner-preview" title="${p.banner || ''}">${bannerPreview}</td>
                    <td>
                        <button class="icon-btn small" onclick="window.hannerUI.grabBanner('${host}', ${p.port})">
                            <i class="fas fa-hand-paper"></i>
                        </button>
                    </td>
                `;
                this.portsTableBody.appendChild(row);
            });
            
            if (portsByHost[host].length > 20) {
                const moreRow = document.createElement('tr');
                moreRow.innerHTML = `<td colspan="5" style="color: #f59e0b; text-align: center;">... and ${portsByHost[host].length - 20} more ports</td>`;
                this.portsTableBody.appendChild(moreRow);
            }
        });
        
        const portsBadge = document.getElementById('portsBadge');
        if (portsBadge) {
            portsBadge.textContent = this.openPorts.length;
        }
    }

    updateHostSelector() {
        if (!this.hostSelector) return;
        
        this.hostSelector.innerHTML = '<option value="">SELECT HOST</option>';
        
        this.hosts.forEach(host => {
            const option = document.createElement('option');
            option.value = host;
            option.textContent = host;
            if (host === this.currentTarget) option.selected = true;
            this.hostSelector.appendChild(option);
        });
    }

    updateIpListPanel() {
        const content = document.getElementById('ipListContent');
        if (!content) return;
        
        if (!this.hosts || this.hosts.length === 0) {
            content.innerHTML = '<div class="loading-ips">No hosts discovered</div>';
            return;
        }
        
        let html = '';
        
        this.hosts.forEach(host => {
            const hostPorts = this.openPorts.filter(p => p.host === host);
            
            html += `
                <div class="ip-host-group">
                    <div class="ip-host-header">
                        <i class="fas fa-server"></i>
                        <span class="ip-host-ip">${host}</span>
                        <span class="ip-port-badge">${hostPorts.length} ports</span>
                    </div>
                    <div class="ip-ports-list">
            `;
            
            if (hostPorts.length === 0) {
                html += '<div class="no-ports">No open ports</div>';
            } else {
                hostPorts.slice(0, 15).forEach(port => {
                    const bannerPreview = port.banner ? port.banner.substring(0, 30) + '...' : '';
                    html += `
                        <div class="ip-port-item">
                            <span class="ip-port-number">${port.port}</span>
                            <span class="ip-port-service">${port.service || 'unknown'}</span>
                            <span class="ip-port-banner" title="${port.banner || ''}">${bannerPreview}</span>
                        </div>
                    `;
                });
                
                if (hostPorts.length > 15) {
                    html += `<div class="ip-port-item" style="color: #f59e0b;">... and ${hostPorts.length - 15} more ports</div>`;
                }
            }
            
            html += `
                    </div>
                </div>
            `;
        });
        
        content.innerHTML = html;
    }

    async grabBanner(host, port) {
        this.updateStatus(`Grabbing banner from ${host}:${port}...`, 'scanning');
        
        try {
            const banner = await window.electronAPI.grabBanner({ host, port });
            
            if (this.bannerOutput) {
                this.bannerOutput.value = `[${new Date().toLocaleTimeString()}] ${host}:${port}\n${'='.repeat(60)}\n${banner}\n\n${this.bannerOutput.value}`;
            }
            
            const portInfo = this.openPorts.find(p => p.port === port && p.host === host);
            if (portInfo) {
                portInfo.banner = banner.substring(0, 100);
            }
            
            this.updatePortsTable();
            this.updateIpListPanel();
            this.switchTabTo('banner');
            this.updateStatus('Banner grabbed', 'success');
            
        } catch (error) {
            this.updateStatus('Banner grab failed', 'error');
            this.showMessage(`Banner grab failed: ${error.message}`, 'error');
        }
    }

    async grabSingleBanner() {
        const input = document.getElementById('bannerTargetInput');
        if (!input || !input.value.trim()) {
            this.showMessage('Enter host:port', 'warning');
            return;
        }
        
        const [host, portStr] = input.value.trim().split(':');
        const port = parseInt(portStr);
        
        if (host && port) {
            await this.grabBanner(host, port);
        } else {
            this.showMessage('Invalid format. Use host:port', 'warning');
        }
    }

    async grabAllBanners() {
        if (this.openPorts.length === 0) {
            this.showMessage('No open ports to scan', 'warning');
            return;
        }
        
        this.setScanning(true);
        this.updateStatus('Grabbing all banners...', 'scanning');
        
        let bannerText = '';
        let successCount = 0;
        let failCount = 0;
        
        for (const portInfo of this.openPorts.slice(0, 30)) {
            try {
                const banner = await window.electronAPI.grabBanner({ 
                    host: portInfo.host, 
                    port: portInfo.port 
                });
                
                bannerText += `[${new Date().toLocaleTimeString()}] ${portInfo.host}:${portInfo.port}\n`;
                bannerText += `${'='.repeat(60)}\n${banner}\n\n`;
                
                portInfo.banner = banner.substring(0, 100);
                successCount++;
            } catch (error) {
                bannerText += `[ERROR] ${portInfo.host}:${portInfo.port}\n\n`;
                failCount++;
            }
            
            this.updateProgress(Math.round(((successCount + failCount) / this.openPorts.length) * 100));
        }
        
        if (this.bannerOutput) {
            this.bannerOutput.value = bannerText + this.bannerOutput.value;
        }
        
        this.updatePortsTable();
        this.updateIpListPanel();
        this.setScanning(false);
        this.updateProgress(0);
        this.updateStatus(`Banners grabbed: ${successCount} success, ${failCount} failed`, 'success');
        this.switchTabTo('banner');
    }

    async copyBanners() {
        const text = this.bannerOutput?.value || '';
        if (!text.trim()) {
            this.showMessage('No banners to copy', 'warning');
            return;
        }
        
        try {
            await navigator.clipboard.writeText(text);
            this.showMessage('Banners copied to clipboard', 'success');
        } catch {
            this.showMessage('Copy failed', 'error');
        }
    }

    setTarget(host) {
        this.currentTarget = host;
        if (this.hostSelector) this.hostSelector.value = host;
        this.updateHostsTable();
        
        if (this.visualizer) {
            const hostNode = this.visualizer.nodes?.find(n => n.id === host);
            if (hostNode) {
                this.visualizer.selectedNode = hostNode;
            }
        }
        
        this.showMessage(`Target set to ${host}`, 'success');
        this.switchTabTo('ports');
    }

    filterHosts(query) {
        const rows = this.hostsTableBody?.querySelectorAll('tr');
        if (!rows) return;
        
        query = query.toLowerCase();
        rows.forEach(row => {
            if (row.classList.contains('empty-row')) return;
            const text = row.textContent.toLowerCase();
            row.style.display = text.includes(query) ? '' : 'none';
        });
    }

    async exportHosts() {
        const data = {
            timestamp: new Date().toISOString(),
            hosts: this.hosts.map(host => ({
                ip: host,
                ports: this.openPorts.filter(p => p.host === host).length
            }))
        };
        
        const result = await window.electronAPI.exportData(data);
        
        if (result.success) {
            this.showMessage('Hosts exported', 'success');
        }
    }

    async exportAllData() {
        const data = {
            timestamp: new Date().toISOString(),
            network: this.networkInfo,
            hosts: this.hosts,
            ports: this.openPorts,
            stats: { 
                hosts: this.hosts.length, 
                ports: this.openPorts.length 
            }
        };
        
        const result = await window.electronAPI.exportData(data);
        
        if (result.success) {
            this.showMessage('Data exported successfully', 'success');
            this.addLogEntry(`Data exported to ${result.path}`, 'success');
        } else if (!result.canceled) {
            this.showMessage(`Export failed: ${result.error}`, 'error');
        }
    }

    updateStatus(message, type = 'info') {
        if (this.statusMessage) {
            this.statusMessage.textContent = message;
        }
        
        if (this.footerStatus) {
            this.footerStatus.textContent = message;
        }
        
        if (this.statusLed) {
            const colors = {
                scanning: '#3b82f6',
                success: '#10b981',
                error: '#ef4444',
                warning: '#f59e0b',
                info: '#8b5cf6'
            };
            
            this.statusLed.style.background = colors[type] || colors.info;
            this.statusLed.style.boxShadow = `0 0 15px ${colors[type] || colors.info}`;
        }
        
        this.addLogEntry(message, type);
    }

    addLogEntry(message, type = 'info') {
        if (!this.eventLog) return;
        
        const entry = document.createElement('div');
        entry.className = 'log-entry';
        
        const icon = {
            info: 'ℹ️',
            success: '✅',
            error: '❌',
            warning: '⚠️',
            scanning: '🔄'
        }[type] || 'ℹ️';
        
        entry.innerHTML = `<span style="color: #3b82f6;">[${new Date().toLocaleTimeString()}]</span> ${icon} ${message}`;
        
        this.eventLog.prepend(entry);
        
        while (this.eventLog.children.length > 100) {
            this.eventLog.removeChild(this.eventLog.lastChild);
        }
    }

    updateProgress(percent) {
        this.scanProgress = percent;
        if (this.scanProgressFill) {
            this.scanProgressFill.style.width = `${percent}%`;
        }
        if (this.scanProgressPercent) {
            this.scanProgressPercent.textContent = `${percent}%`;
        }
    }

    setScanning(scanning) {
        this.isScanning = scanning;
        
        if (this.emergencyStopBtn) {
            this.emergencyStopBtn.style.display = scanning ? 'flex' : 'none';
        }
        
        const scanButtons = [
            this.quickScanBtn, 
            this.deepScanBtn, 
            this.scanAllHostsBtn,
            document.getElementById('executePortScanBtn')
        ];
        
        scanButtons.forEach(btn => {
            if (btn) {
                btn.disabled = scanning;
                btn.style.opacity = scanning ? '0.5' : '1';
                btn.style.pointerEvents = scanning ? 'none' : 'auto';
            }
        });
        
        if (this.scanIndicator) {
            const span = this.scanIndicator.querySelector('span');
            if (scanning) {
                this.scanIndicator.classList.add('active');
                if (span) span.textContent = 'SCANNING';
            } else {
                this.scanIndicator.classList.remove('active');
                if (span) span.textContent = 'IDLE';
            }
        }
        
        if (!scanning) {
            this.updateProgress(0);
        }
    }

    switchTab(e) {
        const tabId = e.currentTarget.dataset.tab;
        this.switchTabTo(tabId);
    }

    switchTabTo(tabId) {
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.tab === tabId) {
                btn.classList.add('active');
            }
        });
        
        document.querySelectorAll('.tab-pane').forEach(pane => {
            pane.classList.remove('active');
            const targetPane = document.getElementById(`${tabId}Pane`);
            if (targetPane) {
                targetPane.classList.add('active');
            }
        });
    }

    stopScan() {
        this.isScanning = false;
        this.setScanning(false);
        this.updateStatus('Scan stopped by user', 'warning');
        this.addLogEntry('Scan halted by user', 'warning');
        
        if (this.scanProgressContainer) {
            this.scanProgressContainer.style.display = 'none';
        }
    }

    showMessage(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        
        const icons = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️',
            scanning: '🔄'
        };
        
        toast.innerHTML = `
            <span style="margin-right: 8px;">${icons[type] || 'ℹ️'}</span>
            <span>${message}</span>
        `;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.style.animation = 'slideOutRight 0.3s ease-out';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    initLayout() {
        this.setupCanvasSizing();
    }

    setupCanvasSizing() {
        const refreshCanvas = () => {
            if (!this.visualizer) return;
            this.visualizer.resizeCanvas();
            this.visualizer.updateNetworkData(this.networkInfo || [], this.hosts || [], this.openPorts || []);
        };
        
        refreshCanvas();
        window.addEventListener('resize', refreshCanvas);
        setTimeout(() => refreshCanvas(), 150);
    }

    updateSystemInfo() {
        if (this.sysPlatform) {
            this.sysPlatform.textContent = navigator.platform || 'Unknown';
        }
        
        if (this.sysArch) {
            this.sysArch.textContent = navigator.userAgent.includes('x64') ? 'x64' : 
                                      navigator.userAgent.includes('x86') ? 'x86' : 'Unknown';
        }
        
        if (this.firewallStatus) {
            this.firewallStatus.textContent = 'ACTIVE';
            this.firewallStatus.className = 'info-value status-active';
        }
        
        if (this.stealthStatus) {
            this.stealthStatus.textContent = 'INACTIVE';
            this.stealthStatus.className = 'info-value status-inactive';
        }
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.hannerUI = new HannerUI();
});

// Global helpers
window.hannerUI = window.hannerUI || {
    setTarget: (host) => window.hannerUI?.setTarget(host),
    grabBanner: (host, port) => window.hannerUI?.grabBanner(host, port)
};