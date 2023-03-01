import axios, { AxiosError } from 'axios';
import { existsSync, mkdirSync } from 'fs';
import { readFile, writeFile } from 'fs/promises';
import { resolve } from 'path';
import { JSDOM } from 'jsdom';

function fetchPage (url: string): Promise<string | undefined> {
  const htmlData = axios
    .get(url)
    .then(res => res.data)
    .catch((error: AxiosError) => {
      if (error.config) {
        console.error(`There was an error with ${error.config.url}.`);
        console.error(error.toJSON());
      }
    });

  return htmlData;
}

async function fetchFromWebOrCache (url: string, ignoreCache = false) {
  // if no cache, create it
  if (!existsSync(resolve(__dirname, '.cache'))) {
    mkdirSync('.cache');
  }
  console.log(`Getting data for ${url}...`);
  if (
    !ignoreCache &&
    existsSync(
      resolve(__dirname, `.cache/${Buffer.from(url).toString('base64')}.html`),
    )
  ) {
    console.log(`I read ${url} from cache`);
    const htmlData = await readFile(
      resolve(__dirname, `.cache/${Buffer.from(url).toString('base64')}.html`),
      { encoding: 'utf8' },
    );
    const dom = new JSDOM(htmlData);
    return dom.window.document;
  } else {
    console.log(`I fetched ${url} fresh`);
    const htmlData = await fetchPage(url);
    if (!ignoreCache && htmlData) {
      writeFile(
        resolve(
          __dirname,
          `.cache/${Buffer.from(url).toString('base64')}.html`,
        ), htmlData,
        { encoding: 'utf8' },
      );
    }
    const dom = new JSDOM(htmlData);
    return dom.window.document;
  }
}

function extractData (document: Document) {
  const writingLinks: HTMLAnchorElement[] = Array.from(
    document.querySelectorAll('span.titleline'),
  );
  return writingLinks.map(link => {
    const a = link.children[0];
    // console.log(link);
    return {
      title: a.innerHTML,
      url: a.getAttribute('href'),
    };
  });
}

function saveData (filename: string, data: any) {
  if (!existsSync(resolve(__dirname, 'data'))) {
    mkdirSync('data');
  }
  writeFile(resolve(__dirname, `data/${filename}.json`), JSON.stringify(data), {
    encoding: 'utf8',
  });
}

async function getData () {
  const document = await fetchFromWebOrCache(
    'https://news.ycombinator.com/',
    true, // ignore cache
  );
  const data = extractData(document);
  saveData('hacker-news-links', data);
}

getData();

// *** JSDOM works with NodeLists and Elements (NOT arrays or objects)
// docment.querySelector('selector');
