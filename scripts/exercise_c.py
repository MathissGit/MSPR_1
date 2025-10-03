#!/usr/bin/env python3
import sys, socket, subprocess, json, time

# try python-nmap
try:
    import nmap
except Exception:
    nmap = None

def scan_ports_nmap(host, args="-F"):
    """Scan rapide via python-nmap -> retourne liste de ports ouverts (ints)."""
    if not nmap:
        raise RuntimeError("python-nmap not available")
    try:
        nm = nmap.PortScanner()
        nm.scan(hosts=host, arguments=args)
        if host not in nm.all_hosts():
            return []
        open_ports = []
        # parcourir protocoles détectés (tcp/udp)
        for proto in nm[host].all_protocols():
            ports = nm[host][proto].keys()
            open_ports.extend(int(p) for p in ports)
        return sorted(open_ports)
    except Exception as e:
        print("[WARN] nmap scan error:", e)
        return []

def scan_ports_fallback(host, ports=[22,80,443,3389,8080], timeout=0.6):
    """Fallback: tentative simple de connexion TCP pour chaque port."""
    open_ports = []
    for p in ports:
        try:
            s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            s.settimeout(timeout)
            s.connect((host, p))
            s.close()
            open_ports.append(p)
        except Exception:
            pass
    return open_ports

def main():
    host = "127.0.0.1"
    print("Target host:", host)
    # try python-nmap path
    if nmap:
        print("[i] using python-nmap fast scan")
        ports = scan_ports_nmap(host, args='-F')
        print("[i] ports from nmap:", ports)
        if ports:
            return
        print("[i] nmap returned no open ports (or none found) -> fallback TCP check")
    else:
        print("[i] python-nmap not available -> fallback TCP check")
    fb = scan_ports_fallback(host)
    print("[i] ports from fallback TCP connect:", fb)

if __name__ == '__main__':
    main()
