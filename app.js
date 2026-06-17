const form = document.querySelector("#judge-form");
const calculator = document.querySelector(".calculator");
const mood = document.querySelector("#mood");
const impulse = document.querySelector("#impulse");
const impulseLabel = document.querySelector("#impulse-label");
const verdict = document.querySelector("#verdict");
const reason = document.querySelector("#reason");
const budgetBite = document.querySelector("#budget-bite");
const costUse = document.querySelector("#cost-use");
const catScore = document.querySelector("#cat-score");
const contextCard = document.querySelector("#context-card");
const contextTitle = document.querySelector("#context-title");
const contextPrice = document.querySelector("#context-price");
const contextRisk = document.querySelector("#context-risk");
const contextChecks = document.querySelector("#context-checks");
const aiContextButton = document.querySelector("#ai-context-button");
const aiCard = document.querySelector("#ai-card");
const aiTitle = document.querySelector("#ai-title");
const aiSummary = document.querySelector("#ai-summary");
const aiSpecificity = document.querySelector("#ai-specificity");
const aiReference = document.querySelector("#ai-reference");
const aiRisk = document.querySelector("#ai-risk");
const aiMissing = document.querySelector("#ai-missing");
const rebelButton = document.querySelector("#rebel-button");
const listenButton = document.querySelector("#listen-button");
const scratchAttack = document.querySelector("#scratch-attack");
const happyRun = document.querySelector("#happy-run");
const negotiation = document.querySelector("#negotiation");
const detailFields = document.querySelector("#detail-fields");
const catPersona = document.querySelector("#cat-persona");
const personaNote = document.querySelector("#persona-note");
const careMood = document.querySelector("#care-mood");
const careNote = document.querySelector("#care-note");
const treatJar = document.querySelector("#treat-jar");
const careTrustValue = document.querySelector("#care-trust-value");
const careCozyValue = document.querySelector("#care-cozy-value");
const careStressValue = document.querySelector("#care-stress-value");
const careTrustBar = document.querySelector("#care-trust-bar");
const careCozyBar = document.querySelector("#care-cozy-bar");
const careStressBar = document.querySelector("#care-stress-bar");
const appTabs = document.querySelectorAll("[data-view-target]");
const appViews = document.querySelectorAll(".app-view");
const catRoomStage = document.querySelector("#cat-room-stage");
const petZone = document.querySelector("#pet-zone");
const roomCatTitle = document.querySelector("#room-cat-title");
const roomCatBadge = document.querySelector("#room-cat-badge");
const roomCatLine = document.querySelector("#room-cat-line");
const historyList = document.querySelector("#history-list");
const clearHistory = document.querySelector("#clear-history");
const feedbackButtons = document.querySelectorAll("[data-feedback]");
const soundToggle = document.querySelector("#sound-toggle");
const soundToggleLabel = document.querySelector("#sound-toggle-label");
const currencySelect = document.querySelector("#currency");
const currencyPrefixes = document.querySelectorAll("[data-currency-prefix]");

const STORAGE_KEY = "purrmission-history";
const CARE_KEY = "purrmission-cat-care";
const SOUND_KEY = "purrmission-muted";
const CURRENCY_KEY = "purrmission-currency";
const REAL_PURR_SRC = "assets/cat-purr.mp3";
const AI_SCHEMA_VERSION = "1.0";

let purrAudio;
let purrTimer;
let audioContext;
let isMuted = localStorage.getItem(SOUND_KEY) === "true";

let currentDecision = {
  item: "this",
  price: 0,
  budget: 0,
  uses: 0,
  score: 0,
  budgetRatio: 0,
  verdict: "Purrhaps wait",
  currency: "USD",
  feedback: [],
  id: null,
  hasNamedItem: false,
};

const currencySymbols = {
  USD: "$",
  EUR: "€",
  GBP: "£",
  CAD: "C$",
  AUD: "A$",
  JPY: "¥",
  CNY: "¥",
};

const usdPerCurrency = {
  USD: 1,
  EUR: 1.08,
  GBP: 1.27,
  CAD: 0.73,
  AUD: 0.66,
  JPY: 0.0064,
  CNY: 0.14,
};

const priceBenchmarks = [
  {
    label: "a house",
    category: "Real estate",
    keywords: ["house", "home", "condo", "apartment", "flat", "townhouse"],
    riskLevel: "High",
    typicalUsd: 300000,
    checks: ["ownership", "legal status", "taxes", "repairs", "fees"],
  },
  {
    label: "a car",
    category: "Vehicle",
    keywords: ["car", "vehicle", "truck", "suv", "tesla", "honda", "toyota", "bmw"],
    riskLevel: "High",
    typicalUsd: 25000,
    checks: ["title", "accident history", "repairs", "insurance", "fees"],
  },
  {
    label: "a laptop",
    category: "Electronics",
    keywords: ["laptop", "macbook", "computer", "pc"],
    riskLevel: "Medium",
    typicalUsd: 1200,
    checks: ["condition", "warranty", "return policy"],
  },
  {
    label: "a phone",
    category: "Electronics",
    keywords: ["phone", "iphone", "android", "pixel", "samsung"],
    riskLevel: "Medium",
    typicalUsd: 900,
    checks: ["condition", "storage", "carrier lock", "return policy"],
  },
  {
    label: "headphones",
    category: "Audio",
    keywords: ["headphone", "headphones", "airpods", "earbuds"],
    riskLevel: "Low",
    typicalUsd: 180,
    checks: ["return policy", "warranty"],
  },
  {
    label: "a handbag",
    category: "Bag",
    keywords: ["bag", "handbag", "purse", "tote", "wallet"],
    riskLevel: "Medium",
    typicalUsd: 350,
    checks: ["authenticity", "condition", "return policy"],
  },
  {
    label: "shoes",
    category: "Shoes",
    keywords: ["shoe", "shoes", "sneakers", "boots", "heels"],
    riskLevel: "Low",
    typicalUsd: 130,
    checks: ["fit", "return policy"],
  },
  {
    label: "furniture",
    category: "Furniture",
    keywords: ["sofa", "couch", "desk", "chair", "table", "bed", "mattress"],
    riskLevel: "Medium",
    typicalUsd: 600,
    checks: ["measurements", "delivery", "condition"],
  },
  {
    label: "coffee",
    category: "Drink",
    keywords: ["coffee", "latte", "matcha", "boba", "tea"],
    riskLevel: "Low",
    typicalUsd: 6,
    checks: ["frequency"],
  },
];

const categoryRules = [
  {
    category: "real_estate",
    label: "Real estate",
    keywords: ["house", "home", "condo", "apartment", "flat", "townhouse"],
    segment: "major_asset",
    typicalUsd: 300000,
    risk: "high",
    checks: ["ownership", "legal status", "taxes", "repairs", "fees"],
  },
  {
    category: "vehicle",
    label: "Vehicle",
    keywords: ["car", "vehicle", "truck", "suv", "tesla"],
    segment: "major_asset",
    typicalUsd: 25000,
    risk: "high",
    checks: ["title", "accident history", "repairs", "insurance", "fees"],
  },
  {
    category: "luxury_bag",
    label: "Luxury bag",
    keywords: ["birkin", "kelly", "herbag", "classic flap", "lady dior", "neverfull"],
    segment: "luxury_resale",
    typicalUsd: 2500,
    risk: "high",
    checks: ["authentication", "condition", "seller reputation", "return policy"],
  },
  {
    category: "electronics",
    label: "Electronics",
    keywords: ["iphone", "phone", "macbook", "laptop", "ipad", "computer", "camera", "headphones", "airpods"],
    segment: "consumer_electronics",
    typicalUsd: 900,
    risk: "medium",
    checks: ["model year", "warranty", "condition", "return policy"],
  },
  {
    category: "home_appliance",
    label: "Home appliance",
    keywords: ["dyson", "airwrap", "vacuum", "espresso machine", "mixer", "air purifier"],
    segment: "durable_goods",
    typicalUsd: 450,
    risk: "medium",
    checks: ["warranty", "condition", "return policy"],
  },
  {
    category: "bag",
    label: "Bag",
    keywords: ["bag", "handbag", "purse", "tote", "wallet"],
    segment: "fashion",
    typicalUsd: 180,
    risk: "medium",
    checks: ["condition", "material", "return policy"],
  },
  {
    category: "clothing",
    label: "Clothing",
    keywords: ["coat", "jacket", "dress", "jeans", "sweater", "shirt", "skirt"],
    segment: "fashion",
    typicalUsd: 140,
    risk: "low",
    checks: ["fit", "return policy", "care"],
  },
  {
    category: "shoes",
    label: "Shoes",
    keywords: ["shoe", "shoes", "sneakers", "boots", "heels", "loafers"],
    segment: "fashion",
    typicalUsd: 130,
    risk: "low",
    checks: ["fit", "return policy", "comfort"],
  },
  {
    category: "beauty",
    label: "Beauty",
    keywords: ["perfume", "fragrance", "makeup", "skincare", "lipstick", "serum"],
    segment: "beauty",
    typicalUsd: 80,
    risk: "low",
    checks: ["shade", "skin sensitivity", "return policy"],
  },
  {
    category: "furniture",
    label: "Furniture",
    keywords: ["sofa", "couch", "desk", "chair", "table", "bed", "mattress"],
    segment: "home",
    typicalUsd: 600,
    risk: "medium",
    checks: ["measurements", "delivery", "condition"],
  },
  {
    category: "food_drink",
    label: "Food / drink",
    keywords: ["coffee", "latte", "matcha", "boba", "tea", "dinner", "brunch"],
    segment: "consumable",
    typicalUsd: 15,
    risk: "low",
    checks: ["frequency"],
  },
];

