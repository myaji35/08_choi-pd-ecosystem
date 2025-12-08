/**
 * AI Utilities for Epic 16
 * - Content recommendation engine
 * - AI content generation (SNS posts, emails, etc.)
 * - Chatbot and FAQ matching
 * - Content quality analysis
 * - Image auto-tagging
 * - Vector embeddings for semantic search
 */

import { db } from './db';
import {
  aiRecommendations,
  contentEmbeddings,
  chatbotConversations,
  aiGeneratedContent,
  contentQualityScores,
  imageAutoTags,
  faqKnowledgeBase,
  userActivityPatterns,
  distributorResources,
  courses,
  posts,
  type NewAiRecommendation,
  type NewContentEmbedding,
  type NewChatbotConversation,
  type NewAiGeneratedContent,
  type NewContentQualityScore,
  type NewImageAutoTag,
  type NewUserActivityPattern
} from './db/schema';
import { eq, desc, and, gte, sql } from 'drizzle-orm';

// ============================================================
// Configuration
// ============================================================

const AI_CONFIG = {
  OPENAI_API_KEY: process.env.OPENAI_API_KEY || '',
  ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY || '',
  DEFAULT_MODEL: 'gpt-4',
  EMBEDDING_MODEL: 'text-embedding-ada-002',
  DEFAULT_TEMPERATURE: 0.7,
  MAX_TOKENS: 1000,
  RECOMMENDATION_LIMIT: 10,
  SIMILARITY_THRESHOLD: 0.7
};

// ============================================================
// 1. Content Recommendations
// ============================================================

/**
 * Generate personalized recommendations for a user
 */
export async function generateRecommendations(params: {
  userId: string;
  userType: 'distributor' | 'pd' | 'customer';
  recommendationType: 'resource' | 'course' | 'post' | 'distributor';
  limit?: number;
}) {
  const { userId, userType, recommendationType, limit = AI_CONFIG.RECOMMENDATION_LIMIT } = params;

  // Get user activity pattern
  const [activityPattern] = await db
    .select()
    .from(userActivityPatterns)
    .where(eq(userActivityPatterns.userId, userId));

  if (!activityPattern) {
    // Return popular items if no activity pattern exists
    return await getPopularRecommendations(recommendationType, limit);
  }

  const preferredCategories = activityPattern.preferredCategories
    ? JSON.parse(activityPattern.preferredCategories)
    : [];

  // Get content based on preferred categories
  const recommendations: NewAiRecommendation[] = [];
  let targetItems: any[] = [];

  if (recommendationType === 'resource') {
    targetItems = await db.select().from(distributorResources).limit(limit * 2);
  } else if (recommendationType === 'course') {
    targetItems = await db.select().from(courses).where(eq(courses.published, true)).limit(limit * 2);
  } else if (recommendationType === 'post') {
    targetItems = await db.select().from(posts).where(eq(posts.published, true)).limit(limit * 2);
  }

  // Score and rank items
  for (const item of targetItems) {
    const score = calculateRecommendationScore(item, activityPattern);

    recommendations.push({
      userId,
      userType,
      recommendationType,
      targetId: item.id,
      score,
      reason: JSON.stringify(['활동 패턴 일치', '선호 카테고리']),
      metadata: JSON.stringify({
        engagement_score: activityPattern.engagementScore,
        category_match: true
      }),
      clicked: false
    });
  }

  // Sort by score and limit
  recommendations.sort((a, b) => b.score - a.score);
  const topRecommendations = recommendations.slice(0, limit);

  // Save recommendations to database
  if (topRecommendations.length > 0) {
    await db.insert(aiRecommendations).values(topRecommendations);
  }

  return topRecommendations;
}

/**
 * Calculate recommendation score based on user activity
 */
function calculateRecommendationScore(item: any, activityPattern: any): number {
  let score = 50; // Base score

  // Increase score based on engagement
  if (activityPattern.engagementScore) {
    score += activityPattern.engagementScore * 0.3;
  }

  // Add randomness to avoid filter bubble
  score += Math.random() * 10;

  return Math.min(100, Math.round(score));
}

/**
 * Get popular recommendations when no user data is available
 */
async function getPopularRecommendations(
  type: 'resource' | 'course' | 'post' | 'distributor',
  limit: number
) {
  // This would typically query items with high download/view counts
  // For now, return recent items
  if (type === 'resource') {
    return await db.select().from(distributorResources).orderBy(desc(distributorResources.downloadCount)).limit(limit);
  } else if (type === 'course') {
    return await db.select().from(courses).where(eq(courses.published, true)).limit(limit);
  }
  return [];
}

// ============================================================
// 2. AI Content Generation
// ============================================================

