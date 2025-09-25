import { useMemo, useState } from 'react';
import {
  costBreakdown,
  performanceMetrics,
  recentQueries,
  reportingConfig,
  routingLayers,
  safetyRefusals,
  summaryMetrics,
  usagePatterns,
} from './data/mockData';
import type { QueryTrace, RoutingLayerMetric } from './data/mockData';
import './App.css';

type LayerGroup = 'deterministic' | 'ai' | 'fallback';

const layerGroupMap: Record<string, LayerGroup> = {
  'safety-regex': 'deterministic',
  'business-regex': 'deterministic',
  'safety-embed': 'ai',
  'semantic-intent': 'ai',
  'rag-fallback': 'fallback',
  handoff: 'fallback',
};

const layerIcons: Record<string, string> = {
  'safety-regex': '🛡️',
  'safety-embed': '🧠',
  'business-regex': '🏷️',
  'semantic-intent': '🎯',
  'rag-fallback': '📚',
  handoff: '🤝',
};

const layerGroupLabels: Record<LayerGroup, string> = {
  deterministic: 'Deterministic Layer',
  ai: 'AI-Powered Layer',
  fallback: 'Fallback Layer',
};

const formatTime = (seconds: number) => `${seconds.toFixed(2)}s`;
const formatCurrency = (value: number) => `$${value.toFixed(2)}`;
const formatCount = (value: number) => value.toLocaleString();

const totalQueries = summaryMetrics.totalQueries;
const deterministicQueries = routingLayers
  .filter((layer) => layer.deterministic)
  .reduce((sum, layer) => sum + layer.queryCount, 0);
const ragFallbackLayer = routingLayers.find((layer) => layer.layer === 'rag-fallback');
const fallbackQueries = ragFallbackLayer?.queryCount ?? 0;
const safetyBlocks = safetyRefusals.reduce((sum, item) => sum + item.refusalCount, 0);

const successRate = 1 - summaryMetrics.errorRate;
const deterministicRate = deterministicQueries / totalQueries;
const fallbackRate = fallbackQueries / totalQueries;
const safetyBlockRate = safetyBlocks / totalQueries;

const queryLayerColor = (layer: RoutingLayerMetric) => {
  switch (layerGroupMap[layer.layer]) {
    case 'deterministic':
      return 'var(--deterministic)';
    case 'ai':
      return 'var(--ai-powered)';
    default:
      return 'var(--fallback)';
  }
};

const badgeClassForLayer = (layerId: string) => {
  const group = layerGroupMap[layerId] ?? 'fallback';
  return `layer-badge layer-${group}`;
};

