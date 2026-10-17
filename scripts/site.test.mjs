import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import { readFile, access, stat, mkdtemp, rm } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { createServer } from 'node:http';
import path from 'node:path';
import { chromium } from '@playwright/test';

const output = await mkdtemp(path.join(process.cwd(),'.test-build-'));
after(() => rm(output,{recursive:true,force:true}));
const read = name => readFile(path.join(output,name), 'utf8');
function build(env = {}) {
  const result = spawnSync(process.execPath, ['node_modules/astro/bin/astro.mjs','build','--outDir',output], {
    env: { ...process.env, SITE_URL:'', BASE_PATH:'/', ...env }, encoding:'utf8',
  });
  assert.equal(result.status,0,result.stdout+'\n'+result.stderr);
}
function meta(html, key) {
  return html.match(new RegExp(`<meta (?:name|property)="${key}" content="([^"]*)"`))?.[1];
}
async function serve(base = '/') {
  const server = createServer(async (req,res) => {
    try {
      let pathname = decodeURIComponent(new URL(req.url,'http://localhost').pathname);
      if (!pathname.startsWith(base)) { res.writeHead(404).end(); return; }
      pathname = pathname.slice(base.length);
      let filename = path.resolve(output,pathname || 'index.html');
      if (!filename.startsWith(path.resolve(output)+path.sep)) throw new Error('Invalid path');
      if ((await stat(filename)).isDirectory()) filename = path.join(filename,'index.html');
      const types = {'.html':'text/html','.css':'text/css','.js':'text/javascript','.svg':'image/svg+xml','.png':'image/png','.webp':'image/webp','.woff2':'font/woff2','.xml':'application/xml','.txt':'text/plain'};
      res.setHeader('Content-Type',types[path.extname(filename)] || 'application/octet-stream');
      res.end(await readFile(filename));
    } catch { res.writeHead(404,{'Content-Type':'text/html'}); res.end(await read('404.html')); }
  });
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  return {url:`http://127.0.0.1:${server.address().port}${base}`,close:()=>new Promise(resolve=>server.close(resolve))};
}
async function verifyAssets(html, base = '/') {
  for (const match of html.matchAll(/(?:src|href)="([^"]+)"/g)) {
    const url = match[1];
    if (!url.startsWith('/') || url.startsWith('//')) continue;
    assert.ok(url.startsWith(base),`Incorrect prefix: ${url}`);
    await access(path.join(output,url.slice(base.length)));
  }
}

test('production command rejects an absent public URL',()=>{
  const result = spawnSync(process.execPath,['scripts/build-production.mjs'],{env:{...process.env,SITE_URL:''},encoding:'utf8'});
  assert.notEqual(result.status,0); assert.match(result.stderr,/require SITE_URL/);
});

