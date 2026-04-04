require('dotenv').config();
const key = process.env.GEMINI_API_KEY;
const urls = [
  `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${key}`,
  `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${key}`
];

async function main() {
  for (const url of urls) {
    console.log("Testing:", url);
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: "Hello" }] }] })
    });
    const data = await res.json();
    console.log(res.status, data.error ? data.error.message : "Success");
  }
}
main();