export interface GenerateContentParams {
  contentType: 'sns_post' | 'email' | 'description' | 'summary' | 'tag';
  prompt: string;
  userId: string;
  userType: 'distributor' | 'pd' | 'admin';
  model?: string;
  temperature?: number;
  maxTokens?: number;
  metadata?: Record<string, any>;
}

/**
 * Generate content using AI (GPT-4 or Claude)
 */
export async function generateContent(params: GenerateContentParams): Promise<string> {
  const {
    contentType,
    prompt,
    userId,
    userType,
    model = AI_CONFIG.DEFAULT_MODEL,
    temperature = AI_CONFIG.DEFAULT_TEMPERATURE,
    maxTokens = AI_CONFIG.MAX_TOKENS,
    metadata = {}
  } = params;

  try {
    // Call OpenAI or Anthropic API
    const generatedText = await callAIModel({
      model,
      prompt,
      temperature,
      maxTokens
    });

    // Save to database
    await db.insert(aiGeneratedContent).values({
      contentType,
      prompt,
      generatedText,
      model,
      temperature: Math.round(temperature * 100),
      maxTokens,
      userId,
      userType,
      status: 'draft',
      metadata: JSON.stringify(metadata)
    });

    return generatedText;
  } catch (error: any) {
    console.error('AI content generation error:', error);
    throw new Error(`Failed to generate content: ${error.message}`);
  }
}

/**
 * Generate SNS post draft
 */
export async function generateSnsPost(params: {
  topic: string;
  platform: 'facebook' | 'instagram' | 'twitter' | 'linkedin';
  tone?: 'professional' | 'casual' | 'enthusiastic';
  userId: string;
  userType: 'distributor' | 'pd' | 'admin';
}): Promise<string> {
  const { topic, platform, tone = 'professional', userId, userType } = params;

  const prompt = `당신은 소셜 미디어 마케팅 전문가입니다. 다음 주제로 ${platform}에 게시할 게시물을 작성해주세요.

주제: ${topic}
톤: ${tone}
플랫폼: ${platform}

요구사항:
- ${platform === 'twitter' ? '280자 이내' : '간결하고 매력적인 내용'}
- ${platform === 'instagram' ? '해시태그 5개 포함' : ''}
- 이모지 적절히 활용
- 행동 유도 문구(CTA) 포함

게시물:`;

  return await generateContent({
    contentType: 'sns_post',
    prompt,
    userId,
    userType,
    temperature: 0.8,
    metadata: { platform, topic, tone }
  });
}

/**
 * Generate email draft
 */
export async function generateEmail(params: {
  purpose: string;
  recipient: string;
  tone?: 'formal' | 'friendly';
  userId: string;
  userType: 'distributor' | 'pd' | 'admin';
}): Promise<string> {
  const { purpose, recipient, tone = 'formal', userId, userType } = params;

  const prompt = `다음 조건으로 이메일을 작성해주세요:

목적: ${purpose}
수신자: ${recipient}
톤: ${tone}

이메일 형식:
- 제목
- 본문
- 서명

이메일:`;

  return await generateContent({
    contentType: 'email',
    prompt,
    userId,
    userType,
    metadata: { purpose, recipient, tone }
  });
}

// ============================================================
// 3. Chatbot and FAQ
// ============================================================

/**
 * Process chatbot message and find matching FAQ
 */
export async function processChatMessage(params: {
  message: string;
  sessionId: string;
  userId?: string;
  userType: 'distributor' | 'pd' | 'customer' | 'anonymous';
}): Promise<{ response: string; matchedFaqId?: number; confidence: number }> {
  const { message, sessionId, userId, userType } = params;

  // Save user message
  await db.insert(chatbotConversations).values({
    sessionId,
    userId: userId || null,
    userType,
    role: 'user',
    message
  });

  // Search FAQ knowledge base
  const faqs = await db.select().from(faqKnowledgeBase).where(eq(faqKnowledgeBase.isActive, true));

  let bestMatch: any = null;
  let bestScore = 0;

  for (const faq of faqs) {
    const keywords = JSON.parse(faq.keywords);
    const score = calculateFaqMatchScore(message, keywords, faq.question);

    if (score > bestScore) {
      bestScore = score;
      bestMatch = faq;
    }
  }

  let response: string;
  let matchedFaqId: number | undefined;
  let confidence: number;

  if (bestMatch && bestScore > 0.6) {
    // High confidence match
    response = bestMatch.answer;
    matchedFaqId = bestMatch.id;
    confidence = bestScore;

    // Update match count
    await db
      .update(faqKnowledgeBase)
      .set({ matchCount: sql`${faqKnowledgeBase.matchCount} + 1` })
      .where(eq(faqKnowledgeBase.id, bestMatch.id));
  } else {
    // No good match - use AI to generate response
    response = await generateChatbotResponse(message, sessionId);
    confidence = 0.5;
  }

  // Save assistant response
  await db.insert(chatbotConversations).values({
    sessionId,
    userId: userId || null,
    userType,
    role: 'assistant',
    message: response,
    intent: matchedFaqId ? 'faq' : 'general',
    metadata: JSON.stringify({
      confidence,
      matched_faq_id: matchedFaqId || null
    })
  });

  return { response, matchedFaqId, confidence };
}

