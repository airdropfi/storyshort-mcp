/**
 * API key resolution: `--api-key` wins, then STORYSHORT_API_KEY, then the
 * legacy AUTOSHORT_API_KEY (this server was forked from AutoShort's and only
 * read the old name, so a config setting STORYSHORT_API_KEY could not start).
 */
export function resolveApiKey(argv: string[], env: Record<string, string | undefined> = process.env): string {
  let apiKey = env.STORYSHORT_API_KEY || env.AUTOSHORT_API_KEY || '';
  const flag = argv.indexOf('--api-key');
  if (flag >= 0 && argv[flag + 1]) apiKey = argv[flag + 1];
  return apiKey;
}
