// src/renderer/settings-panel.js
// DEUS EX SOPHIA - AEONIC SETTINGS MATRIX
// CONFIGURE THE COSMIC TREE - CLEAN VERSION (NO DUPLICATE BUTTON)

class AeonicSettingsPanel {
    constructor(app) {
        this.app = app;
        this.isOpen = false;
        this.settings = this.loadSettings();
        
        this.createSettingsButton();
        this.createSettingsPanel();
    }
    
    loadSettings() {
        const defaultSettings = {
            // Scan Settings
            scanConcurrency: 100,
            scanTimeout: 500,
            autoResolve: true,
            stealthMode: false,
            
            // Visual Settings
            animationsEnabled: true,
            animationSpeed: 1.0,
            particleCount: 100,
            showGrid: true,
            showStars: true,
            glowIntensity: 1.0,
            
            // Network Settings
            defaultPortRange: 'quick',
            bannerGrabTimeout: 2000,
            pingTimeout: 1000,
            
            // Privacy Settings
            anonymizeIPs: false,
            logLevel: 'info',
            exportFormat: 'json'
        };
        
        try {
            const saved = localStorage.getItem('aeonicSettings');
            return saved ? { ...defaultSettings, ...JSON.parse(saved) } : defaultSettings;
        } catch (e) {
            return defaultSettings;
        }
    }
    
    saveSettings() {
        localStorage.setItem('aeonicSettings', JSON.stringify(this.settings));
        this.applySettings();
    }
    
    createSettingsButton() {
        // Check if button already exists
        if (document.getElementById('settingsToggleBtn')) return;
        
        const btn = document.createElement('button');
        btn.id = 'settingsToggleBtn';
        btn.className = 'settings-toggle-btn';
        btn.innerHTML = '<i class="fas fa-cog"></i>';
        btn.title = 'Cosmic Settings';
        
        btn.addEventListener('click', () => this.togglePanel());
        
        // Add to footer right section
        const footerRight = document.querySelector('.footer-right');
        if (footerRight) {
            footerRight.appendChild(btn);
        }
    }
    
