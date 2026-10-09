import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkStringify from "remark-stringify";
import { visit } from "unist-util-visit";
import { readSync, writeSync } from "to-vfile";

main().catch(console.error);

async function main() {
  const file = await unified()
    .use(remarkParse)
    .use(plugin)
    .use(remarkStringify)
    .process(readSync("./src/content/issues/19-1263486.md"));
  console.log("writing file");
  writeSync(file);
}

function plugin() {
  return async (tree) => {
    const queue = [];

    visit(tree, (node) => {
      if (node.type === "link") {
        const text = node.children[0].value;
        const original = new URL(node.url);
        if (original.host === "click.revue.email") {
          queue.push({ node, text, original });
        }
      }
    });

    await queue.reduce(async (prev, { node, text, original }) => {
      await prev;
      console.log("\r\n >>>> processing", text, original.toString());
      const response = await race(fetch(original), `${text}`);
      if (!response.ok) {
        console.error(`Failed to process url for`, text);
        return;
      }
      const url = new URL(response.url);
      url.searchParams.delete("utm_source");
      url.searchParams.delete("utm_campaign");
      url.searchParams.delete("utm_medium");
      console.log("]]] Fixed", text, " => into =>", url.toString(), "\r\n");

      // node.children[0].value = url.host.replace("www.", "");
      node.url = url.toString();
    }, Promise.resolve());
  };
}

function race(p, of) {
  return Promise.race([
    p,
    new Promise((_, reject) =>
      setTimeout(reject, 6000, new Error(`Rejection by timeout: ${of}`))
    ),
  ]);
}
