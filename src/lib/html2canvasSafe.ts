import html2canvas, { Options } from 'html2canvas';

/**
 * Iteratively replace unsupported modern CSS color functions (oklab, oklch, lab, lch, color-mix, light-dark)
 * with safe hex fallback values.
 */
function sanitizeColorFunctions(cssText: string): string {
  if (!cssText) return cssText;
  
  const colorFunctions = ['oklab', 'oklch', 'color-mix', 'light-dark', 'lab', 'lch'];
  let result = cssText;

  for (const fn of colorFunctions) {
    const regex = new RegExp(fn + '\\b', 'gi');
    let match;
    while ((match = regex.exec(result)) !== null) {
      const startIndex = match.index;
      let parenCount = 0;
      let endIndex = startIndex + fn.length;
      
      // Find the first '(' skipping spaces if any
      while (endIndex < result.length && result[endIndex] !== '(' && /\s/.test(result[endIndex])) {
        endIndex++;
      }
      
      if (endIndex < result.length && result[endIndex] === '(') {
        parenCount = 1;
        endIndex++;
        while (endIndex < result.length && parenCount > 0) {
          if (result[endIndex] === '(') parenCount++;
          else if (result[endIndex] === ')') parenCount--;
          endIndex++;
        }
        
        if (parenCount === 0) {
          result = result.substring(0, startIndex) + '#888888' + result.substring(endIndex);
          regex.lastIndex = startIndex + 7;
        } else {
           break;
        }
      } else {
         regex.lastIndex = endIndex;
      }
    }
  }
  return result;
}

/**
 * Safe wrapper around html2canvas that sanitizes CSS rules containing 'oklab', 'oklch', etc.
 * color functions before html2canvas parses the DOM.
 */
export async function safeHtml2Canvas(element: HTMLElement, options: Partial<Options> = {}): Promise<HTMLCanvasElement> {
  const userOnClone = options.onclone;

  return html2canvas(element, {
    ...options,
    onclone: (clonedDoc, clonedElement) => {
      try {
        // 1. Sanitize all <style> elements
        const styleTags = clonedDoc.querySelectorAll('style');
        styleTags.forEach((style) => {
          if (style.innerHTML) {
            style.innerHTML = sanitizeColorFunctions(style.innerHTML);
          }
        });

        // 2. Sanitize all elements with inline style attributes
        const elementsWithInlineStyle = clonedDoc.querySelectorAll('[style]');
        elementsWithInlineStyle.forEach((el) => {
          const styleAttr = el.getAttribute('style');
          if (styleAttr) {
            el.setAttribute('style', sanitizeColorFunctions(styleAttr));
          }
        });
      } catch (err) {
        console.warn('[safeHtml2Canvas] Error sanitizing color styles:', err);
      }

      if (userOnClone) {
        userOnClone(clonedDoc, clonedElement);
      }
    }
  });
}

export default safeHtml2Canvas;