    createSettingsPanel() {
        // Check if panel already exists
        if (document.getElementById('settingsPanel')) return;
        
        const panel = document.createElement('div');
        panel.id = 'settingsPanel';
        panel.className = 'settings-panel';
        panel.innerHTML = `
            <div class="settings-header">
                <h3><i class="fas fa-cog fa-spin"></i> AEONIC CONFIGURATION</h3>
                <button class="settings-close-btn" id="closeSettingsBtn">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            
            <div class="settings-content">
                <!-- SCAN SETTINGS -->
                <div class="settings-section">
                    <div class="section-header">
                        <i class="fas fa-radar"></i>
                        <h4>SCAN PARAMETERS</h4>
                    </div>
                    
                    <div class="setting-item">
                        <div class="setting-label">
                            <span>Scan Concurrency</span>
                            <span class="setting-description">Parallel port scans</span>
                        </div>
                        <div class="setting-control">
                            <input type="range" id="settingConcurrency" 
                                   min="10" max="500" step="10" 
                                   value="${this.settings.scanConcurrency}">
                            <span class="setting-value" id="concurrencyValue">${this.settings.scanConcurrency}</span>
                        </div>
                    </div>
                    
                    <div class="setting-item">
                        <div class="setting-label">
                            <span>Timeout (ms)</span>
                            <span class="setting-description">Connection timeout</span>
                        </div>
                        <div class="setting-control">
                            <select id="settingTimeout" class="setting-select">
                                <option value="200" ${this.settings.scanTimeout === 200 ? 'selected' : ''}>200ms (Fast)</option>
                                <option value="500" ${this.settings.scanTimeout === 500 ? 'selected' : ''}>500ms (Normal)</option>
                                <option value="1000" ${this.settings.scanTimeout === 1000 ? 'selected' : ''}>1000ms (Stealth)</option>
                                <option value="2000" ${this.settings.scanTimeout === 2000 ? 'selected' : ''}>2000ms (Deep)</option>
                            </select>
                        </div>
                    </div>
                    
                    <div class="setting-item">
                        <div class="setting-label">
                            <span>Default Port Range</span>
                            <span class="setting-description">Quick scan preset</span>
                        </div>
                        <div class="setting-control">
                            <select id="settingPortRange" class="setting-select">
                                <option value="quick" ${this.settings.defaultPortRange === 'quick' ? 'selected' : ''}>Quick (Top 100)</option>
                                <option value="common" ${this.settings.defaultPortRange === 'common' ? 'selected' : ''}>Common (1-1024)</option>
                                <option value="full" ${this.settings.defaultPortRange === 'full' ? 'selected' : ''}>Full (1-65535)</option>
                            </select>
                        </div>
                    </div>
                    
                    <div class="setting-item toggle">
                        <div class="setting-label">
                            <span>Auto-Resolve Domains</span>
                            <span class="setting-description">Auto DNS lookup</span>
                        </div>
                        <div class="setting-control">
                            <label class="toggle-switch">
                                <input type="checkbox" id="settingAutoResolve" 
                                       ${this.settings.autoResolve ? 'checked' : ''}>
                                <span class="toggle-slider"></span>
                            </label>
                        </div>
                    </div>
                </div>
                
                <!-- VISUAL SETTINGS -->
                <div class="settings-section">
                    <div class="section-header">
                        <i class="fas fa-palette"></i>
                        <h4>VISUAL COSMOS</h4>
                    </div>
                    
                    <div class="setting-item toggle">
                        <div class="setting-label">
                            <span>Tree Animations</span>
                            <span class="setting-description">Living network effects</span>
                        </div>
                        <div class="setting-control">
                            <label class="toggle-switch">
                                <input type="checkbox" id="settingAnimations" 
                                       ${this.settings.animationsEnabled ? 'checked' : ''}>
                                <span class="toggle-slider"></span>
                            </label>
                        </div>
                    </div>
                    
                    <div class="setting-item">
                        <div class="setting-label">
                            <span>Animation Speed</span>
                            <span class="setting-description">Cosmic flow rate</span>
                        </div>
                        <div class="setting-control">
                            <input type="range" id="settingAnimSpeed" 
                                   min="0.1" max="2.0" step="0.1" 
                                   value="${this.settings.animationSpeed}">
                            <span class="setting-value" id="animSpeedValue">${this.settings.animationSpeed}x</span>
                        </div>
                    </div>
                    
                    <div class="setting-item">
                        <div class="setting-label">
                            <span>Star Density</span>
                            <span class="setting-description">Background twinkle</span>
                        </div>
                        <div class="setting-control">
                            <input type="range" id="settingParticles" 
                                   min="0" max="200" step="10" 
                                   value="${this.settings.particleCount}">
                            <span class="setting-value" id="particleValue">${this.settings.particleCount}</span>
                        </div>
                    </div>
                    
                    <div class="setting-item toggle">
                        <div class="setting-label">
                            <span>Show Grid</span>
                            <span class="setting-description">Cosmic reference</span>
                        </div>
                        <div class="setting-control">
                            <label class="toggle-switch">
                                <input type="checkbox" id="settingGrid" 
                                       ${this.settings.showGrid ? 'checked' : ''}>
                                <span class="toggle-slider"></span>
                            </label>
                        </div>
                    </div>
                    
                    <div class="setting-item">
                        <div class="setting-label">
                            <span>Glow Intensity</span>
                            <span class="setting-description">Neon radiance</span>
                        </div>
                        <div class="setting-control">
                            <input type="range" id="settingGlow" 
                                   min="0.2" max="2.0" step="0.2" 
                                   value="${this.settings.glowIntensity}">
                            <span class="setting-value" id="glowValue">${this.settings.glowIntensity}x</span>
                        </div>
                    </div>
                </div>
                
                <!-- PRIVACY SETTINGS -->
                <div class="settings-section">
                    <div class="section-header">
                        <i class="fas fa-shield-alt"></i>
                        <h4>PRIVACY & SECURITY</h4>
                    </div>
                    
                    <div class="setting-item toggle">
                        <div class="setting-label">
                            <span>Stealth Mode</span>
                            <span class="setting-description">Reduce scan footprint</span>
                        </div>
                        <div class="setting-control">
                            <label class="toggle-switch">
                                <input type="checkbox" id="settingStealth" 
                                       ${this.settings.stealthMode ? 'checked' : ''}>
                                <span class="toggle-slider"></span>
                            </label>
                        </div>
                    </div>
                    
                    <div class="setting-item toggle">
                        <div class="setting-label">
                            <span>Anonymize IPs</span>
                            <span class="setting-description">Hash IP addresses</span>
                        </div>
                        <div class="setting-control">
                            <label class="toggle-switch">
                                <input type="checkbox" id="settingAnonymize" 
                                       ${this.settings.anonymizeIPs ? 'checked' : ''}>
                                <span class="toggle-slider"></span>
                            </label>
                        </div>
                    </div>
                    
                    <div class="setting-item">
                        <div class="setting-label">
                            <span>Log Level</span>
                            <span class="setting-description">Event verbosity</span>
                        </div>
                        <div class="setting-control">
                            <select id="settingLogLevel" class="setting-select">
                                <option value="error" ${this.settings.logLevel === 'error' ? 'selected' : ''}>Errors Only</option>
                                <option value="warn" ${this.settings.logLevel === 'warn' ? 'selected' : ''}>Warnings</option>
                                <option value="info" ${this.settings.logLevel === 'info' ? 'selected' : ''}>Information</option>
                                <option value="debug" ${this.settings.logLevel === 'debug' ? 'selected' : ''}>Debug</option>
                            </select>
                        </div>
                    </div>
                    
                    <div class="setting-item">
                        <div class="setting-label">
                            <span>Export Format</span>
                            <span class="setting-description">Data format</span>
                        </div>
                        <div class="setting-control">
                            <select id="settingExportFormat" class="setting-select">
                                <option value="json" ${this.settings.exportFormat === 'json' ? 'selected' : ''}>JSON</option>
                                <option value="csv" ${this.settings.exportFormat === 'csv' ? 'selected' : ''}>CSV</option>
                            </select>
                        </div>
                    </div>
                </div>
                
                <!-- SYSTEM INFO -->
                <div class="settings-section system-info">
                    <div class="section-header">
                        <i class="fas fa-info-circle"></i>
                        <h4>SYSTEM GNOSIS</h4>
                    </div>
                    
                    <div class="info-grid">
                        <div class="info-row">
                            <span>Version:</span>
                            <span class="highlight">🌳 COSMIC TREE v2.0</span>
                        </div>
                        <div class="info-row">
                            <span>Renderer:</span>
                            <span class="highlight">Cosmic Tree Visualizer</span>
                        </div>
                        <div class="info-row">
                            <span>Leaves:</span>
                            <span class="highlight" id="statsLeaves">0</span>
                        </div>
                        <div class="info-row">
                            <span>Branches:</span>
                            <span class="highlight" id="statsBranches">0</span>
                        </div>
                        <div class="info-row">
                            <span>FPS:</span>
                            <span class="highlight" id="statsFPS">60</span>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="settings-footer">
                <button class="settings-btn reset" id="resetSettingsBtn">
                    <i class="fas fa-undo-alt"></i> RESET
                </button>
                <button class="settings-btn apply" id="applySettingsBtn">
                    <i class="fas fa-check"></i> APPLY
                </button>
                <button class="settings-btn save" id="saveSettingsBtn">
                    <i class="fas fa-save"></i> SAVE & CLOSE
                </button>
            </div>
        `;
        
        document.body.appendChild(panel);
        this.panel = panel;
        
        this.setupEventListeners();
        this.addStyles();
    }
    