/**
 * Calculate FAQ matching score
 */
function calculateFaqMatchScore(userMessage: string, keywords: string[], question: string): number {
  const messageLower = userMessage.toLowerCase();
  let score = 0;

  // Check keyword matches
  for (const keyword of keywords) {
    if (messageLower.includes(keyword.toLowerCase())) {
      score += 0.3;
    }
  }

  // Check question similarity (simple word overlap)
  const questionWords = question.toLowerCase().split(/\s+/);
  const messageWords = messageLower.split(/\s+/);
  const overlap = questionWords.filter(word => messageWords.includes(word)).length;
  score += (overlap / questionWords.length) * 0.7;

  return Math.min(1, score);
}

/**
 * Generate chatbot response using AI
 */
async function generateChatbotResponse(message: string, sessionId: string): Promise<string> {
  // Get conversation history
  const history = await db
    .select()
    .from(chatbotConversations)
    .where(eq(chatbotConversations.sessionId, sessionId))
    .orderBy(chatbotConversations.createdAt)
    .limit(10);

  const conversationContext = history
    .map(msg => `${msg.role === 'user' ? '사용자' : '어시스턴트'}: ${msg.message}`)
    .join('\n');

  const prompt = `당신은 imPD 플랫폼의 고객 지원 챗봇입니다. 친절하고 정확하게 답변해주세요.

대화 내역:
${conversationContext}

사용자: ${message}
어시스턴트:`;

  try {
    return await callAIModel({
      model: 'gpt-4',
      prompt,
      temperature: 0.7,
      maxTokens: 300
    });
  } catch (error) {
    return '죄송합니다. 현재 답변을 생성할 수 없습니다. 잠시 후 다시 시도해주세요.';
  }
}

// ============================================================
// 4. Content Quality Analysis
// ============================================================

/**
 * Analyze content quality using AI
 */
export async function analyzeContentQuality(params: {
  contentType: 'resource' | 'course' | 'post' | 'work';
  contentId: number;
  content: string;
  title?: string;
}): Promise<any> {
  const { contentType, contentId, content, title = '' } = params;

  const prompt = `다음 콘텐츠의 품질을 분석하고 점수를 매겨주세요:

제목: ${title}
내용: ${content}

다음 항목에 대해 0-100점으로 평가하고, JSON 형식으로 응답해주세요:
{
  "overall_score": 85,
  "readability_score": 90,
  "seo_score": 80,
  "engagement_score": 85,
  "sentiment_score": 10,
  "keyword_density": { "스마트폰": 0.05, "창업": 0.03 },
  "suggestions": ["제목에 숫자 추가", "메타 설명 개선"]
}`;

  try {
    const analysisText = await callAIModel({
      model: 'gpt-4',
      prompt,
      temperature: 0.3,
      maxTokens: 500
    });

    const analysis = JSON.parse(analysisText);

    // Save to database
    await db.insert(contentQualityScores).values({
      contentType,
      contentId,
      overallScore: analysis.overall_score,
      readabilityScore: analysis.readability_score,
      seoScore: analysis.seo_score,
      engagementScore: analysis.engagement_score,
      sentimentScore: analysis.sentiment_score,
      keywordDensity: JSON.stringify(analysis.keyword_density),
      suggestions: JSON.stringify(analysis.suggestions),
      analyzedBy: 'gpt-4'
    });

    return analysis;
  } catch (error: any) {
    console.error('Content quality analysis error:', error);
    throw new Error(`Failed to analyze content: ${error.message}`);
  }
}

// ============================================================
// 5. Vector Embeddings for Semantic Search
// ============================================================

/**
 * Generate embedding for content
 */
export async function generateEmbedding(params: {
  contentType: 'resource' | 'course' | 'post' | 'work';
  contentId: number;
  textContent: string;
  metadata?: Record<string, any>;
}): Promise<number[]> {
  const { contentType, contentId, textContent, metadata = {} } = params;

  try {
    // Call OpenAI Embeddings API
    const embedding = await callEmbeddingModel(textContent);

    // Save to database
    await db.insert(contentEmbeddings).values({
      contentType,
      contentId,
      embeddingModel: AI_CONFIG.EMBEDDING_MODEL,
      embedding: JSON.stringify(embedding),
      textContent,
      metadata: JSON.stringify(metadata)
    });

    return embedding;
  } catch (error: any) {
    console.error('Embedding generation error:', error);
    throw new Error(`Failed to generate embedding: ${error.message}`);
  }
}

