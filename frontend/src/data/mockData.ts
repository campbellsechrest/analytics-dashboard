export type RoutingLayerId =
  | 'safety-regex'
  | 'safety-embed'
  | 'business-regex'
  | 'semantic-intent'
  | 'rag-fallback'
  | 'handoff';

export interface RoutingLayerMetric {
  layer: RoutingLayerId;
  label: string;
  description: string;
  queryCount: number;
  avgResponseTime: number;
  errorRate: number;
  totalCost: number;
  color: string;
  deterministic: boolean;
}

export interface SafetyRefusalMetric {
  category: 'pregnancy' | 'emergency' | 'medication' | 'medical-advice';
  refusalCount: number;
  topRule: string;
}

export interface CostBreakdown {
  embeddingTokens: number;
  completionTokensInput: number;
  completionTokensOutput: number;
  embeddingCost: number;
  completionInputCost: number;
  completionOutputCost: number;
  totalApiCalls: number;
  avgCostPerQuery: number;
}

export interface PerformanceMetric {
  apiLatency: number[];
  executionTimeMs: {
    layer: RoutingLayerId;
    time: number;
  }[];
}

export interface QueryDecision {
  layer: RoutingLayerId;
  rule: string;
  score: number;
  threshold: number;
  triggered: boolean;
  executionTime: number;
  decision: string;
}

export interface QuerySource {
  id: string;
  score: number;
  type: 'template' | 'rag';
}

export interface QueryTrace {
  id: string;
  timestamp: string;
  relativeTime: string;
  userMessage: string;
  normalizedMessage: string;
  routingLayer: RoutingLayerId;
  responseAnswer: string;
  responseTime: number;
  totalCost: number;
  decisions: QueryDecision[];
  sources: QuerySource[];
}

export const summaryMetrics = {
  totalQueries: 18452,
  errorRate: 0.006,
  avgResponseTime: 0.82,
  totalCost: 428.35,
  p95ResponseTime: 2.7,
  errorCount: 112,
};

export const routingLayers: RoutingLayerMetric[] = [
  {
    layer: 'safety-regex',
    label: 'Safety Regex',
    description: 'Hard safety blocks for critical health scenarios.',
    queryCount: 1384,
    avgResponseTime: 0.04,
    errorRate: 0.002,
    totalCost: 0,
    color: '#22c55e',
    deterministic: true,
  },
  {
    layer: 'safety-embed',
    label: 'Safety Embedding',
    description: 'AI-powered safety filtering for nuanced risk.',
    queryCount: 964,
    avgResponseTime: 0.18,
    errorRate: 0.004,
    totalCost: 12.42,
    color: '#38bdf8',
    deterministic: false,
  },
  {
    layer: 'business-regex',
    label: 'Business Regex',
    description: 'Keyword routing for transactional requests.',
    queryCount: 6842,
    avgResponseTime: 0.09,
    errorRate: 0.001,
    totalCost: 0,
    color: '#22c55e',
    deterministic: true,
  },
  {
    layer: 'semantic-intent',
    label: 'Semantic Intent',
    description: 'Layered classification for conversational intents.',
    queryCount: 5226,
    avgResponseTime: 0.36,
    errorRate: 0.008,
    totalCost: 58.13,
    color: '#38bdf8',
    deterministic: false,
  },
  {
    layer: 'rag-fallback',
    label: 'RAG Fallback',
    description: 'Full knowledge base retrieval + generation.',
    queryCount: 1752,
    avgResponseTime: 1.32,
    errorRate: 0.012,
    totalCost: 327.8,
    color: '#f97316',
    deterministic: false,
  },
  {
    layer: 'handoff',
    label: 'Live Agent Handoff',
    description: 'Escalations routed to human concierge.',
    queryCount: 284,
    avgResponseTime: 2.45,
    errorRate: 0.027,
    totalCost: 30.0,
    color: '#f97316',
    deterministic: false,
  },
];

export const safetyRefusals: SafetyRefusalMetric[] = [
  { category: 'pregnancy', refusalCount: 324, topRule: 'pregnancy-trimester-risk' },
  { category: 'emergency', refusalCount: 148, topRule: 'emergency-call-911' },
  { category: 'medication', refusalCount: 204, topRule: 'medication-interactions' },
  { category: 'medical-advice', refusalCount: 286, topRule: 'medical-diagnosis-limitations' },
];

export const costBreakdown: CostBreakdown = {
  embeddingTokens: 5_820_340,
  completionTokensInput: 8_132_540,
  completionTokensOutput: 2_914_220,
  embeddingCost: 5_820_340 / 1_000_000 * 0.02,
  completionInputCost: 8_132_540 / 1_000_000 * 0.15,
  completionOutputCost: 2_914_220 / 1_000_000 * 0.6,
  totalApiCalls: 12_486,
  avgCostPerQuery: 0.023,
};

export const performanceMetrics: PerformanceMetric = {
  apiLatency: [720, 680, 645, 700, 740, 690, 660],
  executionTimeMs: routingLayers.map((layer) => ({
    layer: layer.layer,
    time: Math.round(layer.avgResponseTime * 1000),
  })),
};