    addStyles() {
        // Check if styles already added
        if (document.getElementById('cosmicSettingsStyles')) return;
        
        const style = document.createElement('style');
        style.id = 'cosmicSettingsStyles';
        style.textContent = `
            /* Settings Toggle Button - CLEAN VERSION */
            .settings-toggle-btn {
                width: 40px;
                height: 40px;
                background: rgba(10, 10, 26, 0.8);
                border: 1px solid rgba(0, 243, 255, 0.3);
                border-radius: 50%;
                color: #3b82f6;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.3s ease;
                margin-left: 10px;
                font-size: 1.2rem;
            }
            
            .settings-toggle-btn:hover {
                background: #3b82f6;
                color: #03030a;
                transform: rotate(90deg);
                box-shadow: 0 0 20px #3b82f6;
            }
            
            /* Settings Panel */
            .settings-panel {
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                width: 600px;
                max-height: 80vh;
                background: rgba(7, 7, 21, 0.98);
                backdrop-filter: blur(10px);
                border: 2px solid #3b82f6;
                border-radius: 12px;
                box-shadow: 0 0 50px rgba(59, 130, 246, 0.3);
                z-index: 9999;
                display: none;
                flex-direction: column;
                color: #ffffff;
                animation: panelEnter 0.3s ease-out;
            }
            
            .settings-panel.open {
                display: flex;
            }
            
            @keyframes panelEnter {
                from {
                    opacity: 0;
                    transform: translate(-50%, -45%);
                }
                to {
                    opacity: 1;
                    transform: translate(-50%, -50%);
                }
            }
            
            .settings-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 20px;
                border-bottom: 1px solid rgba(59, 130, 246, 0.3);
            }
            
            .settings-header h3 {
                color: #3b82f6;
                font-size: 1.2rem;
                display: flex;
                align-items: center;
                gap: 12px;
            }
            
            .settings-close-btn {
                width: 36px;
                height: 36px;
                background: transparent;
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 50%;
                color: #a0b0cc;
                cursor: pointer;
                transition: all 0.2s;
            }
            
            .settings-close-btn:hover {
                background: #ef4444;
                border-color: #ef4444;
                color: white;
                transform: rotate(90deg);
            }
            
            .settings-content {
                flex: 1;
                padding: 20px;
                overflow-y: auto;
            }
            
            .settings-section {
                margin-bottom: 25px;
                padding-bottom: 20px;
                border-bottom: 1px solid rgba(255, 255, 255, 0.05);
            }
            
            .settings-section:last-child {
                border-bottom: none;
            }
            
            .section-header {
                display: flex;
                align-items: center;
                gap: 10px;
                margin-bottom: 15px;
                color: #8b5cf6;
                font-size: 0.9rem;
            }
            
            .setting-item {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 15px;
            }
            
            .setting-label {
                display: flex;
                flex-direction: column;
            }
            
            .setting-label span:first-child {
                font-size: 0.9rem;
                color: #ffffff;
            }
            
            .setting-description {
                font-size: 0.7rem;
                color: #a0b0cc;
                margin-top: 2px;
            }
            
            .setting-control {
                display: flex;
                align-items: center;
                gap: 12px;
            }
            
            .setting-value {
                min-width: 40px;
                text-align: center;
                color: #10b981;
                font-weight: bold;
            }
            
            .setting-select {
                background: rgba(0, 0, 0, 0.3);
                border: 1px solid rgba(59, 130, 246, 0.3);
                border-radius: 4px;
                color: #ffffff;
                padding: 6px 12px;
                font-size: 0.8rem;
                cursor: pointer;
            }
            
            input[type=range] {
                width: 150px;
                height: 6px;
                background: rgba(255, 255, 255, 0.1);
                border-radius: 3px;
                -webkit-appearance: none;
            }
            
            input[type=range]::-webkit-slider-thumb {
                -webkit-appearance: none;
                width: 18px;
                height: 18px;
                background: #3b82f6;
                border-radius: 50%;
                cursor: pointer;
                box-shadow: 0 0 10px #3b82f6;
                transition: 0.2s;
            }
            
            input[type=range]::-webkit-slider-thumb:hover {
                transform: scale(1.2);
                background: #10b981;
            }
            
            /* Toggle Switch */
            .toggle-switch {
                position: relative;
                display: inline-block;
                width: 50px;
                height: 24px;
            }
            
            .toggle-switch input {
                opacity: 0;
                width: 0;
                height: 0;
            }
            
            .toggle-slider {
                position: absolute;
                cursor: pointer;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background-color: rgba(255, 255, 255, 0.1);
                transition: 0.3s;
                border-radius: 24px;
                border: 1px solid rgba(255, 255, 255, 0.2);
            }
            
            .toggle-slider:before {
                position: absolute;
                content: "";
                height: 18px;
                width: 18px;
                left: 3px;
                bottom: 2px;
                background-color: #a0b0cc;
                transition: 0.3s;
                border-radius: 50%;
            }
            
            input:checked + .toggle-slider {
                background-color: rgba(59, 130, 246, 0.2);
                border-color: #3b82f6;
            }
            
            input:checked + .toggle-slider:before {
                transform: translateX(26px);
                background-color: #3b82f6;
                box-shadow: 0 0 10px #3b82f6;
            }
            
            .system-info .info-grid {
                display: grid;
                grid-template-columns: repeat(2, 1fr);
                gap: 10px;
            }
            
            .info-row {
                display: flex;
                justify-content: space-between;
                font-size: 0.8rem;
                padding: 5px;
                background: rgba(0, 0, 0, 0.2);
                border-radius: 4px;
            }
            
            .info-row .highlight {
                color: #10b981;
                font-weight: bold;
            }
            
            .settings-footer {
                display: flex;
                justify-content: flex-end;
                gap: 10px;
                padding: 20px;
                border-top: 1px solid rgba(59, 130, 246, 0.3);
            }
            
            .settings-btn {
                padding: 10px 20px;
                border: none;
                border-radius: 6px;
                font-size: 0.85rem;
                font-weight: 600;
                cursor: pointer;
                display: flex;
                align-items: center;
                gap: 8px;
                transition: all 0.2s;
            }
            
            .settings-btn.reset {
                background: rgba(239, 68, 68, 0.1);
                color: #ef4444;
                border: 1px solid #ef4444;
            }
            
            .settings-btn.apply {
                background: rgba(59, 130, 246, 0.1);
                color: #3b82f6;
                border: 1px solid #3b82f6;
            }
            
            .settings-btn.save {
                background: linear-gradient(135deg, #3b82f6, #8b5cf6);
                color: #ffffff;
                border: none;
            }
            
            .settings-btn:hover {
                transform: translateY(-2px);
                box-shadow: 0 5px 15px rgba(0, 0, 0, 0.5);
            }
            
            @media (max-width: 700px) {
                .settings-panel {
                    width: 90%;
                    max-width: 500px;
                }
            }
        `;
        
        document.head.appendChild(style);
    }
    
