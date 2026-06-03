from playwright.sync_api import sync_playwright
import os

base = os.path.dirname(os.path.abspath(__file__))

themes = [
    ('article-sulcus.html',  'article-sulcus-full.png'),
    ('article-meridian.html','article-meridian-full.png'),
    ('article-nuit.html',    'article-nuit-full.png'),
]

with sync_playwright() as p:
    browser = p.chromium.launch(
        executable_path='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
    )
    for html_file, out_file in themes:
        html = os.path.join(base, html_file)
        out  = os.path.join(base, out_file)

        page = browser.new_page(viewport={'width': 1080, 'height': 900})
        page.goto(f'file://{html}')
        page.wait_for_timeout(3000)

        h = page.evaluate("document.getElementById('article').offsetHeight")
        page.set_viewport_size({'width': 1080, 'height': h})
        page.wait_for_timeout(500)

        page.locator('#article').screenshot(path=out, type='png')
        print(f'Done: {html_file} → 1080 x {h}px → {out_file}')
        page.close()

    browser.close()
