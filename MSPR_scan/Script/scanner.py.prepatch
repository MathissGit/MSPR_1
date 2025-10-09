#!/usr/bin/env python3
"""
scanner.py - unifié (nmap optional, fallback TCP)

Usage:
  python scanner.py --inventory inventory.json
  python scanner.py --hosts 127.0.0.1
  python scanner.py --cidr 192.168.1.0/24 --use-nmap
"""
import argparse
import json
import socket
import platform
import subprocess
import re
import uuid
from pathlib import Path
from datetime import datetime, timezone
from concurrent.futures import ThreadPoolExecutor, as_completed

# optional nmap
try:
    import nmap
except Exception:
    nmap = None

DEFAULT_PORTS = [22, 80, 443, 139, 445, 3389, 8000, 8080]
REPORTS_DIR = Path("reports")
REPORTS_DIR.mkdir(parents=True, exist_ok=True)


def load_inventory(path):
    p = Path(path)
    if not p.exists():
        raise FileNotFoundError(path)
    data = json.loads(p.read_text(encoding="utf-8"))
    if isinstance(data, dict) and "hosts" in data:
        return data["hosts"]
    if isinstance(data, list):
        return data
    raise ValueError("inventory.json must be a list or {'hosts': [...]}")

def discover_with_nmap_cidr(cidr):
    nm = nmap.PortScanner()
    nm.scan(hosts=cidr, arguments='-sn')
    hosts = [h for h in nm.all_hosts() if nm[h].state() == 'up']
    return hosts

def scan_ports_nmap(host, ports="1-1024"):
    nm = nmap.PortScanner()
    try:
        # -sV for service/version, -O for os detection (may require privileges)
        nm.scan(hosts=host, arguments=f'-p {ports} --open -sT -sV -O -Pn -T4')
    except Exception:
        return {"ports": [], "os": None, "service_versions": []}
    res_ports = []
    os_name = None
    service_versions = []
    try:
        if host in nm.all_hosts():
            # ports
            for proto in nm[host].all_protocols():
                for port in nm[host][proto].keys():
                    state = nm[host][proto][port].get('state', 'unknown')
                    prod = nm[host][proto][port].get('product')
                    version = nm[host][proto][port].get('version')
                    res_ports.append({"port": int(port), "state": state, "product": prod, "version": version})
                    if prod or version:
                        service_versions.append({"port": int(port), "product": prod, "version": version})
            # os
            osmatches = nm[host].get('osmatch', [])
            if osmatches:
                os_name = osmatches[0].get('name')
    except Exception:
        pass
    return {"ports": res_ports, "os": os_name, "service_versions": service_versions}

def is_port_open_tcp(host, port, timeout=1.0):
    try:
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            s.settimeout(timeout)
            s.connect((host, port))
            return True
    except Exception:
        return False

def scan_host_fallback(host, ports=DEFAULT_PORTS, workers=50, timeout=1.0):
    results = []
    with ThreadPoolExecutor(max_workers=workers) as ex:
        futures = {ex.submit(is_port_open_tcp, host, p, timeout): p for p in ports}
        for fut in as_completed(futures):
            p = futures[fut]
            try:
                open_ = fut.result()
            except Exception:
                open_ = False
            results.append({"port": p, "state": "open" if open_ else "closed"})
    return results

def get_hostname(host):
    try:
        return socket.gethostbyaddr(host)[0]
    except Exception:
        return None

def avg_ping_ms(target, count=3, timeout_ms=1000):
    """
    Return average RTT in ms or None. Works on Windows and *nix.
    """
    system = platform.system().lower()
    try:
        if system.startswith("win"):
            cmd = ["ping", "-n", str(count), "-w", str(timeout_ms), target]
        else:
            # -c count, -W timeout (per-packet in sec), use -q to quiet but we parse stdout
            cmd = ["ping", "-c", str(count), "-W", str(int(timeout_ms/1000)), target]
        res = subprocess.run(cmd, capture_output=True, text=True, timeout=(count * (timeout_ms/1000.0) + 3))
        out = res.stdout
        # Windows: look for "Average = 32ms"
        m = re.search(r'Average\s*=\s*([\d]+)ms', out)
        if m:
            return float(m.group(1))
        # Unix-like: look for rtt min/avg/max/mdev = x/x/x/x ms
        m2 = re.search(r'=\s*[\d\.]+/([\d\.]+)/', out)
        if m2:
            return float(m2.group(1))
    except Exception:
        pass
    return None