    setupEventListeners() {
        // Close button
        document.getElementById('closeSettingsBtn')?.addEventListener('click', () => this.togglePanel());
        
        // Apply button
        document.getElementById('applySettingsBtn')?.addEventListener('click', () => {
            this.updateSettingsFromUI();
            this.applySettings();
            this.showNotification('Settings applied', 'success');
        });
        
        // Save button
        document.getElementById('saveSettingsBtn')?.addEventListener('click', () => {
            this.updateSettingsFromUI();
            this.saveSettings();
            this.togglePanel();
            this.showNotification('Settings saved', 'success');
        });
        
        // Reset button
        document.getElementById('resetSettingsBtn')?.addEventListener('click', () => {
            this.resetToDefaults();
            this.showNotification('Settings reset to default', 'info');
        });
        
        // Range input live updates
        document.getElementById('settingConcurrency')?.addEventListener('input', (e) => {
            document.getElementById('concurrencyValue').textContent = e.target.value;
        });
        
        document.getElementById('settingAnimSpeed')?.addEventListener('input', (e) => {
            document.getElementById('animSpeedValue').textContent = `${e.target.value}x`;
        });
        
        document.getElementById('settingParticles')?.addEventListener('input', (e) => {
            document.getElementById('particleValue').textContent = e.target.value;
        });
        
        document.getElementById('settingGlow')?.addEventListener('input', (e) => {
            document.getElementById('glowValue').textContent = `${e.target.value}x`;
        });
    }
    
