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
