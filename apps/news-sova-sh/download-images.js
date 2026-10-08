import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkStringify from "remark-stringify";
import { visit } from "unist-util-visit";
import { read, write } from "to-vfile";
import { paramCase } from "change-case";
import { matter } from "vfile-matter";

const ISSUES_PATH = "./src/content/issues";
const PUBLIC_PATH = "./public/";

main().catch(console.error);

async function main() {
  const processor = unified()
    .use(remarkParse)
    .use(() => (_, file) => {
      matter(file);
    })
    .use(plugin)
    .use(remarkStringify);

  const issues = (await fs.readdir(ISSUES_PATH))
    .filter((file) => file.endsWith(".md"))
    .sort((a, b) => parseInt(a, 10) - parseInt(b, 10));

  for (const issuePath of issues) {
    const vfile = await read(path.join(ISSUES_PATH, issuePath));
    const processed = await processor()
      .data("issue", issuePath.replace(".md", ""))
      .process(vfile);
    await write(processed);
  }
  console.log("👍🏻 Done!");
}

function plugin() {
  return async (tree) => {
    const issue = this.data("issue");
    const queue = [];

    visit(tree, (node) => {
      if (node.type === "image") {
        if (node.url.startsWith("http://") || node.url.startsWith("https://")) {
          queue.push({ node });
        }
      }
    });

    if (queue.length > 0) {
      console.log(`🔷 Found remote images for "${issue}":`, queue.length);
      await Promise.all(
        queue.map(async ({ node }) => {
          const filePath = await downloadImage(node.url, issue);
          if (filePath) {
            node.url = filePathToUrlPath(filePath);
          } else {
            console.error(`❗️ Failed to download "${issue}": ${node.url}`);
          }
        })
      );
    } else {
      console.log("✅ No remote images found");
    }
  };
}

async function downloadImage(urlString, issueSlug) {
  try {
    const url = new URL(urlString);
    const fileName = createName(urlString);
    const filePath = path.join(PUBLIC_PATH, issueSlug, fileName);

    const response = await fetch(url);
    if (!response.ok) {
      console.error(`Failed to download image for`, urlString);
      return null;
    }
    await fs.mkdir(path.join(PUBLIC_PATH, issueSlug), { recursive: true });
    await fs.writeFile(filePath, Buffer.from(await response.arrayBuffer()));
    return filePath;
  } catch (error) {
    console.error(error);
    return null;
  }
}

function createName(urlString) {
  const url = new URL(urlString);
  url.search = "";
  url.hash = "";
  const ext = path.extname(url.toString()) || ".jpg";
  const regexp = new RegExp(`${ext}$`);
  const name = paramCase(`${url.hostname}-${url.pathname.replace(regexp, "")}`);
  const hash = crypto.createHash("md5");
  return `${hash.update(name).digest("hex")}${ext}`;
}

function filePathToUrlPath(filePath) {
  return filePath.replace(/^public/, "");
}