    togglePanel() {
        this.isOpen = !this.isOpen;
        this.panel.classList.toggle('open', this.isOpen);
        
        if (this.isOpen) {
            this.updateStats();
        }
    }
    
    updateSettingsFromUI() {
        this.settings = {
            scanConcurrency: parseInt(document.getElementById('settingConcurrency')?.value || 100),
            scanTimeout: parseInt(document.getElementById('settingTimeout')?.value || 500),
            defaultPortRange: document.getElementById('settingPortRange')?.value || 'quick',
            autoResolve: document.getElementById('settingAutoResolve')?.checked || false,
            stealthMode: document.getElementById('settingStealth')?.checked || false,
            animationsEnabled: document.getElementById('settingAnimations')?.checked || true,
            animationSpeed: parseFloat(document.getElementById('settingAnimSpeed')?.value || 1.0),
            particleCount: parseInt(document.getElementById('settingParticles')?.value || 100),
            showGrid: document.getElementById('settingGrid')?.checked || true,
            showStars: document.getElementById('settingStars')?.checked || true,
            glowIntensity: parseFloat(document.getElementById('settingGlow')?.value || 1.0),
            anonymizeIPs: document.getElementById('settingAnonymize')?.checked || false,
            logLevel: document.getElementById('settingLogLevel')?.value || 'info',
            exportFormat: document.getElementById('settingExportFormat')?.value || 'json'
        };
    }
    
