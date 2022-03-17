import marked from 'marked';

// &#63; to ? helper
function htmlEscapeToText(text: string) {
  return text.replace(/&#[0-9]*;|&amp;/g, (escapeCode) => {
    if (escapeCode.match(/amp/)) {
      return '&';
    }

    const match = escapeCode.match(/[0-9]+/);
    if (!match) {
      return '';
    }
    // eslint-disable-next-line radix
    return String.fromCharCode(parseInt(match[0]));
  });
}

// return a custom renderer for marked.
// eslint-disable-next-line import/prefer-default-export
export function renderPlain() {
  const render = new marked.Renderer<string>();

  // render just the text of a link
  render.link = (href, title, text) => text;
  render.strong = (text) => text;
  render.blockquote = (text) => text;

  // render just the text of a paragraph
  render.paragraph = (text) => `${htmlEscapeToText(text)}\r\n`;

  // render just the text of a heading element
  render.heading = (text) => text;

  // render nothing for images
  render.image = () => '';

  return render;
}
