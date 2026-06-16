const SCHEMA_VERSION = "1.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body, null, 2), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });
}

function priceBand(price) {
  if (price <= 0) return "unknown";
  if (price < 50) return "0-50";
  if (price < 250) return "50-250";
  if (price < 1000) return "250-1000";
  if (price < 2500) return "1000-2500";
  if (price < 5000) return "2500-5000";
  return "5000-plus";
}

function mockAnalyze({ item, price, currency }) {
  const rawItem = String(item || "").trim();
  const normalizedItem = rawItem.toLowerCase();
  const numericPrice = Number(price) || 0;
  const selectedCurrency = currency || "USD";
  const hasHermes = /\bherm[eè]s\b/.test(normalizedItem);
  const hasHerbag = normalizedItem.includes("herbag");
  const hasBag = normalizedItem.includes("bag") || normalizedItem.includes("purse") || normalizedItem.includes("handbag");
  const hasUsed = /\b(used|pre[- ]owned|secondhand|vintage)\b/.test(normalizedItem);
  const hasNew = /\b(new|brand new)\b/.test(normalizedItem);
  const condition = hasUsed ? "used" : hasNew ? "new" : "unknown";

  if (hasHermes || hasHerbag) {
    const specificity = hasHerbag
      ? condition === "unknown"
        ? "brand_model"
        : "brand_model_condition"
      : hasBag
        ? "brand_category"
        : "brand_only";

    return {
      schema_version: SCHEMA_VERSION,
      normalized_item: normalizedItem,
      original_item: rawItem,
      currency: selectedCurrency,
      price: numericPrice,
      item_context: {
        specificity,
        category: "luxury_bag",
        subcategory: hasBag || hasHerbag ? "handbag" : "unknown",
        brand: "Hermes",
        model_family: hasHerbag ? "Herbag" : "unknown",
        model_variant: normalizedItem.includes("zip 31") ? "Zip 31" : "unknown",
        condition,
        market_segment: "luxury_resale",
      },
      market_context: {
        reference_frame: hasHerbag ? "model_resale_market" : "brand_category",
        price_position: hasHerbag && numericPrice >= 2500 && numericPrice <= 3800 ? "typical" : "unknown",
        confidence: hasHerbag ? 0.66 : 0.48,
        summary: hasHerbag
          ? "This may be plausible for a Hermes Herbag, but condition, seller, and authentication decide whether it is actually good."
          : "This may be low for some Hermes bags, but Hermes prices vary heavily by model.",
      },
      missing_factors: hasHerbag
        ? ["condition details", "authentication", "seller reputation", "return policy", "included accessories"]
        : ["model", "condition", "authentication", "seller reputation", "return policy"],
      risk: {
        level: "high",
        reasons: ["authenticity-sensitive", "condition can change value sharply", "resale prices vary by model"],
        checks: ["authentication", "clear photos", "date stamp", "seller reputation", "return policy"],
      },
      decision_influence: {
        score_shift: hasHerbag ? 2 : 0,
        should_force_inspection: false,
        should_ask_followup: true,
        followup_question: hasHerbag
          ? "What condition is it in, and is it authenticated?"
          : "Which Hermes model is it, and is it new or used?",
      },
      cache_key: {
        category: "luxury_bag",
        brand: "hermes",
        model_family: hasHerbag ? "herbag" : "unknown",
        condition,
        currency: selectedCurrency,
        price_band: priceBand(numericPrice),
      },
      validity: {
        region: "US",
        valid_until_days: 60,
        needs_refresh: false,
      },
      cat_note: "The cat recognizes Hermes energy, but wants the exact model and authentication before celebrating.",
      source: "worker_mock",
    };
  }

  return {
    schema_version: SCHEMA_VERSION,
    normalized_item: normalizedItem,
    original_item: rawItem,
    currency: selectedCurrency,
    price: numericPrice,
    item_context: {
      specificity: hasBag ? "generic_category" : "unclear",
      category: hasBag ? "bag" : "unknown",
      subcategory: "unknown",
      brand: "unknown",
      model_family: "unknown",
      model_variant: "unknown",
      condition: "unknown",
      market_segment: "unknown",
    },
    market_context: {
      reference_frame: hasBag ? "general_category" : "cannot_assess",
      price_position: "unknown",
      confidence: hasBag ? 0.42 : 0.28,
      summary: "The mock worker needs a real AI call before it can make reliable market claims.",
    },
    missing_factors: ["brand", "model", "condition", "seller", "return policy"],
    risk: {
      level: hasBag ? "medium" : "unknown",
      reasons: ["details are incomplete"],
      checks: ["specific product name", "condition", "return policy"],
    },
    decision_influence: {
      score_shift: 0,
      should_force_inspection: false,
      should_ask_followup: true,
      followup_question: "What brand, model, and condition is it?",
    },
    cache_key: {
      category: hasBag ? "bag" : "unknown",
      brand: "unknown",
      model_family: "unknown",
      condition: "unknown",
      currency: selectedCurrency,
      price_band: priceBand(numericPrice),
    },
    validity: {
      region: "US",
      valid_until_days: 30,
      needs_refresh: false,
    },
    cat_note: "The cat needs a sharper product name before making market claims.",
    source: "worker_mock",
  };
}

export default {
  async fetch(request) {
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    const url = new URL(request.url);
    if (url.pathname !== "/analyze") {
      return jsonResponse({ error: "Not found" }, 404);
    }

    if (request.method !== "POST") {
      return jsonResponse({ error: "Method not allowed" }, 405);
    }

    const payload = await request.json();
    if (!payload.item) {
      return jsonResponse({ error: "item is required" }, 400);
    }

    return jsonResponse(mockAnalyze(payload));
  },
};
