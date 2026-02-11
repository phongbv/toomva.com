import { SubtitleEntry } from "@/domain/types";


export function parseSubtitles(rawString: string): SubtitleEntry[] {
  // Split by double newlines and filter out empty strings
  const blocks = rawString.trim().split(/\n\s*\n/);
  
  return blocks.reduce((acc: SubtitleEntry[], block) => {
    const lines = block.split(/\r?\n/).map(l => l.trim());
    
    // Find the timestamp line (e.g., 00:00:35,116 --> 00:00:37,452)
    const timeLineIndex = lines.findIndex(line => line.includes('-->'));
    
    if (timeLineIndex !== -1) {
      const [startStr, endStr] = lines[timeLineIndex].split('-->').map(s => s.trim());
      
      // Text is everything after the timestamp line
      const text = lines.slice(timeLineIndex + 1).join('\n');

      acc.push({
        index: acc.length + 1, // Sequential index starting at 1
        startTime: convertToSeconds(startStr),
        endTime: convertToSeconds(endStr),
        text: text
      });
    }
    
    return acc;
  }, []);
}

function convertToSeconds(timeStr: string): number {
  // Normalizes both 00:00:00.000 and 00:00:00,000
  const normalized = timeStr.replace(',', '.');
  const parts = normalized.split(':');
  
  let hours = 0, minutes = 0, seconds = 0;

  if (parts.length === 3) {
    [hours, minutes, seconds] = parts.map(parseFloat);
  } else {
    [minutes, seconds] = parts.map(parseFloat);
  }

  return Number(((hours * 3600) + (minutes * 60) + seconds).toFixed(3));
}