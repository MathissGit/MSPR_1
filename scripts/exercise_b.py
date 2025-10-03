#!/usr/bin/env python3
import sys, subprocess
try:
    import nmap
except Exception:
    nmap = None

def discovery_with_nmap(network):
    """Retourne liste d'IPs up via python-nmap (-sn)."""
    try:
        nm = nmap.PortScanner()
        nm.scan(hosts=network, arguments='-sn')
        hosts = [h for h in nm.all_hosts() if nm[h].state() == 'up']
        return hosts
    except Exception as e:
        print("[WARN] nmap discovery failed:", e)
        return []

def ping_sweep(prefix, start=1, end=50):
    """Fallback simple : ping 1 fois chaque IP du préfixe."""
    alive = []
    for i in range(start, min(end,254)+1):
        ip = f"{prefix}{i}"
        args = ["ping","-n","1",ip] if sys.platform == "win32" else ["ping","-c","1",ip]
        try:
            subprocess.check_output(args, stderr=subprocess.DEVNULL, timeout=1)
            alive.append(ip)
        except Exception:
            pass
    return alive

def main():
    net = "192.168.1.0/24"
    print("Network:", net)
    if nmap:
        print("[i] python-nmap detected -> trying nmap discovery")
        hosts = discovery_with_nmap(net)
        print("[i] hosts from nmap:", hosts)
        if hosts:
            return
        print("[i] nmap returned no hosts, falling back to ping_sweep")
    else:
        print("[i] python-nmap not available -> using ping_sweep fallback")
    # fallback prefix calc for typical /24
    prefix = ".".join(net.split(".")[:3]) + "."
    alive = ping_sweep(prefix, 1, 50)
    print("[i] hosts from ping_sweep:", alive)

if __name__ == "__main__":
    main()