    applySettings() {
        // Apply to app
        if (this.app) {
            // Scan settings
            if (this.app.scanConcurrency !== undefined) {
                this.app.scanConcurrency = this.settings.scanConcurrency;
            }
            
            // Visual settings
            if (this.app.visualizer) {
                if (this.settings.animationsEnabled) {
                    this.app.visualizer.animationSpeed = this.settings.animationSpeed;
                } else {
                    this.app.visualizer.animationSpeed = 0;
                }
                
                // Update starfield
                if (this.app.visualizer.stars) {
                    const targetCount = this.settings.particleCount;
                    const currentCount = this.app.visualizer.stars.length;
                    
                    if (currentCount < targetCount) {
                        for (let i = currentCount; i < targetCount; i++) {
                            this.app.visualizer.stars.push({
                                x: Math.random(),
                                y: Math.random(),
                                size: Math.random() * 2 + 0.5,
                                brightness: Math.random() * 0.5 + 0.3,
                                speed: Math.random() * 0.0002 + 0.0001,
                                phase: Math.random() * Math.PI * 2,
                                twinkle: Math.random() * 0.1
                            });
                        }
                    } else if (currentCount > targetCount) {
                        this.app.visualizer.stars = this.app.visualizer.stars.slice(0, targetCount);
                    }
                }
            }
            
            // Stealth mode
            if (this.settings.stealthMode !== this.app.stealthMode) {
                this.app.toggleStealthMode();
            }
        }
    }
    
    resetToDefaults() {
        const defaults = {
            scanConcurrency: 100,
            scanTimeout: 500,
            defaultPortRange: 'quick',
            autoResolve: true,
            stealthMode: false,
            animationsEnabled: true,
            animationSpeed: 1.0,
            particleCount: 100,
            showGrid: true,
            showStars: true,
            glowIntensity: 1.0,
            anonymizeIPs: false,
            logLevel: 'info',
            exportFormat: 'json'
        };
        
        this.settings = defaults;
        this.updateUIFromSettings();
        this.applySettings();
    }
    
    updateUIFromSettings() {
        const setChecked = (id, value) => {
            const el = document.getElementById(id);
            if (el) el.checked = value;
        };
        
        const setValue = (id, value) => {
            const el = document.getElementById(id);
            if (el) el.value = value;
        };
        
        setValue('settingConcurrency', this.settings.scanConcurrency);
        setValue('settingTimeout', this.settings.scanTimeout);
        setValue('settingPortRange', this.settings.defaultPortRange);
        setChecked('settingAutoResolve', this.settings.autoResolve);
        setChecked('settingStealth', this.settings.stealthMode);
        setChecked('settingAnimations', this.settings.animationsEnabled);
        setValue('settingAnimSpeed', this.settings.animationSpeed);
        setValue('settingParticles', this.settings.particleCount);
        setChecked('settingGrid', this.settings.showGrid);
        setChecked('settingStars', this.settings.showStars);
        setValue('settingGlow', this.settings.glowIntensity);
        setChecked('settingAnonymize', this.settings.anonymizeIPs);
        setValue('settingLogLevel', this.settings.logLevel);
        setValue('settingExportFormat', this.settings.exportFormat);
        
        document.getElementById('concurrencyValue').textContent = this.settings.scanConcurrency;
        document.getElementById('animSpeedValue').textContent = `${this.settings.animationSpeed}x`;
        document.getElementById('particleValue').textContent = this.settings.particleCount;
        document.getElementById('glowValue').textContent = `${this.settings.glowIntensity}x`;
    }
    
    updateStats() {
        if (!this.app) return;
        
        const statsLeaves = document.getElementById('statsLeaves');
        const statsBranches = document.getElementById('statsBranches');
        
        if (statsLeaves && this.app.visualizer) {
            statsLeaves.textContent = this.app.visualizer.leaves?.length || 0;
        }
        
        if (statsBranches && this.app.visualizer) {
            statsBranches.textContent = this.app.visualizer.branches?.length || 0;
        }
        
        // Update FPS
        if (!this.lastFrameTime) {
            this.lastFrameTime = performance.now();
            this.frameCount = 0;
        }
        
        this.frameCount++;
        const now = performance.now();
        const delta = now - this.lastFrameTime;
        
        if (delta >= 1000) {
            const fps = Math.round((this.frameCount * 1000) / delta);
            document.getElementById('statsFPS').textContent = fps;
            this.frameCount = 0;
            this.lastFrameTime = now;
        }
        
        setTimeout(() => this.updateStats(), 1000);
    }
    
    showNotification(message, type = 'info') {
        if (this.app && this.app.showMessage) {
            this.app.showMessage(message, type);
        }
    }
}

// Make globally available
window.AeonicSettingsPanel = AeonicSettingsPanel;
