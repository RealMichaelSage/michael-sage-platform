import os

kp_files = ["KP/soba/288225/index.html", "KP/soba/288225.html"]
desc_tag = '  <meta name="description" content="Коммерческое предложение на разработку цифровой инвестиционной платформы для клуба бизнес-ангелов «СОБА»">\n  <meta property="og:description" content="Коммерческое предложение на разработку цифровой инвестиционной платформы для клуба бизнес-ангелов «СОБА»">\n'

for file in kp_files:
    if os.path.exists(file):
        with open(file, 'r', encoding='utf-8') as f:
            content = f.read()
        if "meta name=\"description\"" not in content:
            content = content.replace('  <title>', desc_tag + '  <title>')
        with open(file, 'w', encoding='utf-8') as f:
            f.write(content)