const brandRules = [
  { brand: "Hermes", aliases: ["hermes", "hermès"], sensitivity: "high", categories: ["luxury_bag"] },
  { brand: "Chanel", aliases: ["chanel"], sensitivity: "high", categories: ["luxury_bag", "clothing"] },
  { brand: "Louis Vuitton", aliases: ["louis vuitton", "lv"], sensitivity: "high", categories: ["luxury_bag"] },
  { brand: "Dior", aliases: ["dior"], sensitivity: "high", categories: ["luxury_bag", "beauty"] },
  { brand: "Gucci", aliases: ["gucci"], sensitivity: "high", categories: ["luxury_bag", "shoes", "clothing"] },
  { brand: "Prada", aliases: ["prada"], sensitivity: "high", categories: ["luxury_bag", "shoes", "clothing"] },
  { brand: "Rolex", aliases: ["rolex"], sensitivity: "high", categories: ["watch"] },
  { brand: "Apple", aliases: ["apple", "iphone", "macbook", "ipad", "airpods"], sensitivity: "medium", categories: ["electronics"] },
  { brand: "Dyson", aliases: ["dyson"], sensitivity: "medium", categories: ["home_appliance"] },
  { brand: "Tesla", aliases: ["tesla"], sensitivity: "high", categories: ["vehicle"] },
  { brand: "Nike", aliases: ["nike"], sensitivity: "medium", categories: ["shoes", "clothing"] },
  { brand: "Sony", aliases: ["sony"], sensitivity: "medium", categories: ["electronics"] },
];

const modelRules = [
  { model: "Herbag", keywords: ["herbag"] },
  { model: "Birkin", keywords: ["birkin"] },
  { model: "Kelly", keywords: ["kelly"] },
  { model: "Classic Flap", keywords: ["classic flap"] },
  { model: "Lady Dior", keywords: ["lady dior"] },
  { model: "Neverfull", keywords: ["neverfull"] },
  { model: "iPhone", keywords: ["iphone"] },
  { model: "MacBook", keywords: ["macbook"] },
  { model: "AirPods", keywords: ["airpods"] },
  { model: "Airwrap", keywords: ["airwrap"] },
  { model: "Model 3", keywords: ["model 3"] },
  { model: "Model Y", keywords: ["model y"] },
];

const impulseNames = {
  1: "Calm",
  2: "Curious",
  3: "Medium",
  4: "Itchy paws",
  5: "Dopamine sprint",
};

const moodLines = {
  muted: [
    "muted. the cat is judging silently",
    "silent mode. the cat has withdrawn its purr",
    "no purrs, only side-eye",
    "the room is quiet, but the judgment continues",
    "purr channel closed for now",
    "the cat has switched to silent audit mode",
    "sound off. opinions remain available",
    "the cat is saving its purrs for later",
  ],
  purrOn: [
    "purr on. the cat is pleased again",
    "purrs restored. morale is improving",
    "the cat has resumed soft supervision",
    "audio tribute accepted",
    "the purr engine is back online",
    "tiny motor restored",
    "the cat is once again vibrating with authority",
    "sound on. the cat approves the ambience",
    "purr privileges reinstated",
  ],
  unnamedSave: [
    "name the thing to save this judgment",
    "the cat needs a name for the evidence file",
    "unnamed temptations vanish from cat memory",
    "the cat refuses to archive a mystery",
    "give the temptation a label first",
    "no name, no permanent paw print",
    "the case file needs a title",
    "the cat cannot remember a vague urge",
  ],
  unnamedFeedback: [
    "name the thing before teaching the cat",
    "the cat cannot learn from a mystery object",
    "label the temptation first, then the cat will study it",
    "the lesson needs a subject",
    "the cat needs receipts and nouns",
    "feedback rejected until the object has a name",
    "the cat is smart, not psychic",
    "identify the suspect purchase first",
  ],
  approved: [
    "approved, with supervision",
    "the cat allows it, but keeps the receipt",
    "soft approval. no victory lap",
    "purrmission stamped, gently",
    "the cat gives a careful nod",
    "approved, but do not get dramatic",
    "green light with whisker-level monitoring",
    "the cat permits this one",
    "a rare approving blink has occurred",
    "purrmission granted, dignity intact",
  ],
  judged: [
    "judgment has been served",
    "the cat has rendered an opinion",
    "a verdict has landed on tiny paws",
    "the council of one has spoken",
    "the cat has reviewed the temptation",
    "decision delivered with measured whiskers",
    "the purchase has been weighed",
    "the cat has completed its inspection",
    "verdict filed under tiny authority",
    "the cat has thoughts, as usual",
  ],
  budgetBreach: [
    "budget breach detected",
    "the cat saw the budget line move",
    "financial paw alarm triggered",
    "that number made the cat sit upright",
    "the budget has been scratched",
    "the cat is now close to the camera",
    "spending perimeter breached",
    "the cat is tapping the spreadsheet",
    "that price stepped over the line",
    "paw siren activated",
  ],
  regret: [
    "the cat is taking notes",
    "regret has entered the case file",
    "the cat has opened a tiny audit",
    "noted for future suspicion",
    "the cat remembers this feeling",
    "post-purchase evidence collected",
    "the regret signal has been logged",
    "the cat is updating its stare",
  ],
  memory: [
    "memory updated",
    "the cat sharpened its future judgment",
    "noted for next temptation",
    "the cat added this to the pattern map",
    "future purrmissions will be adjusted",
    "lesson stored in the tiny archive",
    "the cat has learned one more human behavior",
    "pattern recognition upgraded",
  ],
  acceptedTerms: [
    "the cat accepts your terms",
    "counter-purrposal accepted",
    "the cat grants a conditional nod",
    "terms accepted, with whisker clauses",
    "the cat allows the revised plan",
    "negotiation successful, barely",
    "the cat has permitted a narrow path",
    "conditional purrmission unlocked",
  ],
  rejectedTerms: [
    "counteroffer rejected",
    "the cat is unmoved",
    "terms declined with a slow blink",
    "the cat requests a better bargain",
    "negotiation failed the sniff test",
    "the cat remains unconvinced",
    "terms rejected by paw majority",
    "not enough improvement for purrmission",
  ],
  rebel: [
    "the cat saw that",
    "caught in 4k by the cat",
    "the cat has entered witness mode",
    "defiance detected",
    "the cat is staring directly at the receipt",
    "you have chosen the dramatic path",
    "the cat has left the group chat",
    "purchase rebellion logged",
    "the cat is filing an incident report",
  ],
  listened: [
    "excellent restraint detected",
    "the cat is sprinting with approval",
    "good human behavior logged",
    "the cat is delighted by your discipline",
    "cart avoided, dignity preserved",
    "the cat has entered celebration mode",
    "financial self-control has been witnessed",
    "the cat is doing a tiny victory lap",
  ],
  memoryWiped: [
    "memory wiped, dignity restored",
    "the slate is clean, the cat is suspicious",
    "history cleared. the cat pretends not to remember",
    "records gone, instincts remain",
    "the cat has shredded the tiny file",
    "fresh start granted with narrowed eyes",
    "archive cleared, judgment retained",
    "the cat forgot nothing emotionally",
  ],
};

const rebelReasons = [
  "You purrchased it anyway. The cat is now emotionally unavailable.",
  "You ignored the verdict. The cat has moved from advisor to witness.",
  "The purchase happened. The cat is processing this betrayal in silence.",
  "Checkout completed against advice. The cat is updating your risk profile.",
  "You chose chaos. The cat chose documentation.",
  "The cat advised restraint; you selected plot development.",
  "You purrchased it anyway. A tiny incident report has been opened.",
  "The cat saw the transaction and is reconsidering its consulting rates.",
  "Purchase rebellion confirmed. Future judgments may arrive with extra squinting.",
  "You went around the cat. The cat has not gone around the evidence.",
];

const assumptionNotes = {
  quick: [
    "Quick judgment: the cat used default assumptions for budget, usage, and duplicates.",
    "This is a quick read. Add more context if you want the cat to be less dramatic and more precise.",
    "The cat used its default assumptions here. Expand the details for a sharper verdict.",
    "Fast mode active: useful, but not as nosy as the full inspection.",
    "Quick purrmission math used defaults for the hidden details.",
  ],
  detailed: [
    "Sharper judgment: the cat used your extra context.",
    "Extra context received. The cat appreciates the paperwork.",
    "Detailed mode: more facts, fewer mysterious assumptions.",
    "The cat used the expanded details for this verdict.",
  ],
};

function decisionReason(type, context) {
  const { item, price, currency } = context;
  const sentenceItem = item === "this" ? "This" : item;
  const lines = {
    inspection: [
      `${sentenceItem} is not a normal checkout decision. The cat will not treat ${money(price, currency)} as a simple bargain until the big risks are verified.`,
      `${money(price, currency)} for ${item} is less like shopping and more like a case file. The cat wants proof before any celebration.`,
      `${sentenceItem} at ${money(price, currency)} has triggered the cat's serious-inspection whiskers. Verify the boring details before trusting the bargain.`,
      `This is not a casual purrchase. For ${item}, ${money(price, currency)} needs documents, condition checks, and several skeptical blinks.`,
      `The cat refuses to confuse cheap with safe. ${item} needs a full inspection before ${money(price, currency)} gets treated as good news.`,
      `${sentenceItem} may be a miracle or a trap. The cat requests ownership, fees, condition, and legal reality before approving the vibe.`,
    ],
    approved: [
      `${sentenceItem} looks useful enough. The cat allows this purrchase, but still wants the receipt.`,
      `${sentenceItem} has survived the paw audit. Approved, with light supervision and no smug checkout dance.`,
      `The numbers make enough sense for ${item}. The cat permits it, while pretending this was difficult.`,
      `${sentenceItem} earns a cautious yes. The cat is not thrilled by capitalism, but accepts this case.`,
      `This looks reasonable enough to pass. The cat grants purrmission and expects future evidence of actual use.`,
      `${sentenceItem} clears the tiny council. Buy it, keep the receipt, and do not make the cat regret being generous.`,
      `The cat sees a real use case here. Purrmission granted, but with one eye open.`,
      `${sentenceItem} appears defensible. The cat allows the purrchase under normal household law.`,
    ],
    wait: [
      `${sentenceItem} may be fine, but the cat smells impulse. Revisit it after the mood changes.`,
      `${sentenceItem} is not a hard no, but the cat recommends letting the dopamine cool down first.`,
      `The case for ${item} is plausible, not urgent. The cat prescribes a pause and one dramatic window stare.`,
      `${sentenceItem} is hovering in maybe territory. Wait, then see if it still looks like a need instead of a sparkle.`,
      `The cat is not blocking ${item}, but it is placing one paw on the checkout button.`,
      `${sentenceItem} could make sense later. For now, the cat wants time, distance, and fewer tabs open.`,
      `This is a soft maybe. The cat recommends a cooldown before the wallet gets involved.`,
      `${sentenceItem} has not earned instant purrmission. Let the desire sit in a sunbeam for a while.`,
    ],
    no: [
      `${sentenceItem} is taking a big bite for the value. The cat recommends closing the tab.`,
      `${sentenceItem} did not pass the sniff test. The cat advises retreating from the checkout area.`,
      `The value story for ${item} is too thin. The cat is gently but firmly blocking the path.`,
      `${sentenceItem} looks more like a want with a costume on. The cat says no for now.`,
      `The math is not purring. ${item} should stay outside the cart.`,
      `${sentenceItem} has failed the tiny audit. The cat recommends keeping the money and the dignity.`,
      `The cat sees risk, impulse, or weak use. ${item} does not get purrmission today.`,
      `This purchase is asking for trust it has not earned. The cat closes the imaginary laptop.`,
    ],
  };

  return randomLine(`decision-${type}`, lines[type]);
}

