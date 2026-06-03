from playwright.sync_api import sync_playwright
import os

html = os.path.abspath(os.path.join(os.path.dirname(__file__), 'article-wenkai.html'))
out  = os.path.abspath(os.path.join(os.path.dirname(__file__), 'article-wenkai-full.png'))

with sync_playwright() as p:
    browser = p.chromium.launch(
        executable_path='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
    )
    page = browser.new_page(viewport={'width': 1080, 'height': 900})
    page.goto(f'file://{html}')
    page.wait_for_timeout(3000)  # 等字体+JS分页

    h = page.evaluate("document.getElementById('article').offsetHeight")
    page.set_viewport_size({'width': 1080, 'height': h})
    page.wait_for_timeout(500)

    page.locator('#article').screenshot(path=out, type='png')
    print(f'Done: 1080 x {h}px → {out}')
    browser.close()
