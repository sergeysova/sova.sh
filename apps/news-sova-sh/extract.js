// EML converter https://www.webatic.com/quoted-printable-convertor

function getMarkdownLike() {
  const list = Array.from(document.querySelectorAll(".link-title")).map(
    (l) => ({
      title: l,
      descr: l.nextElementSibling,
      link: l.nextElementSibling.nextElementSibling.getElementsByTagName(
        "a"
      )[0],
      inlineLinks: Array.from(l.nextElementSibling.getElementsByTagName("a")),
    })
  );

  list.forEach((item) => {
    const links = Array.from(item.descr.getElementsByTagName("a"));
    links.forEach((link) => {
      link.parentElement.replaceChild(
        document.createTextNode(`[${link.innerText}](${link.href})`),
        link
      );
    });
  });

  const md = list
    .map((e) =>
      [
        `## ${e.title.innerText}`,
        e.descr.innerText,
        `[${e.link.innerText}](${e.link.href})`,
      ].join("\r\n\r\n")
    )
    .join("\r\n\r\n");

  return md;
}

document.addEventListener("click", () =>
  navigator.clipboard.writeText(getMarkdownLike())
);
