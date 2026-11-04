const fs = require('fs');

async function submitIndexNow() {
  const KEY = 'ee6a2bc74cb09158e433edd79d0ce4df';
  const HOST = 'profitgymclub.com';
  const KEY_LOCATION = `https://${HOST}/${KEY}.txt`;

  const xml = fs.readFileSync('public/sitemap.xml', 'utf8');
  const urls = [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map(m => m[1]);

  console.log(`\nSubmitting ${urls.length} URLs to IndexNow protocol (Bing, Yahoo, Naver, Seznam)...`);

  const payload = {
    host: HOST,
    key: KEY,
    keyLocation: KEY_LOCATION,
    urlList: urls
  };

  try {
    const res = await fetch('https://api.indexnow.org/indexnow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify(payload)
    });
    console.log(`IndexNow Response: HTTP ${res.status} ${res.statusText}`);
    if (res.status === 200 || res.status === 202) {
      console.log('✅ URLs successfully received by IndexNow! Instant indexing initiated.');
    } else {
      const body = await res.text();
      console.log('Status Details:', body);
    }
  } catch (err) {
    console.error('IndexNow request error:', err.message);
  }
}

submitIndexNow();
