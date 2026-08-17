import { ValidatedSource } from './SourceProcessor';

export function formatFinalResponse(
  rawAiAnswer: string,
  sources: ValidatedSource[],
  isOffTopic: boolean,
  offTopicReason?: string
): { formattedAnswer: string; sources: Array<{ title: string; url: string }> } {
  if (isOffTopic && offTopicReason) {
    return {
      formattedAnswer: offTopicReason,
      sources: [],
    };
  }

  let formattedAnswer = rawAiAnswer.trim();

  // Validate sources array
  const validSources = sources.filter(s => s.url && s.title);

  if (validSources.length > 0 && !formattedAnswer.includes('### Sources') && !formattedAnswer.includes('🌐 **Open Source Reference')) {
    formattedAnswer += '\n\n### Sources\n';
    validSources.forEach((src, idx) => {
      formattedAnswer += `${idx + 1}. [${src.title}](${src.url})\n`;
    });
  }

  return {
    formattedAnswer,
    sources: validSources.map(s => ({ title: s.title, url: s.url })),
  };
}