function negotiationReason(type, context) {
  const { item, waitDays, targetPrice, currency, promisedUsage } = context;
  const sentenceItem = item === "this" ? "This" : item;
  const dayLabel = `${waitDays} day${waitDays === 1 ? "" : "s"}`;
  const lines = {
    accepted: [
      `${sentenceItem} is allowed if you wait ${dayLabel}, pay no more than ${money(targetPrice, currency)}, and use it ${promisedUsage}. The cat has made a legally fuzzy exception.`,
      `Conditional purrmission: wait ${dayLabel}, cap the price at ${money(targetPrice, currency)}, and actually use it ${promisedUsage}. The cat will be checking the vibes.`,
      `The revised terms pass. ${sentenceItem} may proceed only under ${money(targetPrice, currency)}, after ${dayLabel}, with ${promisedUsage} as the usage promise.`,
      `The cat accepts this narrower path: wait ${dayLabel}, keep the price under ${money(targetPrice, currency)}, and make the promised use real.`,
      `Counter-purrposal accepted. ${sentenceItem} gets a conditional yes, but only with the wait, the price cap, and the usage promise attached.`,
      `The cat has softened. ${sentenceItem} is allowed if future-you honors the ${dayLabel} wait and ${money(targetPrice, currency)} ceiling.`,
    ],
    rejected: [
      `The counteroffer improved things, but not enough. The cat wants a lower price, more real use, or a cleaner tradeoff.`,
      `The revised plan still smells like checkout energy. The cat wants stronger terms before changing the verdict.`,
      `Not enough movement. Lower the price, wait longer, promise more believable use, or trade off something real.`,
      `The cat reviewed the counter-purrposal and kept one paw firmly on the no button.`,
      `This negotiation is closer, but not purring. Bring a better price or a better sacrifice.`,
      `The cat appreciates the attempt, but the offer still does not clear the tiny tribunal.`,
      `Terms declined. The cat needs less impulse and more evidence.`,
      `The counteroffer has entered the record and failed to impress the record keeper.`,
    ],
  };

  return randomLine(`negotiation-${type}`, lines[type]);
}

function assumptionNote() {
  return detailFields.open
    ? randomLine("assumption-detailed", assumptionNotes.detailed)
    : randomLine("assumption-quick", assumptionNotes.quick);
}

function dealScoreBonus(isDealPrice, priceContext) {
  if (!isDealPrice || priceContext.needsInspection) return 0;
  if (priceContext.priceLevel === "Very high") return 2;
  if (priceContext.priceLevel === "High") return 4;
  return 6;
}

function dealNote(priceContext) {
  const lines = priceContext.needsInspection
    ? [
        "The sale tag is noted, but the cat refuses to let a discount outrank serious verification.",
        "Deal energy received. The cat still wants proof before treating this as good news.",
        "A discount can be real and still risky. The cat is keeping both paws on the evidence folder.",
      ]
    : [
        "The deal tag helps a little because you are not chasing full price, but the cat still checks the whole case.",
        "Sale noted. The cat grants a tiny paw bump for patience, not a full pardon.",
        "The cat appreciates discount discipline, while remaining suspicious of shiny markdowns.",
        "A better price helps the argument, but it does not erase budget, use, or duplicate concerns.",
        "Deal acknowledged. The cat is pleased you looked for value and still wants receipts.",
      ];

  return randomLine("deal-note", lines);
}

function returnableScoreShift(isReturnable, impulseValue, priceContext) {
  if (priceContext.needsInspection) return isReturnable ? 0.5 : -1;
  if (isReturnable) return 0.75;
  return impulseValue >= 4 ? -1.5 : 0;
}

function returnableNote(isReturnable) {
  const lines = isReturnable
    ? [
        "Returnable helps. The cat likes an exit door.",
        "A return option makes this less reckless. The cat has lowered one eyebrow.",
        "Returnable is useful evidence. The cat appreciates homework with a safety net.",
        "The return policy helps your case, assuming future-you actually uses it if needed.",
      ]
    : [
        "No return safety net is marked, so the cat adds a small caution mark.",
        "Without returnable evidence, the cat is only slightly less relaxed.",
        "The cat does not see a return option, which makes the decision a bit stickier.",
        "No return checkbox. The cat notes it, but does not overrule the whole case.",
      ];

  return randomLine(`returnable-${isReturnable ? "yes" : "no"}`, lines);
}

function intelligenceNote(analysis) {
  if (!analysis) return "";
  if (analysis.decision_influence.should_force_inspection) {
    return ` ${analysis.market_context.summary}`;
  }
  if (analysis.decision_influence.should_ask_followup) {
    return ` ${analysis.market_context.summary} ${analysis.decision_influence.followup_question}`;
  }
  return ` ${analysis.market_context.summary}`;
}

const usageRealityChecks = {
  day: [
    "Also, more than 24 uses per day is ambitious. The cat would like to inspect your calendar.",
    "The cat noticed that a day only has 24 hours. This usage plan is wearing a tiny fake mustache.",
    "More than 24 times per day? The cat is not judging the score, just the physics.",
    "The cat is trying to fit these uses into one day and has run out of squares on the planner.",
    "That daily count suggests either a heroic routine or a suspicious spreadsheet.",
    "The score stays the same, but the cat has questions about sleep.",
    "This is more than once per hour. The cat is quietly checking whether time still works.",
    "The calendar did not consent to this daily usage plan.",
    "The cat will accept the number, but only with a very theatrical blink.",
    "That is a busy day. The cat hopes snacks are involved.",
    "Daily use this high has entered tiny logistics territory.",
    "The cat is not changing the verdict, but it has opened the schedule drawer.",
  ],
  month: [
    "Also, more uses than days in a month is possible, but the cat is raising one eyebrow.",
    "The cat counted the days in a month and found fewer than your usage estimate.",
    "This monthly use count is higher than the calendar. The cat will allow the math but not the drama.",
    "The month is looking at this usage number and quietly backing away.",
    "The cat accepts repeat use, but this estimate is doing cartwheels across the calendar.",
    "More uses than days is possible. The cat simply requests emotional honesty from the spreadsheet.",
    "The score is unchanged, but the cat has placed a paw on the calendar.",
    "This monthly plan has strong main-character energy.",
    "The cat believes in ambition, not necessarily this much ambition.",
    "The usage math says yes; the calendar says please explain.",
    "The cat is letting the verdict stand while side-eyeing the frequency.",
    "That is a lot of monthly contact with one object. The cat is intrigued and concerned.",
  ],
  year: [
    "Also, more uses than days in a year is possible, but the cat is requesting a lifestyle diagram.",
    "The cat checked the calendar. This yearly use count is doing a lot.",
    "More than 366 times per year? The cat is not changing the verdict, only staring at the schedule.",
    "The year has only so many days, and the cat has only so many approving blinks.",
    "This annual usage estimate has sprinted past the calendar and into mythology.",
    "The score remains untouched, but the cat is drawing a tiny timeline.",
    "The cat accepts that multiple uses can happen in one day. It still wants to see the receipts.",
    "This yearly plan sounds intense enough to need onboarding.",
    "The calendar has been consulted and is asking for clarification.",
    "The cat is not disputing your lifestyle. It is simply blinking slowly at the math.",
    "That yearly number implies commitment. The cat hopes the object is ready.",
    "The verdict stays, but the cat is writing 'ambitious' in the margin.",
  ],
};

const recentLinesByType = {};

function catMood(type) {
  const lines = moodLines[type] || moodLines.judged;
  return toneAdjustedLine(type, randomLine(type, lines));
}

function setVisualCatState(state) {
  document.body.dataset.catState = state;
  calculator.dataset.catState = state;
  catRoomStage.dataset.catState = state;
}

function randomLine(type, lines) {
  if (lines.length <= 1) return lines[0] || "";

  const recentLines = recentLinesByType[type] || [];
  const eligibleLines = lines.filter((line) => !recentLines.includes(line));
  const pool = eligibleLines.length ? eligibleLines : lines;
  let next = lines[Math.floor(Math.random() * lines.length)];
  next = pool[Math.floor(Math.random() * pool.length)];
  recentLinesByType[type] = [next, ...recentLines].slice(0, Math.min(4, lines.length - 1));
  return next;
}

function careTone(state = loadCareState()) {
  if (state.stress >= 65 || state.trust <= 34) return "sharp";
  if (state.trust >= 74 && state.cozy >= 62 && state.stress <= 40) return "sweet";
  return "neutral";
}

function toneAdjustedLine(type, baseLine) {
  const tone = careTone();
  const sweetTypes = ["approved", "listened", "acceptedTerms", "memory", "judged"];
  const sharpTypes = ["judged", "rebel", "rejectedTerms", "budgetBreach", "unnamedSave", "unnamedFeedback"];
  const sweetLines = [
    `${baseLine} tiny approving purr included.`,
    `${baseLine} the cat is being very gentle because you have earned it.`,
    `${baseLine} soft paws, firm standards.`,
    `${baseLine} the cat says this with affectionate supervision.`,
  ];
  const sharpLines = [
    `${baseLine} the cat is not in the mood to decorate this.`,
    `${baseLine} trust is currently expensive.`,
    `${baseLine} the cat has sharpened the spreadsheet.`,
    `${baseLine} this is the polite version, somehow.`,
  ];

  if (tone === "sweet" && sweetTypes.includes(type)) {
    return randomLine(`tone-sweet-${type}`, sweetLines);
  }

  if (tone === "sharp" && sharpTypes.includes(type)) {
    return randomLine(`tone-sharp-${type}`, sharpLines);
  }

  return baseLine;
}

