// Puppeteer is a transitive dependency of `md-to-pdf` (used only by
// `scripts/md-to-pdf.ts` to render the CV PDF). Downloading Chrome +
// chrome-headless-shell on every `pnpm install` is unnecessary for
// normal dev/build and a common source of install failures (network
// hiccups, stale cache). Skip it; run `npx puppeteer browsers install
// chrome` once if you actually need to regenerate the CV PDF locally.
module.exports = {
  skipDownload: true,
};
