#!/usr/bin/env python3
import json
from datetime import datetime
from pathlib import Path
import socket

REPORTS = Path("reports")
REPORTS.mkdir(exist_ok=True)
INVENTORY = Path("inventory.json")
VERSION = Path("VERSION")

def load_inventory(p):
    # Lis en UTF-8 et accepte BOM, vide ou JSON invalide
    try:
        if not p.exists() or p.stat().st_size == 0:
            return {"hosts": []}
        text = p.read_text(encoding="utf-8-sig").strip()
        if not text:
            return {"hosts": []}
        data = json.loads(text)
        # garde au moins une liste
        if not isinstance(data, dict) or "hosts" not in data or not isinstance(data["hosts"], list):
            return {"hosts": []}
        return data
    except Exception as e:
        print(f"[WARN] inventory read failed: {e}")
        return {"hosts": []}

def write_report(report):
    ts = datetime.utcnow().isoformat().replace(":", "-")
    out = REPORTS / f"report_{ts}.json"
    out.write_text(json.dumps(report, indent=2, ensure_ascii=False))
    (REPORTS / "latest.json").write_text(json.dumps(report, indent=2, ensure_ascii=False))
    print("WROTE", out)

def write_version(ver="0.1.0"):
    VERSION.write_text(f"{ver} - {datetime.utcnow().isoformat()}Z`n")
    print("WROTE VERSION")

def main():
    inv = load_inventory(INVENTORY)
    report = {
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "version": "0.1.0",
        "vm": {"hostname": socket.gethostname(), "ip": "N/A"},
        "nb_hosts": len(inv.get("hosts", [])),
        "hosts": inv.get("hosts", []),
        "summary": "exercise_a minimal"
    }
    write_report(report)
    write_version("0.1.0")

if __name__ == "__main__":
    main()