function selectedCurrency() {
  return currencySelect?.value || "USD";
}

function currencySymbol(currency = selectedCurrency()) {
  return currencySymbols[currency] || currency;
}

function priceInUsd(price, currency = selectedCurrency()) {
  return price * (usdPerCurrency[currency] || 1);
}

function money(value, currency = selectedCurrency()) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    currencyDisplay: "narrowSymbol",
    maximumFractionDigits: value >= 10 ? 0 : 2,
  }).format(value);
}

function numberText(value, maximumFractionDigits = 3) {
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) return "0";

  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits,
  }).format(numericValue);
}

function updateCurrencyUI() {
  const currency = selectedCurrency();
  localStorage.setItem(CURRENCY_KEY, currency);
  currencyPrefixes.forEach((prefix) => {
    prefix.textContent = currencySymbol(currency);
  });
}

function productPriceContext(item, price, currency) {
  const normalizedItem = item.toLowerCase();
  const benchmark = priceBenchmarks.find((entry) =>
    entry.keywords.some((keyword) => keywordMatches(normalizedItem, keyword)),
  );

  if (!benchmark || price <= 0) {
    return {
      category: "",
      priceLevel: "",
      riskLevel: "",
      checks: [],
      needsInspection: false,
      scoreShift: 0,
      message: "",
    };
  }

  if (benchmark.category === "Bag" && detectBrand(normalizedItem)?.sensitivity === "high") {
    return {
      category: "",
      priceLevel: "",
      riskLevel: "",
      checks: [],
      needsInspection: false,
      scoreShift: 0,
      message: "",
    };
  }

  const ratio = priceInUsd(price, currency) / benchmark.typicalUsd;
  const baseContext = {
    category: benchmark.category,
    riskLevel: benchmark.riskLevel,
    checks: benchmark.checks,
    needsInspection: benchmark.riskLevel === "High" && ratio <= 0.02,
  };

  if (ratio <= 0.02) {
    return {
      ...baseContext,
      priceLevel: "Suspiciously low",
      scoreShift: 34,
      message: ` For ${benchmark.label}, ${money(price, currency)} is wildly below a normal price. The cat is impressed, but wants you to check condition, scams, and hidden costs.`,
    };
  }

  if (ratio <= 0.35) {
    return {
      ...baseContext,
      priceLevel: "Cheap",
      scoreShift: 18,
      message: ` For ${benchmark.label}, ${money(price, currency)} looks cheap enough that price is helping your case.`,
    };
  }

  if (ratio >= 2.5) {
    return {
      ...baseContext,
      priceLevel: "Very high",
      scoreShift: -18,
      message: ` For ${benchmark.label}, ${money(price, currency)} looks high, so the cat wants stronger proof before approving.`,
    };
  }

  if (ratio >= 1.4) {
    return {
      ...baseContext,
      priceLevel: "High",
      scoreShift: -8,
      message: ` For ${benchmark.label}, ${money(price, currency)} is on the expensive side.`,
    };
  }

  return {
    ...baseContext,
    priceLevel: "Typical",
    scoreShift: 0,
    message: "",
  };
}

function renderContextCard(priceContext) {
  if (!priceContext.category) {
    contextCard.hidden = true;
    return;
  }

  contextCard.hidden = false;
  contextTitle.textContent = priceContext.category;
  contextPrice.textContent = priceContext.priceLevel;
  contextRisk.textContent = priceContext.riskLevel;
  contextChecks.textContent = priceContext.checks.length
    ? `Check: ${priceContext.checks.join(", ")}.`
    : "";
}

function compactLabel(value) {
  return String(value || "unknown").replaceAll("_", " ");
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

function keywordMatches(text, keyword) {
  const escapedKeyword = keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`(^|[^a-z0-9])${escapedKeyword}([^a-z0-9]|$)`, "i").test(text);
}

function includesAny(text, keywords) {
  return keywords.some((keyword) => keywordMatches(text, keyword));
}

function detectBrand(normalizedItem) {
  return brandRules.find((entry) => includesAny(normalizedItem, entry.aliases)) || null;
}

function detectModel(normalizedItem) {
  return modelRules.find((entry) => includesAny(normalizedItem, entry.keywords)) || null;
}

function detectCondition(normalizedItem) {
  if (/\b(used|pre[- ]owned|secondhand|vintage|excellent condition|fair condition|good condition)\b/.test(normalizedItem)) {
    return "used";
  }
  if (/\b(new|brand new|unused|nwt|with tags)\b/.test(normalizedItem)) {
    return "new";
  }
  return "unknown";
}

function detectCategory(normalizedItem, brandMatch) {
  const categoryMatch = categoryRules.find((entry) => includesAny(normalizedItem, entry.keywords));
  const brandCategory = brandMatch?.categories?.[0];
  const brandCategoryMatch = categoryRules.find((entry) => entry.category === brandCategory) || null;
  if (brandMatch?.sensitivity === "high" && brandCategoryMatch) return brandCategoryMatch;
  return categoryMatch || brandCategoryMatch;
}

function productSpecificity({ category, brand, model, condition, rawItem }) {
  if (!rawItem) return "empty";
  if (brand && model && condition !== "unknown" && /\b(excellent|good|fair|new|used|vintage|with tags|nwt)\b/.test(rawItem.toLowerCase())) {
    return "exact_product";
  }
  if (brand && model && condition !== "unknown") return "brand_model_condition";
  if (brand && model) return "brand_model";
  if (brand && category) return "brand_category";
  if (brand) return "brand_only";
  if (category) return "generic_category";
  return "unclear";
}

function marketReferenceFrame(categoryRule, brandMatch, modelMatch) {
  if (!categoryRule) return "cannot_assess";
  if (categoryRule.segment === "major_asset") return "asset_market";
  if (brandMatch?.sensitivity === "high" && modelMatch) return "model_resale_market";
  if (brandMatch?.sensitivity === "high") return "brand_category";
  if (brandMatch) return "brand_market";
  return "general_category";
}

function pricePosition(price, currency, categoryRule, brandMatch, modelMatch) {
  if (!price || !categoryRule) return "unknown";
  const ratio = priceInUsd(price, currency) / categoryRule.typicalUsd;

  if (categoryRule.category === "luxury_bag" && brandMatch?.brand === "Hermes" && modelMatch?.model === "Herbag") {
    if (ratio < 0.75) return "possibly_low";
    if (ratio <= 1.55) return "plausible";
    return "possibly_high";
  }

  if (ratio <= 0.08 && categoryRule.segment === "major_asset") return "suspiciously_low";
  if (ratio <= 0.45) return "low";
  if (ratio >= 2.5) return "very_high";
  if (ratio >= 1.45) return "high";
  return "typical";
}

function missingFactors({ categoryRule, brandMatch, modelMatch, condition, isReturnable }) {
  const missing = [];
  if (!categoryRule) missing.push("clear category");
  if (brandMatch?.sensitivity === "high" && !modelMatch) missing.push("exact model");
  if (brandMatch?.sensitivity === "high" && condition === "unknown") missing.push("condition");
  if (brandMatch?.sensitivity === "high") missing.push("authentication");
  if (!isReturnable) missing.push("return policy");
  if (categoryRule?.segment === "major_asset") missing.push("ownership and fees");
  return [...new Set(missing)].slice(0, 6);
}

function analysisSummary({ rawItem, price, currency, categoryRule, brandMatch, modelMatch, condition, position }) {
  const priceText = money(price, currency);
  if (!rawItem) return "Name the item first so the cat can classify it.";
  if (!categoryRule) return "The cat cannot classify this yet. A clearer product name will make the judgment sharper.";
  if (categoryRule.segment === "major_asset") {
    return `${priceText} for ${categoryRule.label.toLowerCase()} needs serious verification. The cat treats it as documents-first, not bargain-first.`;
  }
  if (brandMatch?.sensitivity === "high" && !modelMatch) {
    return `${brandMatch.brand} is brand-sensitive. The cat needs the exact model and condition before judging whether ${priceText} is actually good.`;
  }
  if (brandMatch?.sensitivity === "high" && modelMatch) {
    return `${brandMatch.brand} ${modelMatch.model} has resale-market complexity. ${condition === "unknown" ? "Condition is still missing." : "Condition is part of the value case."}`;
  }
  if (position === "high" || position === "very_high") {
    return `${priceText} looks elevated for ${categoryRule.label.toLowerCase()}, so the cat wants stronger justification.`;
  }
  if (position === "low" || position === "plausible") {
    return `${priceText} may help the value case, but the cat still checks use, impulse, duplicates, and returnability.`;
  }
  return `The cat can compare this as ${categoryRule.label.toLowerCase()}, but brand, model, and condition would improve the read.`;
}

function decisionInfluence({ categoryRule, brandMatch, modelMatch, condition, position, missing }) {
  let scoreShift = 0;
  let shouldForceInspection = false;

  if (position === "low" || position === "plausible") scoreShift += 2;
  if (position === "high" || position === "possibly_high") scoreShift -= 3;
  if (position === "very_high") scoreShift -= 6;
  if (position === "suspiciously_low") {
    scoreShift += 4;
    shouldForceInspection = true;
  }
  if (brandMatch?.sensitivity === "high" && !modelMatch) scoreShift -= 2;
  if (brandMatch?.sensitivity === "high" && condition === "unknown") scoreShift -= 1;
  if (categoryRule?.segment === "major_asset") shouldForceInspection = true;

  const shouldAskFollowup = missing.length > 0;
  return {
    score_shift: scoreShift,
    should_force_inspection: shouldForceInspection,
    should_ask_followup: shouldAskFollowup,
    followup_question: shouldAskFollowup
      ? `Tell the cat: ${missing.slice(0, 3).join(", ")}.`
      : "The cat has enough product context for now.",
  };
}

