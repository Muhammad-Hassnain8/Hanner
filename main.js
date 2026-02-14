// main.js
// DEUS EX SOPHIA - ELECTRON MAIN PROCESS
// WITH OUT-OF-NETWORK SCANNING IPC HANDLERS

const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const scanner = require('./src/scanner/core');

let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1400,
        height: 900,
        minWidth: 1200,
        minHeight: 700,
        icon: path.join(__dirname, 'assets', 'icon.png'),
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            nodeIntegration: false,
            sandbox: false
        },
        backgroundColor: '#03030a',
        show: false,
        frame: true,
        titleBarStyle: 'default'
    });

    mainWindow.loadFile('src/renderer/index.html');

    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
        // mainWindow.webContents.openDevTools(); // Uncomment for debugging
    });

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

// ============================================
// LOCAL NETWORK IPC HANDLERS
// ============================================
ipcMain.handle('network:auto-detect', async () => {
    return await scanner.autoDetectNetwork();
});

ipcMain.handle('hosts:discover', async (event, { subnet, cidr }) => {
    return await scanner.discoverHosts(subnet, cidr);
});

ipcMain.handle('host:ping', async (event, host) => {
    return await scanner.pingHost(host);
});

// ============================================
// PORT SCANNING IPC HANDLERS (LOCAL & REMOTE)
// ============================================
ipcMain.handle('port:scan', async (event, { host, ports, options = {} }) => {
    const result = await scanner.scanPorts(host, ports, options);
    
    // Send progress updates
    event.sender.send('scan:complete', {
        host,
        result,
        timestamp: new Date().toISOString()
    });
    
    return result;
});

ipcMain.handle('port:scan-single', async (event, { host, port }) => {
    return await scanner.scanSinglePort(host, port);
});

// ============================================
// BANNER GRABBING IPC HANDLERS
// ============================================
ipcMain.handle('banner:grab', async (event, { host, port }) => {
    return await scanner.grabBanner(host, port);
});

ipcMain.handle('banner:ssl', async (event, { host, port = 443 }) => {
    return await scanner.grabSSLBanner(host, port);
});

// ============================================
// INTERNET INTELLIGENCE IPC HANDLERS
// ============================================
ipcMain.handle('dns:resolve', async (event, domain) => {
    try {
        return await scanner.resolveDomain(domain);
    } catch (error) {
        return { error: error.message, domain };
    }
});

ipcMain.handle('geo:lookup', async (event, ip) => {
    return await scanner.getGeolocation(ip);
});

ipcMain.handle('whois:lookup', async (event, domain) => {
    try {
        return await scanner.whoisLookup(domain);
    } catch (error) {
        return `WHOIS lookup failed: ${error.message}`;
    }
});

ipcMain.handle('dns:reverse', async (event, ip) => {
    return await scanner.reverseDNS(ip);
});

ipcMain.handle('network:traceroute', async (event, host) => {
    return await scanner.performTraceroute(host);
});

// ============================================
// DATA EXPORT IPC HANDLER
// ============================================
ipcMain.handle('data:export', async (event, data) => {
    const { canceled, filePath } = await dialog.showSaveDialog(mainWindow, {
        title: 'Export Network Scan Data',
        defaultPath: `aeonic-scan-${new Date().toISOString().split('T')[0]}.json`,
        filters: [
            { name: 'JSON Files', extensions: ['json'] },
            { name: 'CSV Files', extensions: ['csv'] },
            { name: 'All Files', extensions: ['*'] }
        ]
    });
    
    if (!canceled && filePath) {
        try {
            const ext = path.extname(filePath).toLowerCase();
            let outputData;
            
            if (ext === '.csv') {
                // Convert to CSV
                outputData = convertToCSV(data);
            } else {
                outputData = JSON.stringify(data, null, 2);
            }
            
            fs.writeFileSync(filePath, outputData);
            return { success: true, path: filePath };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
    
    return { success: false, canceled: true };
});

// Helper function to convert JSON to CSV
function convertToCSV(data) {
    let csv = '';
    
    if (data.hosts) {
        csv += 'IP Address,Hostname,Status,OS Guess\n';
        data.hosts.forEach(host => {
            csv += `${host.ip || host},,Active,\n`;
        });
    }
    
    if (data.ports) {
        csv += '\nPort,Service,State,Banner\n';
        data.ports.forEach(port => {
            csv += `${port.port},${port.service},${port.state},${port.banner || ''}\n`;
        });
    }
    
    return csv;
}

// ============================================
// APP LIFECYCLE
// ============================================
app.whenReady().then(() => {
    createWindow();
    
    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

// Install whois module if not present
try {
    require('whois');
} catch (e) {
    console.log('WHOIS module not installed. Run: npm install whois');
}
