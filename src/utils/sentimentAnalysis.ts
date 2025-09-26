// Simple sentiment analysis based on keyword matching
// In production, you could integrate with services like OpenAI, Google Cloud Natural Language, etc.

const positiveWords = [
  'great', 'excellent', 'amazing', 'fantastic', 'wonderful', 'awesome', 'good', 'best', 
  'love', 'perfect', 'outstanding', 'brilliant', 'superb', 'impressive', 'satisfied',
  'happy', 'pleased', 'delighted', 'thrilled', 'excited', 'appreciate', 'recommend',
  'flexible', 'supportive', 'helpful', 'friendly', 'professional', 'innovative',
  'growth', 'opportunity', 'learning', 'development', 'balance', 'benefits'
];

const negativeWords = [
  'terrible', 'awful', 'bad', 'horrible', 'worst', 'hate', 'disappointing', 'poor',
  'frustrating', 'annoying', 'useless', 'broken', 'failed', 'failure', 'problem',
  'issue', 'concerned', 'worried', 'stressed', 'overworked', 'toxic', 'unfair',
  'discrimination', 'harassment', 'layoffs', 'fired', 'quit', 'leaving',
  'micromanagement', 'underpaid', 'overtime', 'burnout', 'politics'
];

export function analyzeSentiment(text: string): 'positive' | 'negative' | 'neutral' {
  const lowercaseText = text.toLowerCase();
  
  let positiveScore = 0;
  let negativeScore = 0;
  
  // Count positive words
  positiveWords.forEach(word => {
    const regex = new RegExp(`\\b${word}\\b`, 'g');
    const matches = lowercaseText.match(regex);
    if (matches) {
      positiveScore += matches.length;
    }
  });
  
  // Count negative words
  negativeWords.forEach(word => {
    const regex = new RegExp(`\\b${word}\\b`, 'g');
    const matches = lowercaseText.match(regex);
    if (matches) {
      negativeScore += matches.length;
    }
  });
  
  // Determine sentiment based on score difference
  const scoreDifference = positiveScore - negativeScore;
  
  if (scoreDifference > 1) return 'positive';
  if (scoreDifference < -1) return 'negative';
  return 'neutral';
}