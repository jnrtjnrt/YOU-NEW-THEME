#!/usr/bin/env python3
"""Offline structural validation for the YOU Shopify theme.

Checks the wiring that theme-check doesn't fully cover:
  - every JSON file parses
  - every section referenced by templates / section groups exists
  - every section has exactly one valid {% schema %}
  - template JSON settings/blocks reference real schema ids and block types
  - every snippet referenced with {% render %} exists
  - every `| t` key exists in locales/en.default.json
  - range settings obey Shopify's (max-min)/step <= 101 rule and defaults in range
  - select defaults match one of their options
"""
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
errors = []
warnings = []


def load_json(path):
    try:
        return json.loads(path.read_text())
    except json.JSONDecodeError as e:
        errors.append(f"{path.relative_to(ROOT)}: invalid JSON — {e}")
        return None


def flatten_locale(d, prefix=""):
    keys = set()
    for k, v in d.items():
        full = f"{prefix}.{k}" if prefix else k
        if isinstance(v, dict):
            if set(v.keys()) & {"one", "other"}:
                keys.add(full)  # pluralized key
            else:
                keys.update(flatten_locale(v, full))
        else:
            keys.add(full)
    return keys


# --- 1. JSON validity + collect schemas -------------------------------------
section_schemas = {}
for f in sorted((ROOT / "sections").glob("*.liquid")):
    text = f.read_text()
    schemas = re.findall(r"{%\s*schema\s*%}(.*?){%\s*endschema\s*%}", text, re.S)
    if len(schemas) != 1:
        errors.append(f"{f.name}: expected exactly one schema block, found {len(schemas)}")
        continue
    try:
        schema = json.loads(schemas[0])
    except json.JSONDecodeError as e:
        errors.append(f"{f.name}: schema is invalid JSON — {e}")
        continue
    section_schemas[f.stem] = schema
    if "name" not in schema:
        errors.append(f"{f.name}: schema missing name")
    elif len(schema["name"]) > 25:
        errors.append(f"{f.name}: schema name longer than 25 chars")

for f in list((ROOT / "config").glob("*.json")) + list((ROOT / "locales").glob("*.json")):
    load_json(f)

# --- 2. Settings sanity (ranges, selects) ------------------------------------
def check_settings(settings, where):
    for s in settings or []:
        t = s.get("type")
        sid = s.get("id", "?")
        if t == "range":
            span = (s["max"] - s["min"]) / s["step"]
            if span > 101:
                errors.append(f"{where}: range '{sid}' has {span:.0f} steps (max 101)")
            if not (s["min"] <= s.get("default", s["min"]) <= s["max"]):
                errors.append(f"{where}: range '{sid}' default outside min/max")
        elif t == "select":
            values = [o["value"] for o in s.get("options", [])]
            if "default" in s and s["default"] not in values:
                errors.append(f"{where}: select '{sid}' default not in options")


settings_schema = load_json(ROOT / "config" / "settings_schema.json") or []
global_setting_ids = set()
for group in settings_schema:
    check_settings(group.get("settings"), f"settings_schema[{group.get('name')}]")
    for s in group.get("settings", []):
        if "id" in s:
            global_setting_ids.add(s["id"])

required_groups = ["Colors", "Typography", "Layout", "Buttons", "Product cards",
                   "Collection cards", "Header", "Footer", "Animations"]
schema_group_names = [g.get("name") for g in settings_schema]
for rg in required_groups:
    if rg not in schema_group_names:
        errors.append(f"settings_schema.json: missing required settings group '{rg}'")

# settings_data current values reference real setting ids
settings_data = load_json(ROOT / "config" / "settings_data.json") or {}
for key in settings_data.get("current", {}):
    if key not in global_setting_ids and key != "sections":
        warnings.append(f"settings_data.json: '{key}' not defined in settings_schema")

for name, schema in section_schemas.items():
    check_settings(schema.get("settings"), f"sections/{name}")
    for block in schema.get("blocks", []):
        check_settings(block.get("settings"), f"sections/{name} block '{block.get('type')}'")