test('local build has complete HTML and cannot be indexed',async()=>{
  build(); const html = await read('index.html');
  assert.equal(meta(html,'robots'),'noindex, follow');
  assert.ok(!html.includes('rel="canonical"'));
  assert.match(html,/Your conversations, turned into useful notes/);
  assert.equal((html.match(/<h1\b/g)||[]).length,1);
  assert.ok(!html.includes('x-import')); assert.ok(!html.includes('support.js'));
  assert.match(await read('robots.txt'),/Disallow: \//);
  await assert.rejects(access(path.join(output,'sitemap.xml')));
  await verifyAssets(html);
});

test('production metadata and desktop/mobile interactions',async()=>{
  build({SITE_URL:'https://kikoe.test/'});
  const html = await read('index.html');
  assert.equal(meta(html,'robots'),'index, follow');
  assert.match(html,/<link rel="canonical" href="https:\/\/kikoe.test\/"/);
  assert.equal(meta(html,'og:image'),'https://kikoe.test/social.png');
  const json = JSON.parse(html.match(/<script type="application\/ld\+json">(.*?)<\/script>/s)[1]);
  assert.equal(json['@graph'][1]['@type'],'SoftwareApplication');
  assert.equal(json['@graph'][1].url,'https://kikoe.test/');
  assert.match(await read('sitemap.xml'),/<loc>https:\/\/kikoe.test\/<\/loc>/);
  assert.match(await read('robots.txt'),/Sitemap: https:\/\/kikoe.test\/sitemap.xml/);
  assert.equal(meta(await read('404.html'),'robots'),'noindex, follow');
  await verifyAssets(html);
  const server = await serve();
  let browser;
  try {
    browser = await chromium.launch({headless:true});
    const context = await browser.newContext({viewport:{width:1440,height:1000},colorScheme:'light',permissions:['clipboard-read','clipboard-write']});
    const page = await context.newPage(); const errors=[];
    page.on('pageerror',e=>errors.push(e.message));
    page.on('response',response=>{if(response.status()>=400) errors.push(`${response.status()} ${response.url()}`)});
    await page.goto(server.url); await page.locator('.theme-toggle').waitFor({state:'visible'});
    await page.evaluate(()=>document.fonts.ready);
    assert.ok(await page.locator('.hero-light').isVisible());
    await page.keyboard.press('Tab'); assert.equal(await page.locator(':focus').textContent(),'Skip to content');
    await page.locator('.theme-toggle').click();
    assert.ok(await page.locator('.hero-dark').isVisible());
    await page.reload(); assert.equal(await page.locator('html').getAttribute('data-theme'),'dark');
    await page.locator('.theme-toggle').click();
    await page.screenshot({path:'test-results/desktop-light.png',fullPage:true});
    await page.locator('.copy-button').first().click();
    await page.waitForFunction(()=>document.querySelector('.copy-button')?.getAttribute('aria-label')==='Command copied');
    assert.match(await page.evaluate(()=>navigator.clipboard.readText()),/^flatpak remote-add/);
    await page.evaluate(()=>Object.defineProperty(navigator,'clipboard',{value:{writeText:()=>Promise.reject(new Error('Denied'))},configurable:true}));
    await page.locator('.copy-button').last().click();
    await page.locator('.copy-notice').waitFor(); assert.match(await page.locator('#copy-status').textContent(),/manually/);
    for (const width of [320,390,768,1440]) {
      await page.setViewportSize({width,height:900});
      assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`Overflow at ${width}`);
    }
    await page.setViewportSize({width:390,height:844});
    await page.reload();
    const menu = page.locator('.menu-toggle'); await menu.click();
    assert.equal(await menu.getAttribute('aria-expanded'),'true');
    await page.keyboard.press('Escape'); assert.equal(await menu.getAttribute('aria-expanded'),'false');
    assert.ok(await menu.evaluate(el=>el===document.activeElement));
    await menu.click(); await page.locator('#mobile-nav a[href="#download"]').click();
    assert.equal(await menu.getAttribute('aria-expanded'),'false');
    await page.evaluate(()=>scrollTo(0,0)); await page.screenshot({path:'test-results/mobile-light.png',fullPage:true});
    await page.locator('.theme-toggle').click(); await page.screenshot({path:'test-results/mobile-dark.png',fullPage:true});
    await page.emulateMedia({reducedMotion:'reduce'}); assert.equal(await page.evaluate(()=>getComputedStyle(document.documentElement).scrollBehavior),'auto');
    await context.close();
    const noJS = await browser.newContext({javaScriptEnabled:false,viewport:{width:390,height:844},colorScheme:'dark'});
    const staticPage=await noJS.newPage(); await staticPage.goto(server.url);
    assert.ok(await staticPage.locator('h1').isVisible()); assert.ok(await staticPage.locator('.noscript-nav').isVisible());
    assert.ok(await staticPage.locator('.hero-dark').isVisible()); assert.equal(await staticPage.locator('.copy-button:visible').count(),0);
    await noJS.close();
    assert.deepEqual(errors,[]);
  } finally { await browser?.close(); await server.close(); }
});

test('subpath build keeps metadata, links and fetched resources under its prefix',async()=>{
  build({SITE_URL:'https://kikoe.test/project/',BASE_PATH:'/project/'});
  const html=await read('index.html');
  assert.match(html,/<link rel="canonical" href="https:\/\/kikoe.test\/project\/"/);
  assert.equal(meta(html,'og:image'),'https://kikoe.test/project/social.png');
  assert.match(await read('sitemap.xml'),/<loc>https:\/\/kikoe.test\/project\/<\/loc>/);
  await verifyAssets(html,'/project/');
  const server=await serve('/project/'); let browser;
  try {
    browser=await chromium.launch(); const page=await browser.newPage(); const failed=[];
    page.on('response',r=>{if(r.status()>=400)failed.push(r.url())});
    await page.goto(server.url); await page.locator('.theme-toggle').waitFor({state:'visible'});
    assert.ok(await page.locator('h1').isVisible()); assert.deepEqual(failed,[]);
    const response=await page.goto(server.url+'missing-page/'); assert.equal(response.status(),404);
    assert.equal(await page.locator('a.button').getAttribute('href'),'/project/');
  } finally {await browser?.close();await server.close();}
});