function analyzePurchase(item, price, currency, options = {}) {
  const rawItem = item.trim();
  const normalizedItem = rawItem.toLowerCase();
  if (!rawItem) return null;

  const brandMatch = detectBrand(normalizedItem);
  const modelMatch = detectModel(normalizedItem);
  const categoryRule = detectCategory(normalizedItem, brandMatch);
  const condition = detectCondition(normalizedItem);
  const specificity = productSpecificity({
    category: categoryRule?.category,
    brand: brandMatch?.brand,
    model: modelMatch?.model,
    condition,
    rawItem,
  });
  const referenceFrame = marketReferenceFrame(categoryRule, brandMatch, modelMatch);
  const position = pricePosition(price, currency, categoryRule, brandMatch, modelMatch);
  const missing = missingFactors({
    categoryRule,
    brandMatch,
    modelMatch,
    condition,
    isReturnable: Boolean(options.isReturnable),
  });
  const influence = decisionInfluence({ categoryRule, brandMatch, modelMatch, condition, position, missing });
  const confidence = Math.min(0.86, (categoryRule ? 0.42 : 0.22) + (brandMatch ? 0.16 : 0) + (modelMatch ? 0.18 : 0));

  return {
    schema_version: AI_SCHEMA_VERSION,
    normalized_item: normalizedItem,
    original_item: rawItem,
    currency,
    price,
    item_context: {
      specificity,
      category: categoryRule?.category || "unknown",
      subcategory: "unknown",
      brand: brandMatch?.brand || "unknown",
      model_family: modelMatch?.model || "unknown",
      model_variant: normalizedItem.match(/\b(zip 31|model [3yxs]|pro max|mini|13|14|15|16)\b/)?.[0] || "unknown",
      condition,
      market_segment: categoryRule?.segment || "unknown",
    },
    market_context: {
      reference_frame: referenceFrame,
      price_position: position,
      confidence,
      summary: analysisSummary({ rawItem, price, currency, categoryRule, brandMatch, modelMatch, condition, position }),
    },
    missing_factors: missing,
    risk: {
      level: categoryRule?.risk || "unknown",
      reasons: brandMatch?.sensitivity === "high"
        ? ["brand-sensitive", "condition can change value sharply", "market prices vary by model"]
        : categoryRule
          ? [`${categoryRule.label.toLowerCase()} context detected`]
          : ["details are incomplete"],
      checks: categoryRule?.checks || ["specific product name", "condition", "return policy"],
    },
    decision_influence: influence,
    cache_key: {
      category: categoryRule?.category || "unknown",
      brand: brandMatch?.brand?.toLowerCase().replaceAll(" ", "_") || "unknown",
      model_family: modelMatch?.model?.toLowerCase().replaceAll(" ", "_") || "unknown",
      condition,
      currency,
      price_band: priceBand(price),
    },
    validity: {
      region: "US",
      valid_until_days: brandMatch?.sensitivity === "high" ? 60 : 30,
      needs_refresh: false,
    },
    cat_note: influence.should_ask_followup
      ? influence.followup_question
      : "The cat has enough local product context for this pass.",
    source: "local_intelligence_v1",
  };
}

function inferMockAiContext(item, price, currency, options = {}) {
  return analyzePurchase(item, price, currency, options);
}

function renderAiContextCard(aiContext) {
  if (!aiContext) {
    aiCard.hidden = true;
    return;
  }

  aiCard.hidden = false;
  const modelLabel = compactLabel(aiContext.item_context.model_family);
  aiTitle.textContent = aiContext.item_context.brand !== "unknown"
    ? modelLabel === "unknown"
      ? aiContext.item_context.brand
      : `${aiContext.item_context.brand} ${modelLabel}`
    : compactLabel(aiContext.item_context.category);
  aiSummary.textContent = aiContext.market_context.summary;
  aiSpecificity.textContent = compactLabel(aiContext.item_context.specificity);
  aiReference.textContent = compactLabel(aiContext.market_context.reference_frame);
  aiRisk.textContent = compactLabel(aiContext.risk.level);
  aiMissing.textContent = aiContext.missing_factors.length
    ? `Needs: ${aiContext.missing_factors.join(", ")}.`
    : aiContext.cat_note;
}

async function requestAiContext() {
  const itemName = document.querySelector("#item").value.trim();
  const price = readNumber("price");
  const currency = selectedCurrency();
  const isReturnable = document.querySelector("#returnable").checked;

  if (!itemName) {
    mood.textContent = catMood("unnamedSave");
    return;
  }

  aiContextButton.disabled = true;
  aiContextButton.textContent = "AI cat is sniffing...";

  try {
    let aiContext;
    const endpoint = window.PURRMISSION_AI_ENDPOINT;
    if (endpoint) {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ item: itemName, price, currency, schema_version: AI_SCHEMA_VERSION }),
      });
      if (!response.ok) throw new Error("AI context request failed");
      aiContext = await response.json();
    } else {
      aiContext = inferMockAiContext(itemName, price, currency, { isReturnable });
    }

    renderAiContextCard(aiContext);
    mood.textContent = aiContext?.decision_influence?.should_ask_followup
      ? aiContext.decision_influence.followup_question
      : aiContext.cat_note;
  } catch {
    const fallbackContext = inferMockAiContext(itemName, price, currency);
    renderAiContextCard(fallbackContext);
    mood.textContent = "AI cat fell back to local sniff mode";
  } finally {
    aiContextButton.disabled = false;
    aiContextButton.textContent = "Ask AI cat";
  }
}

function getPurrAudio() {
  if (typeof Audio === "undefined") return null;

  if (!purrAudio) {
    purrAudio = new Audio(REAL_PURR_SRC);
    purrAudio.preload = "auto";
    purrAudio.load();
  }

  return purrAudio;
}

function playRecordedPurr({ mood = "soft" } = {}) {
  if (isMuted) return false;

  try {
    const audio = getPurrAudio();
    if (!audio) return false;
    audio.volume = mood === "grumpy" ? 0.5 + Math.random() * 0.12 : 0.38 + Math.random() * 0.12;
    audio.playbackRate = 0.92 + Math.random() * 0.16;
    audio.currentTime = 0;
    const playAttempt = audio.play();
    if (playAttempt?.catch) {
      playAttempt.catch(() => {
        stopPurrAudio();
      });
    }
    return true;
  } catch {
    stopPurrAudio();
    return false;
  }
}

function primePurrAudio() {
  try {
    getPurrAudio();
  } catch {
    purrAudio = null;
  }
}

function stopPurrAudio() {
  if (!purrAudio) return;

  try {
    purrAudio.pause();
    purrAudio.currentTime = 0;
  } catch {
    purrAudio = null;
  }
}

function playImmediatePurr(options = {}) {
  primePurrAudio();
  return playRecordedPurr(options);
}

function playPurr(options = {}) {
  if (isMuted) return;
  if (options.immediate) {
    playImmediatePurr(options);
    return;
  }
  playRecordedPurr(options);
}

function getAudioContext() {
  const Context = window.AudioContext || window.webkitAudioContext;
  if (!Context) return null;
  if (!audioContext) audioContext = new Context();
  return audioContext;
}

function playAngryCat() {
  if (isMuted) return;

  const context = getAudioContext();
  if (!context) return;
  if (context.state === "suspended") context.resume();

  stopPurrAudio();

  const now = context.currentTime;
  const duration = 0.62 + Math.random() * 0.12;
  const master = context.createGain();
  master.gain.setValueAtTime(0.0001, now);
  master.gain.exponentialRampToValueAtTime(0.18, now + 0.035);
  master.gain.exponentialRampToValueAtTime(0.0001, now + duration);
  master.connect(context.destination);

  const meow = context.createOscillator();
  const meowGain = context.createGain();
  const startFreq = 520 + Math.random() * 90;
  meow.type = "sawtooth";
  meow.frequency.setValueAtTime(startFreq, now);
  meow.frequency.exponentialRampToValueAtTime(170 + Math.random() * 45, now + duration);
  meowGain.gain.setValueAtTime(0.0001, now);
  meowGain.gain.exponentialRampToValueAtTime(0.22, now + 0.05);
  meowGain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
  meow.connect(meowGain).connect(master);

  const bufferSize = Math.max(1, Math.floor(context.sampleRate * duration));
  const noiseBuffer = context.createBuffer(1, bufferSize, context.sampleRate);
  const data = noiseBuffer.getChannelData(0);
  for (let index = 0; index < bufferSize; index += 1) {
    data[index] = (Math.random() * 2 - 1) * (1 - index / bufferSize);
  }

  const hiss = context.createBufferSource();
  const hissFilter = context.createBiquadFilter();
  const hissGain = context.createGain();
  hiss.buffer = noiseBuffer;
  hissFilter.type = "bandpass";
  hissFilter.frequency.setValueAtTime(2800 + Math.random() * 900, now);
  hissFilter.Q.setValueAtTime(1.8, now);
  hissGain.gain.setValueAtTime(0.0001, now);
  hissGain.gain.exponentialRampToValueAtTime(0.16, now + 0.025);
  hissGain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
  hiss.connect(hissFilter).connect(hissGain).connect(master);

  meow.start(now);
  hiss.start(now + 0.04);
  meow.stop(now + duration);
  hiss.stop(now + duration);
}

function playHappyCat() {
  if (isMuted) return;

  const context = getAudioContext();
  if (!context) return;
  if (context.state === "suspended") context.resume();

  stopPurrAudio();

  const now = context.currentTime;
  const master = context.createGain();
  master.gain.setValueAtTime(0.0001, now);
  master.gain.exponentialRampToValueAtTime(0.16, now + 0.025);
  master.gain.exponentialRampToValueAtTime(0.0001, now + 0.82);
  master.connect(context.destination);

  [0, 0.24].forEach((offset, index) => {
    const chirp = context.createOscillator();
    const gain = context.createGain();
    const start = now + offset;
    const startFrequency = 430 + Math.random() * 70 + index * 45;
    chirp.type = "triangle";
    chirp.frequency.setValueAtTime(startFrequency, start);
    chirp.frequency.exponentialRampToValueAtTime(startFrequency * 1.62, start + 0.11);
    chirp.frequency.exponentialRampToValueAtTime(startFrequency * 1.2, start + 0.22);
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(0.28, start + 0.035);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.28);
    chirp.connect(gain).connect(master);
    chirp.start(start);
    chirp.stop(start + 0.3);
  });

  const trill = context.createOscillator();
  const trillGain = context.createGain();
  trill.type = "sine";
  trill.frequency.setValueAtTime(660 + Math.random() * 60, now + 0.48);
  trill.frequency.linearRampToValueAtTime(780 + Math.random() * 70, now + 0.72);
  trillGain.gain.setValueAtTime(0.0001, now + 0.48);
  trillGain.gain.exponentialRampToValueAtTime(0.12, now + 0.53);
  trillGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.82);
  trill.connect(trillGain).connect(master);
  trill.start(now + 0.48);
  trill.stop(now + 0.84);
}

