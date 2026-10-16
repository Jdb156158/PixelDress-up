const { chromium } = require('playwright');
(async () => {
const browser = await chromium.launch({headless:true, ...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH ? {executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH} : {})});
const page = await browser.newPage({viewport:{width:1440,height:1000},deviceScaleFactor:1});
page.on('pageerror',e=>console.log('ERROR',e.message));
await page.goto('http://localhost:4186');await page.waitForFunction(()=>document.querySelector('.doll')?.toDataURL().length>10000);await page.screenshot({path:'docs/preview.png'});
await page.setViewportSize({width:390,height:844});await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));await page.screenshot({path:'docs/phone.png'});await page.locator('.bottom-nav').screenshot({path:'docs/navigation.png'});
await page.locator('[data-page=home]').click();await page.screenshot({path:'docs/home.png'});
await page.locator('[data-page=merge]').click();await page.screenshot({path:'docs/merge.png'});
await browser.close();

})().catch(e=>{console.error(e);process.exitCode=1;});
