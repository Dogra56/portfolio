#!/usr/bin/env python3
"""Bundle the source stylesheets into one minified file for production.

Edit the files in assets/css/ as usual, then run:   python3 build.py
Netlify runs this automatically on every deploy (see netlify.toml).
No dependencies: plain Python 3.
"""
import pathlib, re

ROOT = pathlib.Path(__file__).parent
CSS = ROOT / "assets" / "css"
ORDER = ["fonts.css", "tokens.css", "base.css", "components.css", "sections.css", "visuals.css"]
OUT = CSS / "site.min.css"


def minify(css: str) -> str:
    css = re.sub(r"/\*.*?\*/", "", css, flags=re.S)          # comments
    css = re.sub(r"\s+", " ", css)                              # whitespace
    css = re.sub(r"\s*([{}:;,>])\s*", r"\1", css)               # around punctuation
    css = css.replace(";}", "}")
    return css.strip()


def main():
    parts = []
    for name in ORDER:
        src = (CSS / name).read_text(encoding="utf-8")
        parts.append(minify(src))
    bundle = "/* Built by build.py from assets/css/*.css — edit the sources, not this file. */\n" + "\n".join(parts) + "\n"
    OUT.write_text(bundle, encoding="utf-8")
    raw = sum((CSS / n).stat().st_size for n in ORDER)
    print(f"site.min.css written: {OUT.stat().st_size / 1024:.1f} KB (sources {raw / 1024:.1f} KB)")


if __name__ == "__main__":
    main()