function scheduleAmbientPurr() {
  window.clearTimeout(purrTimer);
  if (isMuted) return;

  purrTimer = window.setTimeout(() => {
    playPurr();
    scheduleAmbientPurr();
  }, 5500 + Math.random() * 9000);
}

function setMuted(nextMuted, { silent = false } = {}) {
  const wasMuted = isMuted;
  isMuted = nextMuted;
  localStorage.setItem(SOUND_KEY, String(isMuted));
  soundToggle.setAttribute("aria-pressed", String(isMuted));
  soundToggle.setAttribute("aria-label", isMuted ? "Turn purr sounds on" : "Mute purr sounds");
  soundToggleLabel.textContent = isMuted ? "purr off" : "purr on";
  calculator.classList.toggle("is-muted", isMuted);

  if (isMuted) {
    window.clearTimeout(purrTimer);
    stopPurrAudio();
    mood.textContent = catMood("muted");
    if (!wasMuted && !silent) {
      calculator.classList.remove("eye-roll");
      requestAnimationFrame(() => {
        calculator.classList.add("eye-roll");
      });
      window.setTimeout(() => {
        calculator.classList.remove("eye-roll");
      }, 900);
    }
    return;
  }

  if (!silent) {
    mood.textContent = catMood("purrOn");
    calculator.classList.remove("purr-return", "eye-roll");
    soundToggle.classList.remove("is-purr-happy");
    requestAnimationFrame(() => {
      calculator.classList.add("purr-return");
      soundToggle.classList.add("is-purr-happy");
    });
    window.setTimeout(() => {
      calculator.classList.remove("purr-return");
      soundToggle.classList.remove("is-purr-happy");
    }, 950);
    playPurr({ immediate: true });
    scheduleAmbientPurr();
  }
}

function bounceCat() {
  calculator.classList.remove("happy", "skeptical");
  requestAnimationFrame(() => {
    calculator.classList.add("happy");
  });
}

function angryScratch() {
  setVisualCatState("angry");
  scratchAttack.classList.remove("is-active");
  requestAnimationFrame(() => {
    scratchAttack.classList.add("is-active");
  });
  window.setTimeout(() => {
    scratchAttack.classList.remove("is-active");
  }, 1200);
}

function happyVictoryRun() {
  setVisualCatState("zoomies");
  happyRun.classList.remove("is-active");
  requestAnimationFrame(() => {
    happyRun.classList.add("is-active");
  });
  window.setTimeout(() => {
    happyRun.classList.remove("is-active");
    setVisualCatState(careTone() === "sharp" ? "stressed" : "happy_purring");
  }, 1600);
}

function readNumber(id) {
  return Math.max(0, Number(document.querySelector(`#${id}`).value) || 0);
}

function usesPerMonth(uses, period) {
  if (period === "day") return uses * 30;
  if (period === "year") return uses / 12;
  return uses;
}

function usageLabel(uses, period) {
  return `${uses} time${uses === 1 ? "" : "s"} per ${period}`;
}

function usageRealityNote(uses, period) {
  const limits = {
    day: 24,
    month: 31,
    year: 366,
  };

  if (uses <= (limits[period] || Infinity)) return "";
  return randomLine(`usageReality-${period}`, usageRealityChecks[period]);
}

function monthsFromDuration(value, period) {
  const amount = Math.max(1, value);
  return period === "year" ? amount * 12 : amount;
}

function totalExpectedUses(uses, usePeriod, keepValue, keepPeriod) {
  const months = monthsFromDuration(keepValue, keepPeriod);
  return Math.max(0, usesPerMonth(uses, usePeriod) * months);
}

function clampCare(value) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function defaultCareState() {
  return {
    trust: 55,
    cozy: 45,
    stress: 18,
    treats: 3,
    lastNote: "Smart pauses make the cat cozier. Chaotic checkouts make the cat suspicious.",
    updatedAt: new Date().toISOString(),
  };
}

function loadCareState() {
  try {
    return { ...defaultCareState(), ...(JSON.parse(localStorage.getItem(CARE_KEY)) || {}) };
  } catch {
    return defaultCareState();
  }
}

function saveCareState(state) {
  const normalized = {
    ...state,
    trust: clampCare(state.trust),
    cozy: clampCare(state.cozy),
    stress: clampCare(state.stress),
    treats: Math.max(0, Math.round(state.treats || 0)),
    updatedAt: new Date().toISOString(),
  };
  localStorage.setItem(CARE_KEY, JSON.stringify(normalized));
  renderCatCare(normalized);
  return normalized;
}

function catCareMood(state) {
  if (state.stress >= 70) return "Overstimulated auditor";
  if (state.trust <= 32) return "Suspicious cupboard cat";
  if (state.trust >= 78 && state.cozy >= 68) return "Purring CFO";
  if (state.cozy >= 72) return "Cozy treasurer";
  if (state.treats >= 18) return "Treat-funded supervisor";
  return "Watchful loaf";
}

function renderCatCare(state = loadCareState()) {
  careMood.textContent = catCareMood(state);
  careNote.textContent = state.lastNote;
  treatJar.textContent = `${state.treats} treat${state.treats === 1 ? "" : "s"}`;
  careTrustValue.textContent = state.trust;
  careCozyValue.textContent = state.cozy;
  careStressValue.textContent = state.stress;
  careTrustBar.style.width = `${state.trust}%`;
  careCozyBar.style.width = `${state.cozy}%`;
  careStressBar.style.width = `${state.stress}%`;
  if (careTone(state) === "sharp") {
    setVisualCatState("stressed");
  }
  renderCatRoom(state);
}

function updateCatCare(delta, note) {
  const current = loadCareState();
  saveCareState({
    ...current,
    trust: current.trust + (delta.trust || 0),
    cozy: current.cozy + (delta.cozy || 0),
    stress: current.stress + (delta.stress || 0),
    treats: current.treats + (delta.treats || 0),
    lastNote: note || current.lastNote,
  });
}

function catRoomCopy(state = loadCareState()) {
  const tone = careTone(state);
  if (tone === "sharp") {
    return {
      title: "The cat is under the cabinet",
      badge: "low trust",
      line: "You can try petting, but the cat may require several responsible decisions and one apology to the spreadsheet.",
    };
  }

  if (tone === "sweet") {
    return {
      title: "The cat is ready for attention",
      badge: "soft paws",
      line: "Hold the pet spot. The cat will come over because the trust ledger is pleasantly boring.",
    };
  }

  return {
    title: "Your cat is watching the cart",
    badge: "steady paws",
    line: "Hold the pet spot and the cat may come over if the trust ledger allows it.",
  };
}

function renderCatRoom(state = loadCareState()) {
  if (!roomCatTitle || !roomCatBadge || !roomCatLine) return;
  const copy = catRoomCopy(state);
  roomCatTitle.textContent = copy.title;
  roomCatBadge.textContent = copy.badge;
  if (!catRoomStage.classList.contains("is-petting")) {
    roomCatLine.textContent = copy.line;
  }
  catRoomStage.classList.toggle("is-curious", careTone(state) !== "sharp");
}

function setPetTargetFromEvent(event) {
  const stageRect = catRoomStage.getBoundingClientRect();
  const fallbackX = stageRect.width * 0.28;
  const fallbackY = stageRect.height * 0.72;
  const pointerX = Number.isFinite(event?.clientX) ? event.clientX - stageRect.left : fallbackX;
  const pointerY = Number.isFinite(event?.clientY) ? event.clientY - stageRect.top : fallbackY;
  const safeX = Math.max(54, Math.min(stageRect.width - 54, pointerX));
  const safeY = Math.max(58, Math.min(stageRect.height - 44, pointerY));
  catRoomStage.style.setProperty("--pet-x", `${safeX}px`);
  catRoomStage.style.setProperty("--pet-y", `${safeY}px`);
}

function clearPetPoseClasses() {
  catRoomStage.classList.remove("boop-head", "rub-body", "tail-brush");
}

function choosePetPose() {
  clearPetPoseClasses();
  const poses = ["boop-head", "rub-body", "tail-brush"];
  const pose = poses[Math.floor(Math.random() * poses.length)];
  catRoomStage.classList.add(pose);
  return pose;
}

function petPoseLine(pose, tone) {
  if (pose === "tail-brush") {
    return tone === "sharp"
      ? "The cat allows one tail brush. This is not full forgiveness."
      : "The cat flicks its tail into your hand like a tiny velvet receipt.";
  }
  if (pose === "rub-body") {
    return tone === "sharp"
      ? "The cat leans in with professional caution."
      : "The cat presses its side into your hand and purrs like a small engine.";
  }
  return tone === "sharp"
    ? "The cat gives you one careful head bump. Spend wisely."
    : "The cat pops its head out for a perfect little forehead rub.";
}

let peekTimer;

function clearPeekClasses() {
  catRoomStage.classList.remove("peek-left", "peek-right", "peek-top");
}

function playfulPeek() {
  if (!document.getElementById("cat-room-view").classList.contains("is-active")) return;
  if (catRoomStage.classList.contains("is-petting")) return;
  clearPeekClasses();
  const peeks = ["peek-left", "peek-right", "peek-top"];
  const nextPeek = peeks[Math.floor(Math.random() * peeks.length)];
  catRoomStage.classList.add(nextPeek);
  roomCatLine.textContent = randomLine("room-peek", [
    "The cat briefly pops out to inspect your financial aura.",
    "A suspicious little face appears, then pretends it did not.",
    "The cat peeks in. The cart has been warned.",
    "Tiny head. Large opinions.",
  ]);
  window.setTimeout(() => {
    clearPeekClasses();
    renderCatRoom();
  }, 1450);
}

function schedulePlayfulPeek() {
  window.clearTimeout(peekTimer);
  if (!document.getElementById("cat-room-view").classList.contains("is-active")) return;
  peekTimer = window.setTimeout(() => {
    playfulPeek();
    schedulePlayfulPeek();
  }, 3500 + Math.random() * 4500);
}

