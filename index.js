import { existsSync, mkdirSync } from 'fs';
import { readFile, writeFile } from 'fs/promises';
import path, { resolve } from 'path';
import { fileURLToPath } from 'url';
import { JSDOM } from 'jsdom';
import axios from 'axios';

// bring globals into es modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function fetchPage(url) {
  const htmlData = axios
    .get(url)
    .then((res) => res.data)
    .catch((error) => {
      if (error.config) {
        console.error(`There was an error at ${error.config.url}.`);
        console.error(error.toJSON());
      }
    });
  return htmlData;
}

async function fetchWebOrCache(url, ignoreCache = false) {
  if (!existsSync(resolve(__dirname, '.cache'))) {
    mkdirSync('.cache');
  }
  console.log(`Fetching url data from ${url}`);
  if (
    !ignoreCache &&
    existsSync(
      resolve(__dirname, `.cache/${Buffer.from(url).toString('base64')}.html`)
    )
  ) {
    console.log(`data read from cache for url: ${url}`);
    const htmlData = await readFile(
      resolve(__dirname, `.cache/${Buffer.from(url).toString('base64')}.html`),
      { encoding: 'utf8' }
    );

    return htmlData;
  } else {
    console.log(`fresh data fetched from url: ${url}`);
    const htmlData = await fetchPage(url);

    if (!ignoreCache && htmlData) {
      writeFile(
        resolve(
          __dirname,
          `.cache/${Buffer.from(url).toString('base64')}.html`
        ),
        htmlData,
        { encoding: 'utf8' }
      );
    }
    const dom = new JSDOM(htmlData);
    return dom.window.document;
  }
}

function extract(document) {
  const links = Array.from(document.querySelectorAll('span.titleline'));
  return links.map((link) => {
    const a = link.children[0];
    return {
      title: a.innerHTML,
      url: a.getAttribute('href'),
    };
  });
}

function saveData(filename, data) {
  if (!existsSync(resolve(__dirname, 'data'))) {
    mkdirSync('data');
  }
  writeFile(resolve(__dirname, `data/${filename}.json`), JSON.stringify(data), {
    encoding: 'utf-8',
  });
}

async function getData() {
  const doc = await fetchWebOrCache('https://news.ycombinator.com/', true);
  const data = typeof document === 'string' ? doc : extract(doc);
  saveData('hacker-news-links', data);
}

getData();
