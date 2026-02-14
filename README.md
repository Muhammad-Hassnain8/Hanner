# Hanner
<img width="1410" height="936" alt="image" src="https://github.com/user-attachments/assets/c40bd129-c19a-412b-b1a6-8ca4ece15dbe" />

# HANNER - HAWK NETWORK SCANNER

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![Electron](https://img.shields.io/badge/electron-40.4.0-green)
![License](https://img.shields.io/badge/license-MIT-purple)

A beautiful, interactive network scanner built with Electron that visualizes your network as a living, breathing radial tree. Discover hosts, scan ports, grab banners, and watch your network come to life.

![Hanner Screenshot](screenshot-placeholder.png)

## 📋 Table of Contents
- [Concept](#-concept)
- [Features](#-features)
- [Installation](#-installation)
- [Quick Start](#-quick-start)
- [Usage Guide](#-usage-guide)
- [How It Works](#-how-it-works)
- [Troubleshooting](#-troubleshooting)
- [Development](#-development)

## 🌌 Concept

Hanner transforms network scanning from a boring list of IPs and ports into an interactive cosmic experience. Each device becomes a glowing node in a radial tree, with open ports orbiting like leaves. Watch data packets flow between nodes as you scan, and interact by dragging nodes or clicking to select targets.

The name "Hanner" comes from "Hawk" + "Scanner" - a sharp-eyed tool that soars above your network and spots every open port with precision.

## ✨ Features

### Core Scanning
- **Auto Network Detection** - Automatically detects your local network subnet
- **Host Discovery** - Finds all active devices on your network
- **Port Scanning** - Quick, common, full (1-65535), or custom port ranges
- **Banner Grabbing** - Capture service banners from open ports
- **Service Detection** - Identifies common services (HTTP, SSH, FTP, etc.)

### Visualization
- **Radial Tree Layout** - Gateway at center, hosts in circle, ports as leaves
- **Full IP Display** - Complete IP addresses shown below each node
- **Drag & Drop** - Reposition nodes to organize your view
- **Node Selection** - Click any node to select it as scan target
- **Live Packet Animation** - Watch data flow between gateway and hosts
- **Ambient Particles** - Subtle background animation

### Interface
- **Hosts Tab** - List of all discovered devices with port counts
- **Ports Tab** - Detailed port listing grouped by host
- **Banners Tab** - Captured service banners with timestamps
- **System Tab** - System info and event log
- **IP List Panel** - Collapsible side panel showing all hosts and their ports

### Controls
- **Quick Scan** - Scans top 100 ports on selected host
- **Deep Scan** - Full 1-65535 scan on all hosts
- **Scan All** - Quick scan on every discovered host
- **Reset View** - Returns nodes to original positions
- **Fullscreen** - Expands visualization to full screen
- **Export Data** - Save scan results as JSON or CSV

## 🚀 Installation

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher)
- [npm](https://www.npmjs.com/) (usually comes with Node.js)

### Steps

1. **Clone or download** the Hanner source code
2. **Navigate to the directory**:
   ```bash
   cd hanner-network-scanner
   ```
3. **Install dependencies**:
   ```bash
   npm install
   ```
4. **Start Hanner**:
   ```bash
   npm start
   ```

### Building Executable
To create a standalone executable:
```bash
npm run dist
```
This creates installers in the `dist` folder for your current platform.

## 🎯 Quick Start

1. **Launch Hanner** - The app automatically scans your network on startup
2. **Wait for host discovery** - Active devices appear in the visualization and hosts table
3. **Select a target** - Click any host ball or select from dropdown
4. **Run a Quick Scan** - Click the "QUICK SCAN" button
5. **View results** - Open ports appear in the Ports tab and as new leaves on the tree
6. **Grab banners** - Click the hand icon next to any port to capture service info

## 📖 Usage Guide

### The Main Interface

#### Header
- **Title** - "HANNER" with glitch effect
- **Status LED** - Shows current state (blue for scanning, green for success, red for errors)
- **Status Message** - Current operation description

#### Statistics Bar
- **Network** - Your detected subnet (e.g., 192.168.1.0/24)
- **Hosts** - Number of active devices found
- **Open Ports** - Total open ports discovered

#### Visualization Area
- **Gateway** - Large purple center node
- **Hosts** - Blue nodes in a circle, each showing:
  - Last octet above (e.g., "101")
  - Full IP below (e.g., "192.168.1.101")
- **Ports** - Green leaves orbiting their host, showing port numbers
- **Connections** - Lines showing network topology
- **Packets** - White dots flowing between gateway and hosts during activity

#### Quick Actions
- **QUICK SCAN** - Scan top 100 ports on selected host
- **DEEP SCAN** - Full scan (1-65535) on all hosts
- **SCAN ALL** - Quick scan on every discovered host
- **Scan Indicator** - Shows "SCANNING" during active scans

#### Data Panels

**Hosts Tab**
- Search/filter hosts by IP
- Each row shows: IP, hostname (last octet), status, port count
- Click crosshair icon to set as target

**Ports Tab**
- Host selector dropdown
- Port preset selector (Quick, Common, Full, Custom)
- Ports grouped by host with service and banner preview
- Hand icon to grab individual banners

**Banners Tab**
- Manual host:port input for banner grabbing
- "GRAB ALL" button for all open ports
- Banner output area with copy and clear buttons
- Timestamps for each grab

**System Tab**
- System information (platform, architecture)
- Security status display
- Event log showing all operations

#### IP List Panel
Click the list icon in the header to open a collapsible panel showing:
- All hosts with their full IPs
- Open ports under each host with service names
- Banner previews

#### Footer Controls
- **RESCAN** - Rediscover network hosts
- **EXPORT** - Save all scan data
- **HALT** - Emergency stop for ongoing scans
- **Version tag** - Current version

### Scanning Tips

| Scan Type | Ports Scanned | Time | Use Case |
|-----------|--------------|------|----------|
| Quick Scan | ~100 common ports | 2-5 seconds | Fast service discovery |
| Common | 1-1024 | 10-30 seconds | Standard scan |
| Full | 1-65535 | 5-20 minutes | Comprehensive audit |
| Custom | User-defined | Varies | Specific port checking |

### Interacting with the Visualization

- **Click any host** - Selects it as the current target
- **Drag any node** - Move it to organize your view
- **Selected node** - Glows orange and pulses
- **Reset View** - Returns all nodes to original positions
- **Fullscreen** - Expands canvas for better viewing

## 🔧 How It Works

### Architecture

Hanner is built on Electron, combining a Node.js backend with a modern web frontend:

```
┌─────────────────┐
│   Electron UI   │  (HTML/CSS/JavaScript)
├─────────────────┤
│  IPC Bridge     │  (preload.js)
├─────────────────┤
│  Scanner Core   │  (Node.js modules)
└─────────────────┘
```

### Scanning Engine

The scanner (`core.js`) uses:
- **ICMP pings** for host discovery
- **TCP socket connections** for port scanning
- **Service-specific probes** for banner grabbing
- **DNS lookups** for domain resolution
- **WHOIS queries** for domain information
- **Geolocation API** for IP location data

### Visualization Engine

The visualizer (`enhanced-canvas.js`) creates:
- **Radial layout** algorithm for node positioning
- **Physics-based dragging** with boundary constraints
- **Particle system** for ambient effects
- **Packet animation** for scan activity visualization
- **Node selection and highlighting**

### Data Flow

1. User clicks "QUICK SCAN"
2. UI sends IPC request to main process
3. Main process calls scanner core
4. Scanner performs port checks
5. Results returned via IPC
6. UI updates tables and visualization
7. New port leaves appear on the tree

## ❗ Troubleshooting

### Common Issues

**"No hosts discovered"**
- Check your network connection
- Try running as administrator (some systems block ICMP)
- Disable firewall temporarily for testing

**Port scan returns no open ports**
- Firewall may be blocking connections
- Target host may have no open ports
- Try increasing timeout in settings

**Visualization not updating**
- Click "Reset View" button
- Resize window to trigger canvas refresh
- Check console for errors (F12)

**Reset view button doesn't work**
- Ensure you're using the latest version
- Try rescanning network first
- Check browser console for errors

**Fullscreen not working**
- Some browsers restrict fullscreen API
- Click again after first attempt
- Check if canvas container exists

### Performance Tips

- Limit concurrent scans to 50-100 for stability
- Deep scan (1-65535) can take 10+ minutes on slow networks
- Close IP List panel when not needed
- Reduce particle count in settings (if available)

## 💻 Development

### Project Structure
```
hanner-network-scanner/
├── main.js                 # Electron main process
├── preload.js              # IPC bridge
├── package.json            # Dependencies
├── src/
│   ├── scanner/
│   │   └── core.js         # Scanning engine
│   └── renderer/
│       ├── index.html      # Main UI
│       ├── styles.css      # Styling
│       ├── enhanced-canvas.js # Visualization
│       └── app.js          # UI controller
```

### Key Files

| File | Purpose |
|------|---------|
| `main.js` | Electron app lifecycle, IPC handlers |
| `preload.js` | Secure bridge between renderer and main |
| `core.js` | Port scanning, host discovery, banner grabbing |
| `enhanced-canvas.js` | Network visualization with drag/drop |
| `app.js` | UI logic, event handling, data management |
| `styles.css` | All styling and animations |

### Adding Features

1. **New scan type** - Add to `core.js`, expose in `main.js`, call from `app.js`
2. **UI element** - Add to `index.html`, style in `styles.css`, wire in `app.js`
3. **Visual effect** - Add to `enhanced-canvas.js` draw methods
4. **Data export** - Extend export handlers in `main.js` and `app.js`

### Debug Mode
Uncomment this line in `main.js` to open DevTools on startup:
```javascript
// mainWindow.webContents.openDevTools();
```

## 📝 License

MIT License - feel free to use, modify, and distribute.

## 🙏 Acknowledgments

- Built with [Electron](https://www.electronjs.org/)
- Icons from [Font Awesome](https://fontawesome.com/)
- Fonts: Orbitron, Exo 2, Courier Prime from Google Fonts
- Geolocation data from [ip-api.com](http://ip-api.com)

---

**HANNER** - See your network like never before. 🦅