def summarize_report(entries):
    up = [e for e in entries if e.get("status","up") == "up" or any(p.get("state")=="open" for p in e.get("ports",[]))]
    return {"hosts_scanned": len(entries), "hosts_up_guess": len(up)}

def main():
    ap = argparse.ArgumentParser(description="Scanner unifié (nmap optional, fallback TCP).")
    g = ap.add_mutually_exclusive_group(required=True)
    g.add_argument("--inventory", "-i", help="fichier inventory.json")
    g.add_argument("--cidr", help="CIDR pour discovery (ex: 192.168.1.0/24)")
    g.add_argument("--hosts", nargs="+", help="liste d'IP à scanner")
    ap.add_argument("--ports", nargs="+", type=int, help="ports à scanner (fallback)", default=DEFAULT_PORTS)
    ap.add_argument("--use-nmap", action="store_true", help="forcer utilisation de python-nmap (si installé)")
    ap.add_argument("--timeout", type=float, default=1.0, help="timeout socket (sec)")
    ap.add_argument("--workers", type=int, default=50, help="threads pour fallback")
    ap.add_argument("--wan-probe", default="8.8.8.8", help="IP used to measure WAN latency (default 8.8.8.8)")
    ap.add_argument("--report-name", help="nom du fichier report (sans extension)")
    args = ap.parse_args()

    # compute WAN latency once
    wan_probe = args.wan_probe
    meta_wan_rtt = avg_ping_ms(wan_probe, count=3)

    # build hosts list
    hosts = []
    if args.inventory:
        hosts = load_inventory(args.inventory)
    elif args.cidr:
        if nmap and (args.use_nmap or True):
            try:
                hosts = discover_with_nmap_cidr(args.cidr)
            except Exception:
                hosts = []
        if not hosts:
            base = args.cidr.rsplit('.',1)[0]
            hosts = [f"{base}.{i}" for i in range(1,255)]
    elif args.hosts:
        hosts = args.hosts

    hosts = sorted(set(hosts))
    print(f"[*] Hosts to scan: {len(hosts)}")

    report = {
        "meta": {
            "generated_at": datetime.now(timezone.utc).isoformat(),
            "source": "scanner.py",
            "wan_probe": wan_probe,
            "wan_avg_rtt_ms": meta_wan_rtt
        },
        "results": []
    }

    for h in hosts:
        entry = {
            "host": h,
            "host_id": str(uuid.uuid4()),
            "hostname": get_hostname(h),
            "checked_at": datetime.now(timezone.utc).isoformat(),
            "ports": [],
            "status": "unknown",
            "open_ports_count": 0,
            "scan_summary": "",
            "avg_rtt_ms": None,
            "os": None,
            "service_versions": []
        }

        # try nmap port scan if available and requested
        if nmap and args.use_nmap:
            try:
                print(f"[*] nmap scan for {h} ...")
                nres = scan_ports_nmap(h, ports=",".join(str(p) for p in args.ports))
                if nres and nres.get("ports"):
                    entry["ports"] = nres["ports"]
                    entry["os"] = nres.get("os")
                    entry["service_versions"] = nres.get("service_versions", [])
                    entry["status"] = "up"
                    # add RTT from host (ping) if wanted
                    entry["avg_rtt_ms"] = avg_ping_ms(h, count=2)
                    entry["open_ports_count"] = sum(1 for p in entry["ports"] if p.get("state") == "open")
                    entry["scan_summary"] = f"{entry['open_ports_count']} open / {len(entry['ports'])} scanned (nmap)"
                    report["results"].append(entry)
                    continue
            except Exception:
                pass

        # fallback TCP scan
        print(f"[*] fallback TCP scan {h} ...")
        res = scan_host_fallback(h, ports=args.ports, workers=args.workers, timeout=args.timeout)
        entry["ports"] = res
        entry["open_ports_count"] = sum(1 for p in res if p.get("state") == "open")
        entry["scan_summary"] = f"{entry['open_ports_count']} open / {len(res)} scanned (tcp fallback)"
        entry["avg_rtt_ms"] = avg_ping_ms(h, count=2)
        entry["status"] = "up" if entry["open_ports_count"] > 0 else "down-or-filtered"

        report["results"].append(entry)

    report["summary"] = summarize_report(report["results"])
    name = args.report_name or f"report_{datetime.now(timezone.utc).strftime('%Y%m%dT%H%M%SZ')}"
    out = REPORTS_DIR / f"{name}.json"
    out.write_text(json.dumps(report, indent=2), encoding="utf-8")
    print(f"[*] Report written to {out}")
    print("Summary:", report["summary"])


if __name__ == "__main__":
    main()
