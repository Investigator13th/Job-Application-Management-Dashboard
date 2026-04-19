import re

with open("src/styles/global.css", "r", encoding="utf-8") as f:
    content = f.read()

# Fix link styling globally to avoid blue underlines
css_additions = """
a {
  text-decoration: none;
  color: inherit;
}

.sidebar-nav__item {
  color: var(--color-text-primary);
}

.overview-shortcut {
  color: var(--color-text-primary);
}
"""
if "a {" not in content:
    content = content + css_additions

# Fix calendar cell height & overlaps
content = content.replace("min-height: 140px;", "min-height: 100px;")
content = content.replace(
"""
.dashboard-page--calendar > .application-calendar,
.dashboard-page--account > .hero-card {
  overflow: hidden;
}""",
"""
.dashboard-page--calendar > .application-calendar,
.dashboard-page--account > .hero-card {
  overflow: auto;
}"""
)

# Apply pill shapes strictly to standard buttons where needed
content = content.replace("border-radius: var(--radius-sm);", "border-radius: var(--radius-pill);")

with open("src/styles/global.css", "w", encoding="utf-8") as f:
    f.write(content)

print("Fixed CSS issues")
