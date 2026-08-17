export interface QuestionClassification {
  isOffTopic: boolean;
  offTopicReason?: string;
  needsWebSearch: boolean;
  searchQuery: string;
  questionType: 'DEFINITION' | 'SIMPLE' | 'DETAILED' | 'COMPARISON' | 'PROGRAMMING' | 'DEBUGGING' | 'NUMERICAL' | 'FORMULA' | 'EXAM' | 'QUIZ' | 'GENERAL';
  targetTopic: string;
}

export function classifyQuestion(
  question: string,
  courseName: string,
  currentTopic: string = '',
  historyText: string = ''
): QuestionClassification {
  const q = question.toLowerCase().trim();

  // 1. Off-Topic Check
  const offTopicKeywords = ['cricket', 'football', 'soccer', 'movie', 'celebrity', 'recipe', 'song', 'weather', 'stock market', 'who won'];
  const isExplicitOffTopic = offTopicKeywords.some(w => q.includes(w));
  
  if (isExplicitOffTopic) {
    return {
      isOffTopic: true,
      offTopicReason: `This question appears to be outside your current **${courseName}** course. You can select another course from the top menu or ask an educational question related to **${courseName}**!`,
      needsWebSearch: false,
      searchQuery: '',
      questionType: 'GENERAL',
      targetTopic: courseName,
    };
  }

  // 2. Identify Question Type
  let questionType: QuestionClassification['questionType'] = 'GENERAL';

  if (q.includes('vs') || q.includes('difference between') || q.includes('compare')) {
    questionType = 'COMPARISON';
  } else if (q.includes('write') || q.includes('code') || q.includes('program') || q.includes('implement')) {
    questionType = 'PROGRAMMING';
  } else if (q.includes('error') || q.includes('debug') || q.includes('not working') || q.includes('fix')) {
    questionType = 'DEBUGGING';
  } else if (q.includes('calculate') || q.includes('solve') || q.includes('find the') || q.includes('efficiency when')) {
    questionType = 'NUMERICAL';
  } else if (q.includes('formula') || q.includes('equation')) {
    questionType = 'FORMULA';
  } else if (q.includes('2 mark') || q.includes('8 mark') || q.includes('16 mark') || q.includes('exam')) {
    questionType = 'EXAM';
  } else if (q.includes('quiz') || q.includes('mcq') || q.includes('test')) {
    questionType = 'QUIZ';
  } else if (q.includes('in simple words') || q.includes('like a beginner') || q.includes('simply')) {
    questionType = 'SIMPLE';
  } else if (q.includes('in detail') || q.includes('detailed') || q.includes('explain how')) {
    questionType = 'DETAILED';
  } else if (q.includes('what is') || q.includes('define') || q.includes('explain')) {
    questionType = 'DEFINITION';
  }

  // 3. Determine if Web Search is Needed
  const isFollowUp = (q.startsWith('its ') || q.startsWith('give an example') || q.startsWith('give example') || q.startsWith('what about')) && historyText.length > 0;
  const needsWebSearch = !isFollowUp && questionType !== 'QUIZ';

  // 4. Construct Search Query
  let cleanQuery = question
    .replace(/what is a?/gi, '')
    .replace(/explain/gi, '')
    .replace(/in simple words/gi, '')
    .replace(/for beginners/gi, '')
    .replace(/can you tell me about/gi, '')
    .trim();

  const searchQuery = `${courseName} ${cleanQuery} ${currentTopic}`.trim();

  return {
    isOffTopic: false,
    needsWebSearch,
    searchQuery,
    questionType,
    targetTopic: cleanQuery || courseName,
  };
}
