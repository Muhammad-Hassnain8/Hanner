// src/scanner/core.js
// DEUS EX SOPHIA - AEONIC SCANNER CORE v2.0
// WITH OUT-OF-NETWORK SCANNING CAPABILITIES

const { networkInterfaces } = require('os');
const dns = require('dns/promises');
const net = require('net');
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);
const https = require('https');
const http = require('http');

/**
 * AUTO-DETECT LOCAL NETWORK
 */
async function autoDetectNetwork() {
    const nets = networkInterfaces();
    const results = [];

    for (const name of Object.keys(nets)) {
        for (const netInterface of nets[name]) {
            if (netInterface.internal || netInterface.family !== 'IPv4') continue;

            const subnet = deriveSubnet(netInterface.address, netInterface.netmask);
            results.push({
                interface: name,
                ip: netInterface.address,
                netmask: netInterface.netmask,
                subnet: subnet,
                cidr: ipToCidr(subnet, netInterface.netmask),
                mac: netInterface.mac,
                type: 'local'
            });
        }
    }
    return results;
}

/**
 * RESOLVE DOMAIN TO IP ADDRESS
 */
async function resolveDomain(domain) {
    try {
        // Remove protocol if present
        domain = domain.replace(/^https?:\/\//, '').replace(/\/.*$/, '');
        
        const addresses = await dns.resolve4(domain);
        return {
            domain: domain,
            ips: addresses,
            resolved: addresses[0] || null,
            type: 'remote'
        };
    } catch (error) {
        throw new Error(`Domain resolution failed: ${error.message}`);
    }
}

/**
 * SCAN PORTS - WORKS FOR BOTH LOCAL AND REMOTE
 */
async function scanPorts(host, portRange = '1-1024', options = {}) {
    const { 
        timeout = 500, 
        concurrent = 100,
        serviceDetection = true,
        bannerGrab = false 
    } = options;
    
    const ports = parsePortRange(portRange);
    const openPorts = [];
    const startTime = Date.now();
    
    // Limit concurrent connections
    const batchSize = concurrent;
    for (let i = 0; i < ports.length; i += batchSize) {
        const batch = ports.slice(i, i + batchSize);
        const batchResults = await Promise.all(
            batch.map(async (port) => {
                if (await isPortOpen(host, port, timeout)) {
                    const result = {
                        port,
                        state: 'open',
                        service: serviceDetection ? await getServiceName(port) : 'unknown',
                        protocol: getProtocolByPort(port)
                    };
                    
                    if (bannerGrab) {
                        result.banner = await grabBanner(host, port, timeout * 2);
                    }
                    
                    return result;
                }
                return null;
            })
        );
        
        batchResults.forEach(result => {
            if (result) openPorts.push(result);
        });
    }
    
    const scanTime = Date.now() - startTime;
    
    return {
        host,
        totalPortsScanned: ports.length,
        openPorts: openPorts.length,
        ports: openPorts,
        scanTimeMs: scanTime,
        scanTimeFormatted: `${(scanTime / 1000).toFixed(2)}s`,
        timestamp: new Date().toISOString()
    };
}

/**
 * ENHANCED BANNER GRABBING WITH SERVICE-SPECIFIC PROBES
 */
async function grabBanner(host, port, timeout = 2000) {
    return new Promise((resolve) => {
        const socket = new net.Socket();
        socket.setTimeout(timeout);
        
        let banner = '';
        let probe = '\r\n';
        
        // Service-specific probes
        if (port === 80 || port === 8080 || port === 8000) {
            probe = 'HEAD / HTTP/1.0\r\n\r\n';
        } else if (port === 21) {
            probe = ''; // FTP sends banner on connect
        } else if (port === 22) {
            probe = ''; // SSH sends banner on connect
        } else if (port === 25) {
            probe = 'EHLO scan.local\r\n';
        } else if (port === 443) {
            resolve('[SSL Encrypted - Use SSL grabber]');
            return;
        }
        
        socket.on('connect', () => {
            if (probe) socket.write(probe);
        });
        
        socket.on('data', (data) => {
            banner += data.toString('utf-8', 0, 2048);
            if (banner.includes('\n') || banner.length > 1024) {
                socket.destroy();
            }
        });
        
        socket.on('timeout', () => {
            socket.destroy();
            resolve(banner.substring(0, 500) || '[Timeout]');
        });
        
        socket.on('error', (err) => {
            resolve(`[Error: ${err.message}]`);
        });
        
        socket.on('close', () => {
            resolve(banner.substring(0, 500) || '[No banner]');
        });
        
        try {
            socket.connect(port, host);
        } catch (err) {
            resolve(`[Connection error: ${err.message}]`);
        }
    });
}

/**
 * SSL/TLS BANNER GRABBING FOR HTTPS
 */
async function grabSSLBanner(host, port = 443) {
    return new Promise((resolve) => {
        const tls = require('tls');
        const socket = tls.connect({
            host,
            port,
            servername: host,
            rejectUnauthorized: false,
            timeout: 3000
        });
        
        socket.on('secureConnect', () => {
            const cert = socket.getPeerCertificate();
            const banner = {
                protocol: socket.getProtocol(),
                cipher: socket.getCipher(),
                subject: cert.subject,
                issuer: cert.issuer,
                validFrom: cert.valid_from,
                validTo: cert.valid_to,
                serialNumber: cert.serialNumber
            };
            socket.destroy();
            resolve(banner);
        });
        
        socket.on('error', () => resolve(null));
        socket.on('timeout', () => {
            socket.destroy();
            resolve(null);
        });
    });
}

/**
 * PERFORM WHOIS LOOKUP
 */
async function whoisLookup(domain) {
    return new Promise((resolve, reject) => {
        const whois = require('whois');
        whois.lookup(domain, (err, data) => {
            if (err) reject(err);
            else {
                // Parse and truncate relevant info
                const lines = data.split('\n').filter(line => 
                    line.includes('Domain') || 
                    line.includes('Registrar') || 
                    line.includes('Creation') ||
                    line.includes('Expiry') ||
                    line.includes('Name Server')
                ).slice(0, 20);
                
                resolve(lines.join('\n') || 'No WHOIS data available');
            }
        });
    });
}

/**
 * GET GEOLOCATION FOR IP
 */
async function getGeolocation(ip) {
    return new Promise((resolve) => {
        // Skip private IPs
        if (ip.startsWith('10.') || 
            ip.startsWith('172.16.') || 
            ip.startsWith('192.168.') || 
            ip === '127.0.0.1' ||
            ip === 'localhost') {
            resolve({
                ip,
                type: 'private',
                location: 'Local Network',
                country: 'N/A',
                city: 'N/A'
            });
            return;
        }
        
        // Use ip-api.com (free, no API key required)
        http.get(`http://ip-api.com/json/${ip}`, (resp) => {
            let data = '';
            resp.on('data', chunk => data += chunk);
            resp.on('end', () => {
                try {
                    const json = JSON.parse(data);
                    if (json.status === 'success') {
                        resolve({
                            ip,
                            type: 'public',
                            country: json.country,
                            countryCode: json.countryCode,
                            region: json.regionName,
                            city: json.city,
                            zip: json.zip,
                            lat: json.lat,
                            lon: json.lon,
                            isp: json.isp,
                            org: json.org,
                            as: json.as,
                            timezone: json.timezone
                        });
                    } else {
                        resolve({ ip, type: 'unknown', error: json.message });
                    }
                } catch (e) {
                    resolve({ ip, type: 'unknown', error: e.message });
                }
            });
        }).on('error', () => {
            resolve({ ip, type: 'unknown', error: 'Request failed' });
        });
    });
}

/**
 * PERFORM TRACEROUTE
 */
async function performTraceroute(host) {
    try {
        const platform = process.platform;
        let command;
        
        if (platform === 'win32') {
            command = `tracert -d -h 20 ${host}`;
        } else {
            command = `traceroute -n -m 20 ${host}`;
        }
        
        const { stdout } = await execPromise(command);
        
        // Parse output
        const lines = stdout.split('\n');
        const hops = [];
        
        lines.forEach(line => {
            // Windows format
            if (line.includes('ms') && line.includes('.')) {
                const parts = line.trim().split(/\s+/);
                const hopNum = parts[0];
                let ip = parts[parts.length - 1];
                
                if (ip.includes('.')) {
                    ip = ip.replace(/[^\d\.]/g, '');
                    hops.push({
                        hop: hopNum,
                        ip: ip,
                        time: parts[1] || '1ms'
                    });
                }
            }
            
            // Unix format
            if (line.includes('ms') && line.match(/\d+\.\d+\.\d+\.\d+/)) {
                const match = line.match(/(\d+)\s+(\d+\.\d+\.\d+\.\d+)\s+(\d+\.\d+)\s*ms/);
                if (match) {
                    hops.push({
                        hop: match[1],
                        ip: match[2],
                        time: `${match[3]}ms`
                    });
                }
            }
        });
        
        return {
            target: host,
            hops: hops.slice(0, 20),
            count: hops.length
        };
    } catch (error) {
        return {
            target: host,
            error: error.message,
            hops: []
        };
    }
}

/**
 * DISCOVER HOSTS IN LOCAL NETWORK
 */
async function discoverHosts(subnet, cidr = 24) {
    const hosts = [];
    
    const [base1, base2, base3] = subnet.split('.').map(Number);
    const scanLimit = 50; // Limit for performance
    
    for (let i = 1; i <= scanLimit; i++) {
        const ip = `${base1}.${base2}.${base3}.${i}`;
        if (await pingHost(ip)) {
            hosts.push(ip);
        }
    }
    
    return hosts;
}

/**
 * PING A HOST
 */
async function pingHost(host) {
    try {
        const platform = process.platform;
        const param = platform === 'win32' ? '-n' : '-c';
        const timeout = platform === 'win32' ? '-w' : '-W';
        
        const { stdout } = await execPromise(
            `ping ${param} 1 ${timeout} 1000 ${host}`,
            { timeout: 2000 }
        );
        
        return stdout.includes('TTL=') || stdout.includes('ttl=');
    } catch (error) {
        return false;
    }
}

/**
 * CHECK IF PORT IS OPEN
 */
async function isPortOpen(host, port, timeout = 500) {
    return new Promise((resolve) => {
        const socket = new net.Socket();
        socket.setTimeout(timeout);
        
        socket.on('connect', () => {
            socket.destroy();
            resolve(true);
        });
        
        socket.on('timeout', () => {
            socket.destroy();
            resolve(false);
        });
        
        socket.on('error', () => {
            resolve(false);
        });
        
        socket.connect(port, host);
    });
}

/**
 * GET SERVICE NAME BY PORT
 */
async function getServiceName(port) {
    const commonServices = {
        20: 'FTP-Data', 21: 'FTP', 22: 'SSH', 23: 'Telnet',
        25: 'SMTP', 53: 'DNS', 80: 'HTTP', 110: 'POP3',
        111: 'RPCbind', 135: 'MSRPC', 139: 'NetBIOS', 143: 'IMAP',
        443: 'HTTPS', 445: 'SMB', 993: 'IMAPS', 995: 'POP3S',
        1723: 'PPTP', 3306: 'MySQL', 3389: 'RDP', 5432: 'PostgreSQL',
        5900: 'VNC', 6379: 'Redis', 8080: 'HTTP-Alt', 8443: 'HTTPS-Alt',
        27017: 'MongoDB', 9200: 'Elasticsearch'
    };
    
    return commonServices[port] || 'unknown';
}

/**
 * GET PROTOCOL BY PORT
 */
function getProtocolByPort(port) {
    if (port === 443 || port === 8443 || port === 993) return 'tls';
    if (port === 53) return 'udp';
    if (port === 80 || port === 8080) return 'http';
    if (port === 21) return 'ftp';
    if (port === 22) return 'ssh';
    if (port === 25) return 'smtp';
    return 'tcp';
}

/**
 * PARSE PORT RANGE STRING
 */
function parsePortRange(portRange) {
    const ports = new Set();
    
    if (!portRange) return [1, 2, 3, 4, 5]; // Default minimal set
    
    const parts = portRange.split(',');
    
    for (const part of parts) {
        const trimmed = part.trim();
        if (trimmed.includes('-')) {
            const [start, end] = trimmed.split('-').map(Number);
            if (!isNaN(start) && !isNaN(end) && start <= end) {
                for (let i = start; i <= end; i++) {
                    if (i <= 65535) ports.add(i);
                }
            }
        } else {
            const port = Number(trimmed);
            if (!isNaN(port) && port >= 1 && port <= 65535) {
                ports.add(port);
            }
        }
    }
    
    return Array.from(ports).sort((a, b) => a - b);
}

/**
 * DERIVE SUBNET FROM IP AND NETMASK
 */
function deriveSubnet(ip, netmask) {
    const ipOctets = ip.split('.').map(Number);
    const maskOctets = netmask.split('.').map(Number);
    const networkOctets = ipOctets.map((octet, i) => octet & maskOctets[i]);
    return networkOctets.join('.');
}

/**
 * CONVERT IP TO CIDR NOTATION
 */
function ipToCidr(subnet, netmask) {
    const maskOctets = netmask.split('.').map(Number);
    let cidr = 0;
    
    for (const octet of maskOctets) {
        cidr += (octet.toString(2).match(/1/g) || []).length;
    }
    
    return `${subnet}/${cidr}`;
}

/**
 * PERFORM REVERSE DNS LOOKUP
 */
async function reverseDNS(ip) {
    try {
        const hostnames = await dns.reverse(ip);
        return hostnames[0] || null;
    } catch (error) {
        return null;
    }
}

/**
 * SCAN SINGLE PORT WITH FULL DETAILS
 */
async function scanSinglePort(host, port) {
    const isOpen = await isPortOpen(host, port, 1000);
    
    if (isOpen) {
        const service = await getServiceName(port);
        let banner = null;
        let sslInfo = null;
        
        if (port === 443 || port === 8443) {
            sslInfo = await grabSSLBanner(host, port);
        } else {
            banner = await grabBanner(host, port, 2000);
        }
        
        return {
            port,
            state: 'open',
            service,
            protocol: getProtocolByPort(port),
            banner: banner || (sslInfo ? JSON.stringify(sslInfo) : null),
            ssl: sslInfo
        };
    }
    
    return {
        port,
        state: 'closed',
        service: null
    };
}

// EXPORT ALL FUNCTIONS
module.exports = {
    // Local scanning
    autoDetectNetwork,
    discoverHosts,
    pingHost,
    
    // Remote/Internet scanning
    resolveDomain,
    scanPorts,
    scanSinglePort,
    grabBanner,
    grabSSLBanner,
    whoisLookup,
    getGeolocation,
    performTraceroute,
    reverseDNS,
    
    // Utilities
    isPortOpen,
    getServiceName,
    parsePortRange,
    ipToCidr,
    deriveSubnet
};