function switchView(targetId) {
  appViews.forEach((view) => {
    view.classList.toggle("is-active", view.id === targetId);
  });
  appTabs.forEach((tab) => {
    const isActive = tab.dataset.viewTarget === targetId;
    tab.classList.toggle("is-active", isActive);
    tab.setAttribute("aria-pressed", String(isActive));
  });
  window.clearTimeout(peekTimer);
  if (targetId === "cat-room-view") {
    renderCatRoom();
    window.setTimeout(playfulPeek, 500);
    schedulePlayfulPeek();
  } else {
    clearPeekClasses();
  }
}

let lastPetRewardAt = 0;
let lastPetPointerAt = 0;

function startPetting(event) {
  const state = loadCareState();
  const tone = careTone(state);
  setPetTargetFromEvent(event);
  clearPeekClasses();
  const pose = choosePetPose();
  setVisualCatState("happy_purring");
  catRoomStage.classList.add("is-petting", "is-curious");
  roomCatLine.textContent = petPoseLine(pose, tone);
  playPurr({ immediate: true, mood: careTone(state) === "sharp" ? "soft" : "happy" });
}

function stopPetting() {
  catRoomStage.classList.remove("is-petting");
  clearPetPoseClasses();
  const now = Date.now();
  if (now - lastPetRewardAt > 12000) {
    lastPetRewardAt = now;
    updateCatCare(
      { trust: 1, cozy: 2, stress: -1 },
      "Petting logged. The cat is slightly softer, but still remembers receipts.",
    );
    return;
  }
  setVisualCatState(careTone() === "sharp" ? "stressed" : "neutral");
  renderCatRoom();
}

function careChangeForFeedback(feedback, entry) {
  const cautionVerdicts = ["Purrhaps wait", "No purrmission", "Still no purrmission", "Needs serious inspection"];
  const defiedCat = feedback === "bought" && cautionVerdicts.includes(entry.verdict);

  if (defiedCat) {
    return {
      delta: { trust: -7, cozy: -3, stress: 10, treats: -1 },
      note: "The cat saw the risky checkout and is quietly updating the trust ledger.",
    };
  }

  if (feedback === "bought") {
    return {
      delta: { trust: 2, cozy: 1, stress: -1 },
      note: "A reasonable purrchase preserves trust. The cat keeps the receipt nearby.",
    };
  }

  if (feedback === "skipped") {
    return {
      delta: { trust: 5, cozy: 6, stress: -5, treats: 2 },
      note: "You paused the cart. The cat has accepted two tiny treats in your honor.",
    };
  }

  if (feedback === "regretted") {
    return {
      delta: { trust: -3, cozy: -2, stress: 7 },
      note: "Regret logged. The cat is not mad, just more careful now.",
    };
  }

  if (feedback === "used") {
    return {
      delta: { trust: 4, cozy: 2, stress: -3, treats: 1 },
      note: "Actual use detected. The cat respects evidence more than vibes.",
    };
  }

  return null;
}

function loadHistory() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

function saveHistory(history) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history.slice(0, 20)));
  renderProfile();
  renderHistory();
}

function profileFromHistory(history) {
  const total = history.length || 1;
  const bought = history.filter((entry) => entry.feedback.includes("bought")).length;
  const skipped = history.filter((entry) => entry.feedback.includes("skipped")).length;
  const regretted = history.filter((entry) => entry.feedback.includes("regretted")).length;
  const defied = history.filter(
    (entry) =>
      entry.feedback.includes("bought") &&
      ["Purrhaps wait", "No purrmission", "Still no purrmission", "Wait 72 hours", "Skip for now", "Still no"].includes(
        entry.verdict,
      ),
  ).length;
  const saverScore = Math.round((skipped / total) * 100);
  const spenderScore = Math.round((bought / total) * 100);
  const regretScore = Math.round((regretted / total) * 100);

  if (defied >= 2 || regretScore >= 35) {
    return {
      name: "Auditor Cat",
      note: "The cat has noticed risky purchases and will ask for stronger proof.",
    };
  }

  if (saverScore >= 70 && bought === 0 && history.length >= 3) {
    return {
      name: "Permission Cat",
      note: "The cat may encourage reasonable purchases instead of endless self-denial.",
    };
  }

  if (spenderScore >= 55 && history.length >= 3) {
    return {
      name: "Pattern Cat",
      note: "The cat is watching for repeat triggers before you check out.",
    };
  }

  return {
    name: "Advisor Cat",
    note: "The cat is still learning your spending patterns.",
  };
}

function renderProfile() {
  const profile = profileFromHistory(loadHistory());
  catPersona.textContent = profile.name;
  personaNote.textContent = profile.note;
}

function renderHistory() {
  const history = loadHistory();
  historyList.innerHTML = "";
  clearHistory.disabled = history.length === 0;
  clearHistory.setAttribute("aria-disabled", String(history.length === 0));

  if (history.length === 0) {
    const empty = document.createElement("li");
    const label = document.createElement("strong");
    const badge = document.createElement("span");
    label.textContent = "No saved judgments yet";
    badge.className = "history-badge";
    badge.textContent = "new";
    empty.append(label, badge);
    historyList.append(empty);
    return;
  }

  history.slice(0, 5).forEach((entry) => {
    const item = document.createElement("li");
    const feedback = entry.feedback.length ? entry.feedback.join(", ") : "pending";
    const summary = document.createElement("span");
    const name = document.createElement("strong");
    const badge = document.createElement("span");
    name.textContent = entry.item;
    summary.append(name, `${entry.verdict} · ${money(entry.price, entry.currency || selectedCurrency())} · ${feedback}`);
    badge.className = "history-badge";
    badge.textContent = numberText(entry.score);
    item.append(summary, badge);
    historyList.append(item);
  });
}

function rememberDecision() {
  if (!currentDecision.hasNamedItem) {
    currentDecision.id = null;
    mood.textContent = catMood("unnamedSave");
    return;
  }

  const history = loadHistory();
  const entry = {
    id: Date.now(),
    item: currentDecision.item,
    price: currentDecision.price,
    currency: currentDecision.currency,
    score: currentDecision.score,
    verdict: currentDecision.verdict,
    analysis: currentDecision.purchaseAnalysis
      ? {
          schemaVersion: currentDecision.purchaseAnalysis.schema_version,
          category: currentDecision.purchaseAnalysis.item_context.category,
          brand: currentDecision.purchaseAnalysis.item_context.brand,
          modelFamily: currentDecision.purchaseAnalysis.item_context.model_family,
          specificity: currentDecision.purchaseAnalysis.item_context.specificity,
          referenceFrame: currentDecision.purchaseAnalysis.market_context.reference_frame,
          priceBand: currentDecision.purchaseAnalysis.cache_key.price_band,
          risk: currentDecision.purchaseAnalysis.risk.level,
        }
      : null,
    feedback: [],
    createdAt: new Date().toISOString(),
  };
  currentDecision.id = entry.id;
  history.unshift(entry);
  saveHistory(history);
}

function updateCurrentFeedback(feedback) {
  if (!currentDecision.hasNamedItem) {
    mood.textContent = catMood("unnamedFeedback");
    return;
  }

  if (!currentDecision.id) {
    rememberDecision();
  }

  const history = loadHistory();
  const entry = history.find((item) => item.id === currentDecision.id);
  if (!entry) return;

  if (!entry.feedback.includes(feedback)) {
    entry.feedback.push(feedback);
    const careChange = careChangeForFeedback(feedback, entry);
    if (careChange) {
      updateCatCare(careChange.delta, careChange.note);
    }
    if (feedback === "bought" && careChange?.delta?.stress > 0) setVisualCatState("angry");
    if (feedback === "skipped" || feedback === "used") setVisualCatState("happy_purring");
    if (feedback === "regretted") setVisualCatState("stressed");
  }

  saveHistory(history);
  mood.textContent = feedback === "regretted" ? catMood("regret") : catMood("memory");
}

function calculateDecision({ remember = true, sound = true } = {}) {
  renderAiContextCard(null);
  const itemName = document.querySelector("#item").value.trim();
  const item = itemName || "this";
  const price = readNumber("price");
  const budget = readNumber("budget");
  const uses = readNumber("uses");
  const useFrequency = document.querySelector("#use-frequency").value;
  const keepFor = Math.max(1, readNumber("keep-for"));
  const keepPeriod = document.querySelector("#keep-period").value;
  const duplicate = Number(document.querySelector("#duplicate").value);
  const impulseValue = Number(impulse.value);
  const currency = selectedCurrency();
  const isDealPrice = document.querySelector("#deal-price").checked;
  const isReturnable = document.querySelector("#returnable").checked;

  const hasBudget = budget > 0;
  const budgetRatio = hasBudget ? price / budget : 0;
  const monthlyUses = usesPerMonth(uses, useFrequency);
  const expectedUses = totalExpectedUses(uses, useFrequency, keepFor, keepPeriod);
  const useScore = Math.min(30, monthlyUses * 3);
  const budgetPenalty = hasBudget ? Math.min(42, budgetRatio * 48) : 0;
  const impulsePenalty = impulseValue * 7;
  const duplicatePenalty = duplicate * 15;
  const priceContext = productPriceContext(item, price, currency);
  const purchaseAnalysis = analyzePurchase(itemName, price, currency, { isReturnable });
  const usageNote = usageRealityNote(uses, useFrequency);
  const dealBonus = dealScoreBonus(isDealPrice, priceContext);
  const returnableShift = returnableScoreShift(isReturnable, impulseValue, priceContext);
  const needsInspection = priceContext.needsInspection || purchaseAnalysis?.decision_influence.should_force_inspection;
  const score =
    68 +
    useScore +
    priceContext.scoreShift +
    (purchaseAnalysis?.decision_influence.score_shift || 0) +
    dealBonus +
    returnableShift -
    budgetPenalty -
    impulsePenalty -
    duplicatePenalty;
  const normalizedScore = needsInspection ? Math.max(0, Math.min(69, score)) : Math.max(0, Math.min(100, score));
  const perUse = expectedUses > 0 ? price / expectedUses : price;

  currentDecision = {
    item,
    price,
    budget,
    uses: monthlyUses,
    score: normalizedScore,
    budgetRatio,
    verdict: "",
    currency,
    isDealPrice,
    isReturnable,
    purchaseAnalysis,
    feedback: [],
    id: null,
    hasNamedItem: Boolean(itemName),
  };

  budgetBite.textContent = hasBudget ? `${numberText(budgetRatio * 100)}%` : "Not set";
  costUse.textContent = `${money(perUse, currency)} / use`;
  catScore.textContent = numberText(normalizedScore);
  renderContextCard(priceContext);

  let result;
  let message;

  if (needsInspection) {
    result = "Needs serious inspection";
    message = decisionReason("inspection", { item, price, currency });
    setVisualCatState(careTone() === "sharp" ? "stressed" : "skeptical");
  } else if (normalizedScore >= 72) {
    result = "Purrmission granted";
    message = decisionReason("approved", { item, price, currency });
    setVisualCatState("happy_purring");
  } else if (normalizedScore >= 50) {
    result = "Purrhaps wait";
    message = decisionReason("wait", { item, price, currency });
    setVisualCatState("skeptical");
  } else {
    result = "No purrmission";
    message = decisionReason("no", { item, price, currency });
    calculator.classList.add("skeptical");
    setVisualCatState(careTone() === "sharp" ? "stressed" : "skeptical");
  }

  if (duplicate > 0 && normalizedScore < 78) {
    message += " You already have a similar thing, which makes the cat squint.";
  }

  if (priceContext.message) {
    message += priceContext.message;
  }

  message += intelligenceNote(purchaseAnalysis);

  if (isDealPrice) {
    message += ` ${dealNote(priceContext)}`;
  }

  message += ` ${returnableNote(isReturnable)}`;

  if (usageNote) {
    message += ` ${usageNote}`;
  }

  message += ` ${assumptionNote()}`;

  verdict.textContent = result;
  reason.textContent = message;
  currentDecision.verdict = result;
  mood.textContent = normalizedScore >= 72 && !needsInspection ? catMood("approved") : catMood("judged");
  rebelButton.hidden = normalizedScore >= 72 && !needsInspection;
  listenButton.hidden = normalizedScore >= 72 && !needsInspection;
  negotiation.hidden = normalizedScore >= 72 && !needsInspection;
  if (remember) rememberDecision();
  if (sound) {
    playPurr({ mood: normalizedScore >= 72 && !needsInspection ? "soft" : "grumpy" });
    scheduleAmbientPurr();
  }
  bounceCat();

  if (hasBudget && budgetRatio > 1) {
    mood.textContent = catMood("budgetBreach");
    setVisualCatState("angry");
    window.setTimeout(angryScratch, 180);
  }
}