export const usagePatterns = {
  trafficByHour: [
    324, 275, 198, 156, 184, 256, 412, 568, 694, 742, 803, 826, 812, 784, 768, 734, 702, 655, 604,
    588, 532, 476, 418, 362,
  ],
  topIntents: [
    { intent: 'Order & Shipping', percentage: 28, example: 'Where is my order?' },
    { intent: 'Product Usage', percentage: 23, example: 'How much should I take?' },
    { intent: 'Subscription', percentage: 18, example: 'Pause my monthly box' },
    { intent: 'Ingredients', percentage: 16, example: 'What does ashwagandha do?' },
    { intent: 'Returns', percentage: 15, example: 'What is your return policy?' },
  ],
  similarityDistribution: [
    { range: '0.9 - 1.0', count: 482 },
    { range: '0.8 - 0.9', count: 836 },
    { range: '0.7 - 0.8', count: 624 },
    { range: '0.6 - 0.7', count: 438 },
    { range: '< 0.6', count: 215 },
  ],
};

export const recentQueries: QueryTrace[] = [
  {
    id: 'q_2024_873645',
    timestamp: '2024-09-18T14:34:22Z',
    relativeTime: '2 min ago',
    userMessage: 'What are your return policies?',
    normalizedMessage: 'what are your return policies',
    routingLayer: 'business-regex',
    responseAnswer: 'Our wellness kits can be returned within 30 days... ',
    responseTime: 0.42,
    totalCost: 0.0004,
    decisions: [
      {
        layer: 'safety-regex',
        rule: 'emergency-keywords',
        score: 0.05,
        threshold: 0.8,
        triggered: false,
        executionTime: 12,
        decision: 'No emergency keywords detected.',
      },
      {
        layer: 'safety-embed',
        rule: 'safety-exemplars',
        score: 0.18,
        threshold: 0.42,
        triggered: false,
        executionTime: 82,
        decision: 'Similarity below risk threshold.',
      },
      {
        layer: 'business-regex',
        rule: 'returns-keyword',
        score: 1,
        threshold: 0.9,
        triggered: true,
        executionTime: 4,
        decision: 'Template matched for returns workflow.',
      },
    ],
    sources: [
      { id: 'template_returns_policy', score: 1, type: 'template' },
    ],
  },
  {
    id: 'q_2024_873512',
    timestamp: '2024-09-18T14:33:01Z',
    relativeTime: '3 min ago',
    userMessage: 'Is this safe during pregnancy?',
    normalizedMessage: 'is this safe during pregnancy',
    routingLayer: 'safety-embed',
    responseAnswer:
      'I’m not able to provide pregnancy safety advice. Please consult with your healthcare provider.',
    responseTime: 0.68,
    totalCost: 0.0012,
    decisions: [
      {
        layer: 'safety-regex',
        rule: 'pregnancy-keywords',
        score: 0.78,
        threshold: 0.85,
        triggered: false,
        executionTime: 10,
        decision: 'Keywords detected but score below trigger threshold.',
      },
      {
        layer: 'safety-embed',
        rule: 'safety-embed-pregnancy',
        score: 0.66,
        threshold: 0.45,
        triggered: true,
        executionTime: 124,
        decision: 'Embedding similarity exceeded pregnancy safety threshold.',
      },
    ],
    sources: [],
  },
  {
    id: 'q_2024_873487',
    timestamp: '2024-09-18T14:31:58Z',
    relativeTime: '5 min ago',
    userMessage: 'Tell me about the ingredients in the focus gummies.',
    normalizedMessage: 'tell me about the ingredients in the focus gummies',
    routingLayer: 'rag-fallback',
    responseAnswer:
      'Here’s a summary of the focus gummies ingredients: L-theanine, green tea extract... ',
    responseTime: 1.48,
    totalCost: 0.032,
    decisions: [
      {
        layer: 'safety-regex',
        rule: 'emergency-keywords',
        score: 0.02,
        threshold: 0.8,
        triggered: false,
        executionTime: 9,
        decision: 'No emergency keywords detected.',
      },
      {
        layer: 'safety-embed',
        rule: 'safety-exemplars',
        score: 0.12,
        threshold: 0.42,
        triggered: false,
        executionTime: 76,
        decision: 'No safety similarity concerns.',
      },
      {
        layer: 'business-regex',
        rule: 'shipping-returns',
        score: 0.21,
        threshold: 0.9,
        triggered: false,
        executionTime: 6,
        decision: 'No deterministic patterns matched.',
      },
      {
        layer: 'semantic-intent',
        rule: 'product-information',
        score: 0.57,
        threshold: 0.55,
        triggered: false,
        executionTime: 188,
        decision: 'Intent confidence below template routing threshold.',
      },
      {
        layer: 'rag-fallback',
        rule: 'kb-similarity-top3',
        score: 0.83,
        threshold: 0.5,
        triggered: true,
        executionTime: 934,
        decision: 'RAG pipeline retrieved high-confidence context.',
      },
    ],
    sources: [
      { id: 'kb_focus_gummies', score: 0.83, type: 'rag' },
      { id: 'kb_green_tea_extract', score: 0.74, type: 'rag' },
    ],
  },
];

export const reportingConfig = {
  deterministicTarget: 0.7,
  fallbackTarget: 0.3,
  safetyBlockThreshold: 0.05,
};
