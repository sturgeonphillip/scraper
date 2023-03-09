import axios from 'axios';
import { existsSync, mkdirSync } from 'fs';
import { readFile, writeFile } from 'fs/promises';
import { resolve } from 'path';
import { JSDOM } from 'jsdom';

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
    const htmlData = await eradFile(
      resolve(__dirname, `.cache/${Buffer.from(url).toString('base64')}.html`),
      { encoding: 'utf8' }
    );
    const dom = new JSDOM(htmlData);
    return dom.window.document;
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