function QueryDetail({ query }: { query: QueryTrace }) {
  return (
    <div className="query-detail">
      <div className="query-detail__header">
        <div>
          <h4>{query.id}</h4>
          <p className="query-detail__timestamp">🕐 {new Date(query.timestamp).toLocaleString()}</p>
        </div>
        <div className="query-detail__meta">
          <span className={badgeClassForLayer(query.routingLayer)}>{layerGroupLabels[layerGroupMap[query.routingLayer]]}</span>
          <span className="query-detail__cost">{formatCurrency(query.totalCost)}</span>
        </div>
      </div>
      <div className="query-detail__body">
        <div>
          <h5>📝 Original Text</h5>
          <p className="query-detail__text">{query.userMessage}</p>
        </div>
        <div>
          <h5>🔧 Normalized Text</h5>
          <p className="query-detail__text">{query.normalizedMessage}</p>
        </div>
        <div>
          <h5>💬 Final Response</h5>
          <p className="query-detail__text">{query.responseAnswer}</p>
        </div>
      </div>
      <div className="query-detail__decisions">
        <h5>🎯 Routing Decision Trace</h5>
        <div className="decision-grid">
          {query.decisions.map((decision) => (
            <div key={`${query.id}-${decision.layer}`} className="decision-card">
              <div className="decision-card__header">
                <span className={badgeClassForLayer(decision.layer)}>
                  {layerIcons[decision.layer]} {layerGroupLabels[layerGroupMap[decision.layer]]}
                </span>
                <span className={`decision-card__result ${decision.triggered ? 'triggered' : 'passed'}`}>
                  {decision.triggered ? '✅ STOP' : '➡️ CONTINUE'}
                </span>
              </div>
              <p className="decision-card__rule">Rule: {decision.rule}</p>
              <div className="decision-card__progress">
                <div className="decision-card__progress-bar">
                  <div
                    className="decision-card__progress-fill"
                    style={{
                      width: `${Math.min(decision.score, 1) * 100}%`,
                      backgroundColor: decision.triggered ? 'var(--fallback)' : 'var(--ai-powered)',
                    }}
                  />
                  <span
                    className="decision-card__threshold"
                    style={{ left: `${decision.threshold * 100}%` }}
                    aria-hidden
                  />
                </div>
                <div className="decision-card__stats">
                  <span>Score {(decision.score * 100).toFixed(0)}%</span>
                  <span>Threshold {(decision.threshold * 100).toFixed(0)}%</span>
                  <span>{decision.executionTime}ms</span>
                </div>
              </div>
              <p className="decision-card__detail">{decision.decision}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="query-detail__sources">
        <h5>📚 Response Sources</h5>
        {query.sources.length === 0 ? (
          <p className="query-detail__text">No external knowledge used.</p>
        ) : (
          <div className="source-grid">
            {query.sources.map((source) => (
              <div key={source.id} className="source-card">
                <span className={badgeClassForLayer(source.type === 'template' ? 'business-regex' : 'rag-fallback')}>
                  {source.type === 'template' ? 'Template' : 'RAG'}
                </span>
                <strong>{source.id}</strong>
                <span>Relevance {(source.score * 100).toFixed(0)}%</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function App() {
  const [selectedQueryId, setSelectedQueryId] = useState(recentQueries[0]?.id ?? '');
  const selectedQuery = useMemo(
    () => recentQueries.find((query) => query.id === selectedQueryId) ?? recentQueries[0],
    [selectedQueryId]
  );

  return (
    <div className="app">
      <header className="app__header">
        <div>
          <h1>IM Concierge Analytics Dashboard</h1>
          <p>Layered intent routing performance overview</p>
        </div>
        <div className="app__header-controls">
          <div className="pill">Production</div>
          <div className="time-range">
            <button className="time-range__option active">Last 24h</button>
            <button className="time-range__option">7 days</button>
            <button className="time-range__option">30 days</button>
          </div>
          <span className="last-updated">Updated {new Date().toLocaleTimeString()}</span>
        </div>
      </header>

      <section className="kpi-grid">
        <div className="metric-card metric-card--primary">
          <span className="metric-card__label">Total Queries</span>
          <strong className="metric-card__value">{formatCount(summaryMetrics.totalQueries)}</strong>
          <span className="metric-card__sublabel">All interactions this period</span>
        </div>
        <div className="metric-card metric-card--success">
          <span className="metric-card__label">Success Rate</span>
          <strong className="metric-card__value">{(successRate * 100).toFixed(1)}%</strong>
          <span className="metric-card__sublabel">Error rate {(summaryMetrics.errorRate * 100).toFixed(2)}%</span>
        </div>
        <div className="metric-card metric-card--neutral">
          <span className="metric-card__label">Avg Response Time</span>
          <strong className="metric-card__value">{formatTime(summaryMetrics.avgResponseTime)}</strong>
          <span className="metric-card__sublabel">p95 {formatTime(summaryMetrics.p95ResponseTime)}</span>
        </div>
        <div className="metric-card metric-card--warning">
          <span className="metric-card__label">Operating Cost</span>
          <strong className="metric-card__value">{formatCurrency(summaryMetrics.totalCost)}</strong>
          <span className="metric-card__sublabel">${costBreakdown.avgCostPerQuery.toFixed(3)} per query</span>
        </div>
      </section>

      <section className="dashboard-section">
        <div className="section-heading">
          <h2>Intent Router Performance</h2>
          <p>Distribution and health of all routing layers</p>
        </div>
        <div className="router-grid">
          <div className="panel">
            <h3>Routing Layer Distribution</h3>
            <p className="panel__subtitle">Flow of queries through the six-layer router</p>
            <div className="layer-list">
              {routingLayers.map((layer) => (
                <div key={layer.layer} className="layer-row">
                  <div className="layer-row__info">
                    <span className={badgeClassForLayer(layer.layer)}>
                      {layerIcons[layer.layer]} {layer.label}
                    </span>
                    <span className="layer-row__description">{layer.description}</span>
                  </div>
                  <div className="layer-row__bar">
                    <div
                      className="layer-row__bar-fill"
                      style={{ width: `${(layer.queryCount / totalQueries) * 100}%`, backgroundColor: queryLayerColor(layer) }}
                    />
                  </div>
                  <div className="layer-row__value">
                    <strong>{formatCount(layer.queryCount)}</strong>
                    <span>{((layer.queryCount / totalQueries) * 100).toFixed(1)}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="panel">
            <h3>Layer Performance Benchmarks</h3>
            <div className="benchmark-grid">
              {routingLayers.map((layer) => (
                <div key={`${layer.layer}-metrics`} className="benchmark-card">
                  <span className={badgeClassForLayer(layer.layer)}>{layer.label}</span>
                  <div className="benchmark-card__values">
                    <div>
                      <label>Avg Response</label>
                      <strong>{formatTime(layer.avgResponseTime)}</strong>
                    </div>
                    <div>
                      <label>Error Rate</label>
                      <strong>{(layer.errorRate * 100).toFixed(2)}%</strong>
                    </div>
                    <div>
                      <label>Layer Cost</label>
                      <strong>{formatCurrency(layer.totalCost)}</strong>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="panel panel--horizontal">
          <div>
            <h3>Router Efficiency</h3>
            <div className="stat-row">
              <div className="stat-card">
                <span>Deterministic Resolution Rate</span>
                <strong>{(deterministicRate * 100).toFixed(1)}%</strong>
                <small>Target &gt; {reportingConfig.deterministicTarget * 100}%</small>
              </div>
              <div className="stat-card">
                <span>AI Fallback Rate</span>
                <strong>{(fallbackRate * 100).toFixed(1)}%</strong>
                <small>Target &lt; {reportingConfig.fallbackTarget * 100}%</small>
              </div>
              <div className="stat-card">
                <span>RAG Contribution to Cost</span>
                <strong>{formatCurrency(ragFallbackLayer?.totalCost ?? 0)}</strong>
                <small>Most expensive layer</small>
              </div>
            </div>
          </div>
          <div className="stat-row">
            <div className="stat-card">
              <span>Total Deterministic Queries</span>
              <strong>{formatCount(deterministicQueries)}</strong>
              <small>Safety + business regex layers</small>
            </div>
            <div className="stat-card">
              <span>Fallback Escalations</span>
              <strong>{formatCount(fallbackQueries)}</strong>
              <small>Full knowledge base searches</small>
            </div>
            <div className="stat-card">
              <span>Live Agent Handoffs</span>
              <strong>
                {formatCount(routingLayers.find((layer) => layer.layer === 'handoff')?.queryCount ?? 0)}
              </strong>
              <small>Human escalations required</small>
            </div>
          </div>
        </div>
      </section>

      <section className="dashboard-section">
        <div className="section-heading">
          <h2>Safety &amp; Compliance Monitoring</h2>
          <p>FDA/DSHEA aligned refusal trends</p>
        </div>
        <div className="panel">
          <div className="safety-grid">
            <div>
              <h3>Safety Refusals by Category</h3>
              <div className="refusal-list">
                {safetyRefusals.map((item) => (
                  <div key={item.category} className="refusal-row">
                    <div className="refusal-row__label">
                      <span className="refusal-row__badge">{item.category}</span>
                      <span>{item.topRule}</span>
                    </div>
                    <div className="refusal-row__bar">
                      <div
                        className="refusal-row__bar-fill"
                        style={{ width: `${(item.refusalCount / safetyBlocks) * 100}%` }}
                      />
                    </div>
                    <div className="refusal-row__value">
                      <strong>{formatCount(item.refusalCount)}</strong>
                      <span>{((item.refusalCount / safetyBlocks) * 100).toFixed(1)}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="safety-summary">
              <div className="metric-card metric-card--alert">
                <span className="metric-card__label">Safety Block Rate</span>
                <strong className="metric-card__value">{(safetyBlockRate * 100).toFixed(2)}%</strong>
                <span className="metric-card__sublabel">
                  Alert if &gt; {reportingConfig.safetyBlockThreshold * 100}%
                </span>
              </div>
              <div className="metric-card metric-card--neutral">
                <span className="metric-card__label">Total Safety Refusals</span>
                <strong className="metric-card__value">{formatCount(safetyBlocks)}</strong>
                <span className="metric-card__sublabel">Triggered across all layers</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="dashboard-section">
        <div className="section-heading">
          <h2>Cost Analysis &amp; Optimization</h2>
          <p>Breakdown of OpenAI API utilization</p>
        </div>
        <div className="panel">
          <div className="cost-grid">
            <div className="cost-card">
              <h3>Embedding Costs</h3>
              <p>
                Tokens {formatCount(costBreakdown.embeddingTokens)} → {formatCurrency(costBreakdown.embeddingCost)}
              </p>
            </div>
            <div className="cost-card">
              <h3>Completion Input Costs</h3>
              <p>
                Tokens {formatCount(costBreakdown.completionTokensInput)} →{' '}
                {formatCurrency(costBreakdown.completionInputCost)}
              </p>
            </div>
            <div className="cost-card">
              <h3>Completion Output Costs</h3>
              <p>
                Tokens {formatCount(costBreakdown.completionTokensOutput)} →{' '}
                {formatCurrency(costBreakdown.completionOutputCost)}
              </p>
            </div>
            <div className="cost-card">
              <h3>API Call Volume</h3>
              <p>
                {formatCount(costBreakdown.totalApiCalls)} calls · {formatCurrency(costBreakdown.avgCostPerQuery)} per query
              </p>
            </div>
          </div>
          <div className="cost-insights">
            <div className="stat-card">
              <span>Avg Embedding Tokens / Query</span>
              <strong>{Math.round(costBreakdown.embeddingTokens / totalQueries).toLocaleString()}</strong>
              <small>Monitor for retrieval efficiency</small>
            </div>
            <div className="stat-card">
              <span>Most Expensive Layer</span>
              <strong>RAG Fallback</strong>
              <small>{formatCurrency(ragFallbackLayer?.totalCost ?? 0)}</small>
            </div>
            <div className="stat-card">
              <span>Deterministic Savings</span>
              <strong>{formatCount(deterministicQueries)}</strong>
              <small>Queries handled without LLM cost</small>
            </div>
          </div>
        </div>
      </section>

      <section className="dashboard-section">
        <div className="section-heading">
          <h2>Performance &amp; Reliability</h2>
          <p>Latency and SLA tracking</p>
        </div>
        <div className="panel">
          <div className="performance-grid">
            <div className="metric-card metric-card--neutral">
              <span className="metric-card__label">p95 Response Time</span>
              <strong className="metric-card__value">{formatTime(summaryMetrics.p95ResponseTime)}</strong>
              <span className="metric-card__sublabel">Target &lt; 3s</span>
            </div>
            <div className="metric-card metric-card--neutral">
              <span className="metric-card__label">System Errors</span>
              <strong className="metric-card__value">{formatCount(summaryMetrics.errorCount)}</strong>
              <span className="metric-card__sublabel">Investigate recurring failures</span>
            </div>
            <div className="latency-card">
              <h3>OpenAI API Latency (ms)</h3>
              <div className="latency-bars">
                {performanceMetrics.apiLatency.map((latency, index) => (
                  <div key={index} className="latency-bar">
                    <div className="latency-bar__fill" style={{ height: `${latency / 8}px` }} />
                    <span>{latency}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="performance-table">
              <h3>Layer Processing Time</h3>
              <ul>
                {performanceMetrics.executionTimeMs.map((entry) => (
                  <li key={entry.layer}>
                    <span className={badgeClassForLayer(entry.layer)}>{layerIcons[entry.layer]} {entry.layer}</span>
                    <span>{entry.time}ms</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="dashboard-section">
        <div className="section-heading">
          <h2>Per-Query Trace View</h2>
          <p>Drill-down debugging for individual interactions</p>
        </div>
        <div className="panel">
          <div className="query-panel">
            <div className="query-list">
              <div className="query-list__header">
                <h3>Recent Queries</h3>
                <div className="query-list__actions">
                  <input type="search" placeholder="Search queries" />
                  <button type="button">Filter</button>
                </div>
              </div>
              <div className="query-items">
                {recentQueries.map((query) => (
                  <button
                    key={query.id}
                    className={`query-item ${selectedQuery?.id === query.id ? 'active' : ''}`}
                    type="button"
                    onClick={() => setSelectedQueryId(query.id)}
                  >
                    <span className="query-item__time">⏰ {query.relativeTime}</span>
                    <span className={`query-item__layer ${badgeClassForLayer(query.routingLayer)}`}>
                      {layerIcons[query.routingLayer]} {query.routingLayer.replace('-', ' ')}
                    </span>
                    <span className="query-item__text">“{query.userMessage}”</span>
                    <span className="query-item__meta">{Math.round(query.responseTime * 1000)}ms</span>
                  </button>
                ))}
              </div>
            </div>
            {selectedQuery && <QueryDetail query={selectedQuery} />}
          </div>
        </div>
      </section>

      <section className="dashboard-section">
        <div className="section-heading">
          <h2>Usage Patterns &amp; Intelligence</h2>
          <p>Understand when and why members reach out</p>
        </div>
        <div className="panel">
          <div className="usage-grid">
            <div className="usage-card">
              <h3>Traffic by Hour</h3>
              <div className="traffic-bars">
                {usagePatterns.trafficByHour.map((value, hour) => (
                  <div key={hour} className="traffic-bar">
                    <div className="traffic-bar__fill" style={{ height: `${(value / Math.max(...usagePatterns.trafficByHour)) * 120}px` }} />
                    <span>{hour}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="usage-card">
              <h3>Top Question Types</h3>
              <ul className="intent-list">
                {usagePatterns.topIntents.map((intent) => (
                  <li key={intent.intent}>
                    <div className="intent-list__header">
                      <strong>{intent.intent}</strong>
                      <span>{intent.percentage}%</span>
                    </div>
                    <p>Example: {intent.example}</p>
                  </li>
                ))}
              </ul>
            </div>
            <div className="usage-card">
              <h3>Knowledge Match Quality</h3>
              <ul className="distribution-list">
                {usagePatterns.similarityDistribution.map((bucket) => (
                  <li key={bucket.range}>
                    <span>{bucket.range}</span>
                    <div className="distribution-bar">
                      <div
                        className="distribution-bar__fill"
                        style={{ width: `${(bucket.count / Math.max(...usagePatterns.similarityDistribution.map((item) => item.count))) * 100}%` }}
                      />
                    </div>
                    <span>{bucket.count}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default App;
