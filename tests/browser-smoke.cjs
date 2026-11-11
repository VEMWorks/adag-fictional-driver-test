const {chromium}=require('playwright');const assert=require('node:assert/strict');const path=require('node:path');(async()=>{const browser=await chromium.launch({headless:true});const page=await browser.newPage({viewport:{width:390,height:844}});const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('dialog',d=>d.dismiss());await page.goto('file://'+path.resolve('index.html'));await page.waitForTimeout(800);assert.equal(errors.length,0,'startup errors: '+errors.join('; '));const body=await page.locator('body').innerText();assert(body.includes('ADAG'),'ADAG visible');// Exercise START's public handler without relying on the app's onboarding UI.
await page.evaluate(()=>{
  const app=document.getElementById('app');
  app.innerHTML='<select id="startState"><option value="OTHER" selected>OTHER</option></select><input id="startStateManual" value=""><button id="testStart" onclick="startMovement()">START Movement</button>';
});
const messages=[];
page.removeAllListeners('dialog');
page.on('dialog',async d=>{messages.push(d.message());await d.dismiss()});
await page.locator('#testStart').click();
assert((await page.locator('#adagStartStatus').innerText()).includes('START did not create a movement') || messages.length>0,'START tap must be acknowledged visibly');
assert.equal(errors.length,0,'START uncaught errors: '+errors.join('; '));
console.log('PASS START error surfaced');
console.log('PASS chromium startup');await browser.close()})().catch(e=>{console.error(e);process.exit(1)});