function calculateNegotiation(event) {
  event.preventDefault();

  const waitDays = readNumber("wait-days");
  const targetPrice = readNumber("target-price");
  const promisedUses = readNumber("promised-uses");
  const usePeriod = document.querySelector("#use-period").value;
  const promisedMonthlyUses = usesPerMonth(promisedUses, usePeriod);
  const tradeoff = Number(document.querySelector("#tradeoff").value);
  const priceDrop = currentDecision.price > 0 ? Math.max(0, currentDecision.price - targetPrice) : 0;
  const priceDropRatio = currentDecision.price > 0 ? priceDrop / currentDecision.price : 0;
  const extraUses = Math.max(0, promisedMonthlyUses - currentDecision.uses);
  const waitBonus = Math.min(18, waitDays * 3);
  const priceBonus = Math.min(22, Math.round(priceDropRatio * 42));
  const useBonus = Math.min(18, extraUses * 2);
  const adjustedScore = Math.max(
    0,
    Math.min(100, currentDecision.score + waitBonus + priceBonus + useBonus + tradeoff),
  );
  const hasBudget = currentDecision.budget > 0;
  const adjustedBudgetRatio = hasBudget ? targetPrice / currentDecision.budget : 0;
  const adjustedPerUse = promisedUses > 0 ? targetPrice / promisedUses : targetPrice;
  const promisedUsage = usageLabel(promisedUses, usePeriod);

  budgetBite.textContent = hasBudget ? `${numberText(adjustedBudgetRatio * 100)}%` : "Not set";
  costUse.textContent = `${money(adjustedPerUse, currentDecision.currency)} / use`;
  catScore.textContent = numberText(adjustedScore);

  if (adjustedScore >= 72 && (!hasBudget || adjustedBudgetRatio <= 1)) {
    verdict.textContent = "Conditional purrmission";
    reason.textContent = negotiationReason("accepted", {
      item: currentDecision.item,
      waitDays,
      targetPrice,
      currency: currentDecision.currency,
      promisedUsage,
    });
    currentDecision.verdict = "Conditional purrmission";
    currentDecision.score = adjustedScore;
    mood.textContent = catMood("acceptedTerms");
    updateCatCare(
      { trust: 3, cozy: 2, stress: -3, treats: 1 },
      "Counter-purrposal accepted. The cat likes negotiated restraint.",
    );
    setVisualCatState("zoomies");
    negotiation.hidden = true;
    rebelButton.hidden = true;
    listenButton.hidden = true;
    if (currentDecision.hasNamedItem) rememberDecision();
    playPurr();
    scheduleAmbientPurr();
    bounceCat();
    return;
  }

  verdict.textContent = "Still no purrmission";
  reason.textContent = negotiationReason("rejected", {
    item: currentDecision.item,
    waitDays,
    targetPrice,
    currency: currentDecision.currency,
    promisedUsage,
  });
  mood.textContent = catMood("rejectedTerms");
  currentDecision.verdict = "Still no purrmission";
  currentDecision.score = adjustedScore;
  rebelButton.hidden = false;
  listenButton.hidden = false;
  calculator.classList.add("skeptical");
  if (currentDecision.hasNamedItem) rememberDecision();

  if (hasBudget && adjustedBudgetRatio > 1) {
    playPurr({ mood: "grumpy" });
    window.setTimeout(angryScratch, 180);
  }
}

function updateImpulseLabel() {
  impulseLabel.textContent = impulseNames[impulse.value];
}

function closeHelpDots(exceptDot) {
  document.querySelectorAll(".help-dot.is-open").forEach((dot) => {
    if (dot !== exceptDot) {
      dot.classList.remove("is-open");
      dot.setAttribute("aria-expanded", "false");
    }
  });
}

function alignHelpDot(dot) {
  dot.classList.remove("align-left", "align-right");
  const { left, right } = dot.getBoundingClientRect();
  const center = (left + right) / 2;
  const viewportWidth =
    window.visualViewport?.width || window.innerWidth || document.documentElement.clientWidth;
  const edgeBuffer = Math.min(150, viewportWidth * 0.42);

  if (viewportWidth - center < edgeBuffer) {
    dot.classList.add("align-right");
    return;
  }

  if (center < edgeBuffer) {
    dot.classList.add("align-left");
  }
}

function toggleHelpDot(dot) {
  const willOpen = !dot.classList.contains("is-open");
  closeHelpDots(dot);
  if (willOpen) alignHelpDot(dot);
  dot.classList.toggle("is-open", willOpen);
  dot.setAttribute("aria-expanded", String(willOpen));
}

document.querySelectorAll(".help-dot").forEach((dot) => {
  dot.setAttribute("role", "button");
  dot.setAttribute("aria-label", dot.dataset.tooltip || "Field help");
  dot.setAttribute("aria-expanded", "false");

  dot.addEventListener("pointerdown", (event) => {
    event.preventDefault();
    event.stopPropagation();
    toggleHelpDot(dot);
    dot.focus({ preventScroll: true });
  });

  dot.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
  });

  dot.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      event.stopPropagation();
      toggleHelpDot(dot);
    }

    if (event.key === "Escape") {
      dot.classList.remove("is-open");
      dot.setAttribute("aria-expanded", "false");
      dot.blur();
    }
  });
});

document.addEventListener("pointerdown", (event) => {
  if (!event.target.closest(".help-dot")) {
    closeHelpDots();
  }
});

window.addEventListener("resize", () => {
  document.querySelectorAll(".help-dot.is-open").forEach(alignHelpDot);
});

appTabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    switchView(tab.dataset.viewTarget);
  });
});

petZone.addEventListener("pointerdown", (event) => {
  event.preventDefault();
  lastPetPointerAt = Date.now();
  petZone.setPointerCapture?.(event.pointerId);
  startPetting(event);
});

petZone.addEventListener("pointerup", (event) => {
  event.preventDefault();
  stopPetting();
});

petZone.addEventListener("pointercancel", stopPetting);
petZone.addEventListener("pointerleave", () => {
  if (catRoomStage.classList.contains("is-petting")) stopPetting();
});
petZone.addEventListener("click", (event) => {
  if (Date.now() - lastPetPointerAt < 350) return;
  startPetting(event);
  window.setTimeout(stopPetting, 280);
});

impulse.addEventListener("input", updateImpulseLabel);

form.addEventListener("submit", (event) => {
  event.preventDefault();
  calculateDecision();
});

negotiation.addEventListener("submit", calculateNegotiation);

aiContextButton.addEventListener("click", requestAiContext);

rebelButton.addEventListener("click", () => {
  updateCurrentFeedback("bought");
  mood.textContent = catMood("rebel");
  reason.textContent = randomLine("rebelReason", rebelReasons);
  playAngryCat();
  angryScratch();
});

listenButton.addEventListener("click", () => {
  updateCurrentFeedback("skipped");
  mood.textContent = catMood("listened");
  reason.textContent = "You listened to the cat. The cart may recover, and the cat is extremely pleased with itself.";
  rebelButton.hidden = true;
  listenButton.hidden = true;
  playHappyCat();
  happyVictoryRun();
});

feedbackButtons.forEach((button) => {
  button.addEventListener("click", () => {
    updateCurrentFeedback(button.dataset.feedback);
  });
});

clearHistory.addEventListener("click", () => {
  saveHistory([]);
  mood.textContent = catMood("memoryWiped");
  playPurr();
});

soundToggle.addEventListener("click", () => {
  setMuted(!isMuted);
});

currencySelect.addEventListener("change", () => {
  updateCurrencyUI();
  calculateDecision({ remember: false, sound: false });
  renderHistory();
});

const savedCurrency = localStorage.getItem(CURRENCY_KEY);
if (savedCurrency && Array.from(currencySelect.options).some((option) => option.value === savedCurrency)) {
  currencySelect.value = savedCurrency;
}

updateImpulseLabel();
updateCurrencyUI();
primePurrAudio();
calculateDecision({ remember: false, sound: false });
setMuted(isMuted, { silent: true });
renderCatCare();
renderProfile();
renderHistory();
