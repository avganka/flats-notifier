export function getLargestImageFromSrcset(srcset: string | undefined) {
  if (!srcset) {
    return '';
  }
  const sources = srcset.split(',');

  const parsedSources = sources.map((source) => {
    const [url, sizeStr] = source.trim().split(' ');
    const size = parseInt(sizeStr.replace('w', ''), 10);
    return { url, size };
  });

  const sortedSources = parsedSources.sort((a, b) => b.size - a.size);

  return sortedSources[0].url;
}

export function formatPrice(price: string, currency: string): string {
  if (!/^\d+$/.test(price)) {
    return price;
  }
  const reversedPrice = price.split('').reverse().join('');
  const formattedPrice = reversedPrice.replace(/(\d{3})(?=\d)/g, '$1 ');
  return formattedPrice.split('').reverse().join('') + ` ${currency}`;
}