# --- 3. Templates reference real sections, settings and block types -----------
def check_template(path, data):
    rel = path.relative_to(ROOT)
    order = data.get("order", [])
    sections = data.get("sections", {})
    if set(order) != set(sections.keys()):
        errors.append(f"{rel}: order does not match section keys")
    for key, sec in sections.items():
        stype = sec.get("type")
        if stype not in section_schemas:
            errors.append(f"{rel}: references missing section '{stype}'")
            continue
        schema = section_schemas[stype]
        valid_ids = {s.get("id") for s in schema.get("settings", []) if "id" in s}
        for sid in sec.get("settings", {}):
            if sid not in valid_ids:
                errors.append(f"{rel}: section '{key}' sets unknown setting '{sid}' on '{stype}'")
        valid_block_types = {b.get("type") for b in schema.get("blocks", [])}
        blocks = sec.get("blocks", {})
        border = sec.get("block_order", [])
        if set(border) != set(blocks.keys()):
            errors.append(f"{rel}: block_order mismatch in section '{key}'")
        for bkey, block in blocks.items():
            btype = block.get("type")
            if btype not in valid_block_types:
                errors.append(f"{rel}: block '{bkey}' has unknown type '{btype}' for '{stype}'")
            else:
                bschema = next(b for b in schema["blocks"] if b["type"] == btype)
                valid_bids = {s.get("id") for s in bschema.get("settings", []) if "id" in s}
                for sid in block.get("settings", {}):
                    if sid not in valid_bids:
                        errors.append(f"{rel}: block '{bkey}' sets unknown setting '{sid}'")


REQUIRED_TEMPLATES = [
    "index.json", "product.json", "collection.json", "page.json", "blog.json",
    "article.json", "search.json", "cart.json", "404.json", "password.json",
    "list-collections.json", "gift_card.liquid",
    "customers/login.json", "customers/register.json", "customers/account.json",
    "customers/order.json", "customers/addresses.json",
    "customers/activate_account.json", "customers/reset_password.json",
]
for t in REQUIRED_TEMPLATES:
    if not (ROOT / "templates" / t).exists():
        errors.append(f"templates/{t}: missing required template")

for f in sorted((ROOT / "templates").rglob("*.json")):
    data = load_json(f)
    if data:
        check_template(f, data)

# --- 4. Section groups ---------------------------------------------------------
for f in sorted((ROOT / "sections").glob("*.json")):
    data = load_json(f)
    if not data:
        continue
    rel = f.relative_to(ROOT)
    if data.get("type") not in ("header", "footer", "aside", "custom." + f.stem, f.stem.replace("-group", "")):
        # Shopify group types: header, footer, aside, custom.*
        if data.get("type") not in ("header", "footer", "aside") and not str(data.get("type", "")).startswith("custom."):
            errors.append(f"{rel}: invalid group type '{data.get('type')}'")
    for key, sec in data.get("sections", {}).items():
        if sec.get("type") not in section_schemas:
            errors.append(f"{rel}: references missing section '{sec.get('type')}'")

# --- 5. Snippets + layout wiring ------------------------------------------------
all_liquid = list(ROOT.rglob("*.liquid"))
snippet_names = {p.stem for p in (ROOT / "snippets").glob("*.liquid")}
for f in all_liquid:
    for m in re.finditer(r"{%-?\s*(?:render|include)\s+'([^']+)'", f.read_text()):
        if m.group(1) not in snippet_names:
            errors.append(f"{f.relative_to(ROOT)}: renders missing snippet '{m.group(1)}'")

layout = (ROOT / "layout" / "theme.liquid").read_text()
for m in re.finditer(r"{%\s*sections\s+'([^']+)'\s*%}", layout):
    if not (ROOT / "sections" / f"{m.group(1)}.json").exists():
        errors.append(f"layout/theme.liquid: missing section group '{m.group(1)}.json'")
for m in re.finditer(r"{%\s*section\s+'([^']+)'\s*%}", layout):
    if m.group(1) not in section_schemas:
        errors.append(f"layout/theme.liquid: missing static section '{m.group(1)}'")

# --- 6. Assets referenced exist ---------------------------------------------------
asset_names = {p.name for p in (ROOT / "assets").glob("*")}
for f in all_liquid:
    for m in re.finditer(r"['\"]([^'\"]+)['\"]\s*\|\s*asset_url", f.read_text()):
        if m.group(1) not in asset_names:
            errors.append(f"{f.relative_to(ROOT)}: missing asset '{m.group(1)}'")

# --- 7. Translation keys -----------------------------------------------------------
locale = load_json(ROOT / "locales" / "en.default.json") or {}
locale_keys = flatten_locale(locale)
for f in all_liquid:
    for m in re.finditer(r"'([a-z0-9_.]+)'\s*\|\s*t(?![a-z_])", f.read_text()):
        if m.group(1) not in locale_keys:
            errors.append(f"{f.relative_to(ROOT)}: missing translation key '{m.group(1)}'")

# --- Report -------------------------------------------------------------------------
for w in warnings:
    print(f"WARN  {w}")
for e in errors:
    print(f"ERROR {e}")
print(f"\n{len(errors)} errors, {len(warnings)} warnings")
sys.exit(1 if errors else 0)
