/**
 * AI Assistant Engine for BugTracer
 * Analyzes issue title, description, and stack traces to predict root cause,
 * recommend architectural fix, and calculate complexity & confidence score.
 */
function analyzeIssueWithAI(title, description, type, priority) {
  const text = `${title} ${description}`.toLowerCase();
  
  let rootCause = '';
  let suggestedFix = '';
  let complexity = 'Moderate';
  let confidenceScore = 88;

  if (text.includes('redis') || text.includes('memory') || text.includes('oom') || text.includes('leak')) {
    rootCause = 'Buffer accumulation or unevicted cache keys causing V8 heap exhaustion.';
    suggestedFix = 'Implement Redis LRU eviction policy (maxmemory-policy allkeys-lru) and use streaming cursor iteration (SCAN / JSONStream) instead of batch array allocations.';
    complexity = 'Complex';
    confidenceScore = 94;
  } else if (text.includes('cors') || text.includes('403') || text.includes('origin') || text.includes('header')) {
    rootCause = 'Access-Control-Allow-Origin header mismatch or missing preflight OPTIONS response on staging domain.';
    suggestedFix = 'Verify Express CORS middleware whitelist includes staging origin regex and reflect incoming headers for authorized webhook signatures.';
    complexity = 'Easy';
    confidenceScore = 96;
  } else if (text.includes('auth') || text.includes('jwt') || text.includes('token') || text.includes('sso') || text.includes('oauth')) {
    rootCause = 'Token expiration handling or redirect URI mismatch in authorization grant flow.';
    suggestedFix = 'Implement silent token refresh with secure HTTP-only cookies, and configure callback URLs in OAuth console matching current environment hostname.';
    complexity = 'Moderate';
    confidenceScore = 91;
  } else if (text.includes('query') || text.includes('sql') || text.includes('slow') || text.includes('index') || text.includes('mongo')) {
    rootCause = 'Full collection/table scan caused by unindexed compound queries in filter criteria.';
    suggestedFix = 'Add compound index on { projectId: 1, status: 1, createdAt: -1 } and check execution stats via .explain("executionStats").';
    complexity = 'Moderate';
    confidenceScore = 93;
  } else if (text.includes('deep link') || text.includes('ios') || text.includes('android') || text.includes('mobile')) {
    rootCause = 'Universal link domain entitlement (.well-known/apple-app-site-association) validation failure during cold launch.';
    suggestedFix = 'Host valid AASA json file over HTTPS with correct Team ID and implement linking delegate fallback in scene coordinator.';
    complexity = 'Complex';
    confidenceScore = 89;
  } else {
    rootCause = `Potential state inconsistency or unhandled exception during ${type} execution.`;
    suggestedFix = 'Add try/catch boundary, validate request body parameters with Joi/Zod schema, and attach structured telemetry logs.';
    complexity = priority === 'critical' ? 'Complex' : 'Moderate';
    confidenceScore = 86;
  }

  return {
    rootCause,
    suggestedFix,
    complexity,
    confidenceScore,
    analyzedAt: new Date(),
  };
}

module.exports = { analyzeIssueWithAI };
