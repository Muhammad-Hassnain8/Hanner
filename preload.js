// preload.js
// DEUS EX SOPHIA - SECURE IPC BRIDGE
// WITH OUT-OF-NETWORK SCANNING EXPOSURE

const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods to renderer
contextBridge.exposeInMainWorld('electronAPI', {
    // Local network scanning
    autoDetectNetwork: () => ipcRenderer.invoke('network:auto-detect'),
    discoverHosts: (params) => ipcRenderer.invoke('hosts:discover', params),
    pingHost: (host) => ipcRenderer.invoke('host:ping', host),
    
    // Port scanning (local & remote)
    scanPorts: (params) => ipcRenderer.invoke('port:scan', params),
    scanSinglePort: (params) => ipcRenderer.invoke('port:scan-single', params),
    
    // Banner grabbing
    grabBanner: (params) => ipcRenderer.invoke('banner:grab', params),
    grabSSL: (params) => ipcRenderer.invoke('banner:ssl', params),
    
    // Internet intelligence
    resolveDomain: (domain) => ipcRenderer.invoke('dns:resolve', domain),
    getGeolocation: (ip) => ipcRenderer.invoke('geo:lookup', ip),
    whoisLookup: (domain) => ipcRenderer.invoke('whois:lookup', domain),
    reverseDNS: (ip) => ipcRenderer.invoke('dns:reverse', ip),
    traceroute: (host) => ipcRenderer.invoke('network:traceroute', host),
    
    // Export functionality
    exportData: (data) => ipcRenderer.invoke('data:export', data),
    
    // Event listeners
    onScanUpdate: (callback) => {
        ipcRenderer.on('scan:progress', (event, data) => callback(data));
        return () => ipcRenderer.removeAllListeners('scan:progress');
    },
    
    onScanComplete: (callback) => {
        ipcRenderer.on('scan:complete', (event, data) => callback(data));
        return () => ipcRenderer.removeAllListeners('scan:complete');
    }
});