/**
 * Find similar content using cosine similarity
 */
export async function findSimilarContent(params: {
  queryText: string;
  contentType?: 'resource' | 'course' | 'post' | 'work';
  limit?: number;
}): Promise<any[]> {
  const { queryText, contentType, limit = 10 } = params;

  try {
    // Generate query embedding
    const queryEmbedding = await callEmbeddingModel(queryText);

    // Get all embeddings of the specified type
    let query = db.select().from(contentEmbeddings);

    if (contentType) {
      query = query.where(eq(contentEmbeddings.contentType, contentType)) as any;
    }

    const allEmbeddings = await query;

    // Calculate cosine similarity
    const similarities = allEmbeddings.map(item => ({
      ...item,
      similarity: cosineSimilarity(queryEmbedding, JSON.parse(item.embedding))
    }));

    // Filter and sort by similarity
    return similarities
      .filter(item => item.similarity >= AI_CONFIG.SIMILARITY_THRESHOLD)
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit);
  } catch (error: any) {
    console.error('Semantic search error:', error);
    throw new Error(`Failed to find similar content: ${error.message}`);
  }
}

/**
 * Calculate cosine similarity between two vectors
 */
function cosineSimilarity(vec1: number[], vec2: number[]): number {
  const dotProduct = vec1.reduce((sum, val, i) => sum + val * vec2[i], 0);
  const mag1 = Math.sqrt(vec1.reduce((sum, val) => sum + val * val, 0));
  const mag2 = Math.sqrt(vec2.reduce((sum, val) => sum + val * val, 0));
  return dotProduct / (mag1 * mag2);
}

// ============================================================
// 6. User Activity Pattern Analysis
// ============================================================

/**
 * Update user activity pattern
 */
export async function updateUserActivityPattern(params: {
  userId: string;
  userType: 'distributor' | 'pd' | 'customer';
  activityType: string;
  metadata?: Record<string, any>;
}): Promise<void> {
  const { userId, userType, activityType, metadata = {} } = params;

  // Get or create activity pattern
  let [pattern] = await db
    .select()
    .from(userActivityPatterns)
    .where(eq(userActivityPatterns.userId, userId));

  const now = new Date();
  const currentHour = now.getHours();
  const currentDay = now.getDay();

  if (!pattern) {
    // Create new pattern
    await db.insert(userActivityPatterns).values({
      userId,
      userType,
      activeHours: JSON.stringify([currentHour]),
      activeDaysOfWeek: JSON.stringify([currentDay]),
      totalSessions: 1,
      lastActivityType: activityType,
      engagementScore: 10
    });
  } else {
    // Update existing pattern
    const activeHours = JSON.parse(pattern.activeHours || '[]');
    const activeDays = JSON.parse(pattern.activeDaysOfWeek || '[]');

    if (!activeHours.includes(currentHour)) activeHours.push(currentHour);
    if (!activeDays.includes(currentDay)) activeDays.push(currentDay);

    const newEngagementScore = Math.min(100, pattern.engagementScore + 1);

    await db
      .update(userActivityPatterns)
      .set({
        activeHours: JSON.stringify(activeHours),
        activeDaysOfWeek: JSON.stringify(activeDays),
        totalSessions: pattern.totalSessions + 1,
        lastActivityType: activityType,
        engagementScore: newEngagementScore,
        updatedAt: now
      })
      .where(eq(userActivityPatterns.userId, userId));
  }
}

// ============================================================
// AI API Integration (Placeholder - requires actual API keys)
// ============================================================

/**
 * Call AI model (OpenAI or Anthropic)
 */
async function callAIModel(params: {
  model: string;
  prompt: string;
  temperature: number;
  maxTokens: number;
}): Promise<string> {
  const { model, prompt, temperature, maxTokens } = params;

  // This is a placeholder - actual implementation requires API calls
  // For now, return a mock response
  console.log(`Calling AI model: ${model}`);
  console.log(`Prompt: ${prompt.substring(0, 100)}...`);

  // Mock response for development
  return `이것은 ${model}의 모의 응답입니다. 실제 구현 시 OpenAI 또는 Anthropic API를 호출해야 합니다.`;
}

/**
 * Call embedding model
 */
async function callEmbeddingModel(text: string): Promise<number[]> {
  // This is a placeholder - actual implementation requires OpenAI API call
  console.log(`Generating embedding for text: ${text.substring(0, 50)}...`);

  // Mock embedding (768-dimensional vector)
  return Array(768).fill(0).map(() => Math.random());
}

// ============================================================
// Export all functions
// ============================================================

export default {
  generateRecommendations,
  generateContent,
  generateSnsPost,
  generateEmail,
  processChatMessage,
  analyzeContentQuality,
  generateEmbedding,
  findSimilarContent,
  updateUserActivityPattern
};
