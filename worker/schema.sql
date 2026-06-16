CREATE TABLE IF NOT EXISTS ai_context_cache (
  id TEXT PRIMARY KEY,
  cache_key TEXT NOT NULL,
  schema_version TEXT NOT NULL,
  response_json TEXT NOT NULL,

  category TEXT,
  brand TEXT,
  model_family TEXT,
  condition TEXT,
  currency TEXT,
  price_band TEXT,
  confidence REAL,
  valid_until TEXT,
  freshness_status TEXT DEFAULT 'fresh',

  hit_count INTEGER DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_ai_context_cache_key ON ai_context_cache(cache_key);
CREATE INDEX IF NOT EXISTS idx_ai_context_cache_lookup ON ai_context_cache(category, brand, model_family, condition, currency, price_band);

CREATE TABLE IF NOT EXISTS purchase_events (
  id TEXT PRIMARY KEY,
  anonymous_user_id TEXT NOT NULL,
  temptation_thread_id TEXT,
  created_at TEXT NOT NULL,

  item_raw TEXT,
  normalized_item TEXT,
  price REAL,
  currency TEXT,

  budget REAL,
  impulse_level INTEGER,
  is_deal_price INTEGER,
  is_returnable INTEGER,
  uses_value REAL,
  uses_period TEXT,
  keep_value REAL,
  keep_period TEXT,
  duplicate_level INTEGER,

  ai_context_id TEXT,
  verdict TEXT,
  score REAL,
  user_action TEXT,
  dirty_status TEXT DEFAULT 'clean',
  dirty_reason TEXT,

  event_json TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_purchase_events_user_time ON purchase_events(anonymous_user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_purchase_events_thread ON purchase_events(temptation_thread_id);

CREATE TABLE IF NOT EXISTS temptation_threads (
  id TEXT PRIMARY KEY,
  anonymous_user_id TEXT NOT NULL,
  item_cluster TEXT NOT NULL,
  first_seen_at TEXT NOT NULL,
  last_seen_at TEXT NOT NULL,
  check_count INTEGER DEFAULT 0,
  negotiation_count INTEGER DEFAULT 0,
  final_action TEXT,
  summary_json TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_temptation_threads_user_cluster ON temptation_threads(anonymous_user_id, item_cluster);

CREATE TABLE IF NOT EXISTS user_profiles (
  anonymous_user_id TEXT PRIMARY KEY,
  schema_version TEXT NOT NULL,
  profile_json TEXT NOT NULL,

  spend_style TEXT,
  decision_pattern TEXT,
  deal_sensitivity TEXT,
  return_awareness TEXT,
  brand_affinity TEXT,
  price_comfort_zone TEXT,
  regret_risk TEXT,
  persuadability TEXT,
  confidence REAL,

  updated_at TEXT NOT NULL
);
