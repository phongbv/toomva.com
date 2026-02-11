import {
  CreateVideoInput,
  SubtitleEntry,
} from "@/domain/types";
import { parseSubtitles } from "./vttUtil";

export default async function ExtractVideo(
  url: string,
): Promise<CreateVideoInput> {
  const pageContent = await (await fetch(url)).text();

  // Extract title from og:title meta tag
  const titleMatch = pageContent.match(
    /<meta\s+property="og:title"\s+content="([^"]*)"/i,
  );
  const title = titleMatch ? titleMatch[1] : "Untitled Video";

  // Extract video URL from video tag with id="video"
  const videoMatch = pageContent.match(
    /<video[^>]*id=["']video["'][^>]*>[\s\S]*?<source[^>]*src=["']([^"']*)["']/i,
  );
  const videoUrl = videoMatch ? videoMatch[1] : "";

  // Extract subtitle paths from JavaScript variables
  const enPathMatch = pageContent.match(/var\s+enpath\s*=\s*['"]([^'"]+)['"]/);
  const viPathMatch = pageContent.match(/\s+vipath\s*=\s*['"]([^'"]+)['"]/);

  const enSubtitlePath = enPathMatch ? enPathMatch[1] : "";
  const viSubtitlePath = viPathMatch ? viPathMatch[1] : "";

  // Fetch and parse subtitles
  const baseUrl = new URL(url).origin;
  const englishSubtitles = enSubtitlePath
    ? await fetchAndParseSubtitle(`${baseUrl}${enSubtitlePath}`)
    : [];
  const vietnameseSubtitles = viSubtitlePath
    ? await fetchAndParseSubtitle(`${baseUrl}${viSubtitlePath}`)
    : [];

  // Merge subtitles into dual format
  return {
    webUrl: url,
    title,
    videoUrl: videoUrl.startsWith("http") ? videoUrl : `${baseUrl}${videoUrl}`,
    subtitles: {
      english: englishSubtitles,
      vietnamese: vietnameseSubtitles,
    },
  };
}

async function fetchAndParseSubtitle(url: string): Promise<SubtitleEntry[]> {
  try {
    const response = await fetch(url);
    const vttContent = await response.text();
    return parseSubtitles(vttContent);
  } catch (error) {
    console.error(`Error fetching subtitle from ${url}:`, error);
    return [];
  }
}
