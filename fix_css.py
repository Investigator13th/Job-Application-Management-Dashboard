import re

with open("src/styles/global.css", "r", encoding="utf-8") as f:
    content = f.read()

# 重构硬编码颜色
content = content.replace("#f7f8fa", "var(--color-bg)") # app-shell
content = content.replace("background: #ffffff;", "background: var(--color-surface);")
content = content.replace("background: #fafafa;", "background: var(--color-bg);")

# 边框体系
content = content.replace("#e5e7eb", "var(--color-border)")

# Border radius
content = content.replace("border-radius: 999px;", "border-radius: var(--radius-pill);")

# Typography
content = content.replace("font-weight: 700;", "font-weight: 500;")
content = content.replace("font-weight: 600;", "font-weight: 500;")

# Hover Interactions (Pink to Sunlit Forest Colors)
content = content.replace("#fff5f7", "var(--color-surface-muted)")
content = content.replace("#fff1f4", "var(--color-surface-muted)")
content = content.replace("#fffafb", "var(--color-surface-muted)")
content = content.replace("rgba(232, 62, 140", "rgba(31, 163, 100") 
content = content.replace("#fda4af", "rgba(31, 163, 100, 0.4)") 

# Layout and Spacing
content = content.replace("padding: 24px;", "padding: 32px;")
content = content.replace("padding: 24px 28px;", "padding: 32px 40px;")
content = content.replace("gap: 20px;", "gap: 32px;")


# Shadows mapping Tyndall Effect
content = content.replace("0 12px 24px rgba(232, 62, 140, 0.2)", "var(--shadow-hover)")
content = content.replace("0 16px 32px rgba(232, 62, 140, 0.12)", "var(--shadow-hover)")
content = content.replace("0 18px 40px rgba(232, 62, 140, 0.12)", "var(--shadow-hover)")

# Make buttons softer padded
content = content.replace("padding: 12px 20px;", "padding: 12px 28px;") # stretched pill look


with open("src/styles/global.css", "w", encoding="utf-8") as f:
    f.write(content)

print("global.css refactored to Sunlit Forest styling.")
