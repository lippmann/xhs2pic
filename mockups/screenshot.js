const puppeteer = require('puppeteer');
const path = require('path');

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  const filePath = path.resolve(__dirname, 'article-wenkai.html');
  await page.goto('file://' + filePath, { waitUntil: 'networkidle0' });

  // 等待字体和 JS 分页完成
  await new Promise(r => setTimeout(r, 2000));

  // 获取 article 元素的实际尺寸
  const dims = await page.evaluate(() => {
    const el = document.getElementById('article');
    return { width: el.offsetWidth, height: el.offsetHeight };
  });

  await page.setViewport({ width: dims.width, height: dims.height, deviceScaleFactor: 1 });

  // 截取 article 元素
  const el = await page.$('#article');
  await el.screenshot({
    path: path.resolve(__dirname, 'article-wenkai-full.png'),
    type: 'png',
  });

  console.log(`Done: ${dims.width} × ${dims.height}px`);
  await browser.close();
})();
