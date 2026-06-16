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
const rebelButton = document.querySelector("#rebel-button");
const scratchAttack = document.querySelector("#scratch-attack");
const negotiation = document.querySelector("#negotiation");
const catPersona = document.querySelector("#cat-persona");
const personaNote = document.querySelector("#persona-note");
const historyList = document.querySelector("#history-list");
const clearHistory = document.querySelector("#clear-history");
const feedbackButtons = document.querySelectorAll("[data-feedback]");
const soundToggle = document.querySelector("#sound-toggle");
const soundToggleLabel = document.querySelector("#sound-toggle-label");
const currencySelect = document.querySelector("#currency");
const currencyPrefixes = document.querySelectorAll("[data-currency-prefix]");

const STORAGE_KEY = "purrmission-history";
const SOUND_KEY = "purrmission-muted";
const CURRENCY_KEY = "purrmission-currency";
const REAL_PURR_SRC = "assets/cat-purr.mp3";

let audioContext;
let purrTimer;
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

const impulseNames = {
  1: "Calm",
  2: "Curious",
  3: "Medium",
  4: "Itchy paws",
  5: "Dopamine sprint",
};

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
    entry.keywords.some((keyword) => normalizedItem.includes(keyword)),
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

function ensureAudio() {
  if (isMuted) return null;
  const AudioEngine = window.AudioContext || window.webkitAudioContext;
  if (!AudioEngine) return null;
  if (!audioContext) {
    audioContext = new AudioEngine();
  }
  if (audioContext.state === "suspended") {
    audioContext.resume();
  }
  return audioContext;
}

function createPurrWavBuffer({ mood = "soft" } = {}) {
  const sampleRate = 16000;
  const duration = 1.15 + Math.random() * 0.45;
  const sampleCount = Math.floor(sampleRate * duration);
  const bytesPerSample = 2;
  const dataSize = sampleCount * bytesPerSample;
  const buffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(buffer);
  const chest = mood === "grumpy" ? 44 + Math.random() * 8 : 34 + Math.random() * 10;
  const audible = mood === "grumpy" ? 132 + Math.random() * 22 : 118 + Math.random() * 26;
  const pulseRate = 18 + Math.random() * 8;
  const breathRate = 1.6 + Math.random() * 0.8;
  const volume = mood === "grumpy" ? 0.32 : 0.28;
  let noiseHold = 0;

  function writeString(offset, value) {
    for (let i = 0; i < value.length; i += 1) {
      view.setUint8(offset + i, value.charCodeAt(i));
    }
  }

  writeString(0, "RIFF");
  view.setUint32(4, 36 + dataSize, true);
  writeString(8, "WAVE");
  writeString(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * bytesPerSample, true);
  view.setUint16(32, bytesPerSample, true);
  view.setUint16(34, 16, true);
  writeString(36, "data");
  view.setUint32(40, dataSize, true);

  for (let index = 0; index < sampleCount; index += 1) {
    const time = index / sampleRate;
    const envelope = Math.sin(Math.PI * (index / sampleCount));
    const pulse = 0.42 + 0.58 * Math.max(0, Math.sin(2 * Math.PI * pulseRate * time));
    const breath = 0.58 + 0.42 * Math.sin(2 * Math.PI * breathRate * time + 0.8);
    if (index % 7 === 0) {
      noiseHold = Math.random() * 2 - 1;
    }
    const wave =
      Math.sin(2 * Math.PI * chest * time) * 0.62 +
      Math.sin(2 * Math.PI * chest * 2.03 * time) * 0.2 +
      Math.sin(2 * Math.PI * audible * time) * 0.16 +
      Math.sin(2 * Math.PI * audible * 1.52 * time) * 0.07 +
      noiseHold * 0.05;
    const sample = Math.max(-1, Math.min(1, wave * pulse * breath * envelope * volume));
    view.setInt16(44 + index * 2, sample * 32767, true);
  }

  return buffer;
}

function playGeneratedPurr(options) {
  if (isMuted || typeof Blob === "undefined" || typeof URL === "undefined") return false;

  try {
    const audio = document.createElement("audio");
    const blobUrl = URL.createObjectURL(new Blob([createPurrWavBuffer(options)], { type: "audio/wav" }));
    audio.src = blobUrl;
    audio.volume = 0.9;
    audio.addEventListener("ended", () => URL.revokeObjectURL(blobUrl), { once: true });
    audio.play().catch(() => URL.revokeObjectURL(blobUrl));
    return true;
  } catch {
    return false;
  }
}

function playRecordedPurr({ mood = "soft" } = {}) {
  if (isMuted || typeof document === "undefined") return false;

  try {
    const audio = document.createElement("audio");
    audio.src = REAL_PURR_SRC;
    audio.volume = mood === "grumpy" ? 0.5 + Math.random() * 0.12 : 0.38 + Math.random() * 0.12;
    audio.playbackRate = 0.92 + Math.random() * 0.16;
    audio.play().catch(() => {
      playGeneratedPurr({ mood });
    });
    return true;
  } catch {
    return false;
  }
}

function playSynthPurr({ mood = "soft" } = {}) {
  const context = ensureAudio();
  if (!context) return false;
  const now = context.currentTime;
  const duration = 0.35 + Math.random() * 0.55;
  const base = mood === "grumpy" ? 42 : 55 + Math.random() * 20;
  const carrier = context.createOscillator();
  const wobble = context.createOscillator();
  const carrierGain = context.createGain();
  const wobbleGain = context.createGain();
  const filter = context.createBiquadFilter();
  const output = context.createGain();

  carrier.type = "sawtooth";
  carrier.frequency.setValueAtTime(base, now);
  carrier.frequency.linearRampToValueAtTime(base + (Math.random() * 10 - 5), now + duration);
  wobble.type = "sine";
  wobble.frequency.setValueAtTime(9 + Math.random() * 9, now);
  wobbleGain.gain.setValueAtTime(5 + Math.random() * 7, now);
  filter.type = "lowpass";
  filter.frequency.setValueAtTime(mood === "grumpy" ? 180 : 240 + Math.random() * 120, now);
  output.gain.setValueAtTime(0.0001, now);
  output.gain.exponentialRampToValueAtTime(mood === "grumpy" ? 0.035 : 0.024, now + 0.05);
  output.gain.exponentialRampToValueAtTime(0.0001, now + duration);

  wobble.connect(wobbleGain);
  wobbleGain.connect(carrier.frequency);
  carrier.connect(carrierGain);
  carrierGain.connect(filter);
  filter.connect(output);
  output.connect(context.destination);

  carrier.start(now);
  wobble.start(now);
  carrier.stop(now + duration + 0.04);
  wobble.stop(now + duration + 0.04);
  return true;
}

function playPurr(options = {}) {
  if (isMuted) return;
  const played = playRecordedPurr(options);
  if (played) return;
  const generated = playGeneratedPurr(options);
  if (!generated) playSynthPurr(options);
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
    mood.textContent = "muted. the cat is judging silently";
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
    mood.textContent = "purr on. the cat is pleased again";
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
    playPurr();
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
  scratchAttack.classList.remove("is-active");
  requestAnimationFrame(() => {
    scratchAttack.classList.add("is-active");
  });
  window.setTimeout(() => {
    scratchAttack.classList.remove("is-active");
  }, 1200);
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

function monthsFromDuration(value, period) {
  const amount = Math.max(1, value);
  return period === "year" ? amount * 12 : amount;
}

function totalExpectedUses(uses, usePeriod, keepValue, keepPeriod) {
  const months = monthsFromDuration(keepValue, keepPeriod);
  return Math.max(0, usesPerMonth(uses, usePeriod) * months);
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

  if (history.length === 0) {
    const empty = document.createElement("li");
    const label = document.createElement("strong");
    const badge = document.createElement("span");
    label.textContent = "No judgments yet";
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
    badge.textContent = entry.score;
    item.append(summary, badge);
    historyList.append(item);
  });
}

function rememberDecision() {
  if (!currentDecision.hasNamedItem) {
    currentDecision.id = null;
    mood.textContent = "name the thing to save this judgment";
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
    feedback: [],
    createdAt: new Date().toISOString(),
  };
  currentDecision.id = entry.id;
  history.unshift(entry);
  saveHistory(history);
}

function updateCurrentFeedback(feedback) {
  if (!currentDecision.hasNamedItem) {
    mood.textContent = "name the thing before teaching the cat";
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
  }

  saveHistory(history);
  mood.textContent = feedback === "regretted" ? "the cat is taking notes" : "memory updated";
}

function calculateDecision({ remember = true, sound = true } = {}) {
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

  const hasBudget = budget > 0;
  const budgetRatio = hasBudget ? price / budget : 0;
  const monthlyUses = usesPerMonth(uses, useFrequency);
  const expectedUses = totalExpectedUses(uses, useFrequency, keepFor, keepPeriod);
  const useScore = Math.min(30, monthlyUses * 3);
  const budgetPenalty = hasBudget ? Math.min(42, budgetRatio * 48) : 0;
  const impulsePenalty = impulseValue * 7;
  const duplicatePenalty = duplicate * 15;
  const priceContext = productPriceContext(item, price, currency);
  const score = Math.round(68 + useScore + priceContext.scoreShift - budgetPenalty - impulsePenalty - duplicatePenalty);
  const normalizedScore = Math.max(0, Math.min(100, score));
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
    feedback: [],
    id: null,
    hasNamedItem: Boolean(itemName),
  };

  budgetBite.textContent = hasBudget ? `${Math.round(budgetRatio * 100)}%` : "Not set";
  costUse.textContent = `${money(perUse, currency)} / use`;
  catScore.textContent = normalizedScore;
  renderContextCard(priceContext);

  let result;
  let message;

  if (priceContext.needsInspection) {
    result = "Needs serious inspection";
    message = `${item} is not a normal checkout decision. The cat will not treat ${money(price, currency)} as a simple bargain until the big risks are verified.`;
  } else if (normalizedScore >= 72) {
    result = "Purrmission granted";
    message = `${item} looks useful enough. The cat allows this purrchase, but still wants the receipt.`;
  } else if (normalizedScore >= 50) {
    result = "Purrhaps wait";
    message = `${item} may be fine, but the cat smells impulse. Revisit it after the mood changes.`;
  } else {
    result = "No purrmission";
    message = `${item} is taking a big bite for the value. The cat recommends closing the tab.`;
    calculator.classList.add("skeptical");
  }

  if (duplicate > 0 && normalizedScore < 78) {
    message += " You already have a similar thing, which makes the cat squint.";
  }

  if (priceContext.message) {
    message += priceContext.message;
  }

  verdict.textContent = result;
  reason.textContent = message;
  currentDecision.verdict = result;
  mood.textContent = normalizedScore >= 72 && !priceContext.needsInspection ? "approved, with supervision" : "judgment has been served";
  rebelButton.hidden = normalizedScore >= 72 && !priceContext.needsInspection;
  negotiation.hidden = normalizedScore >= 72 && !priceContext.needsInspection;
  if (remember) rememberDecision();
  if (sound) {
    playPurr({ mood: normalizedScore >= 72 ? "soft" : "grumpy" });
    scheduleAmbientPurr();
  }
  bounceCat();

  if (hasBudget && budgetRatio > 1) {
    mood.textContent = "budget breach detected";
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

  budgetBite.textContent = hasBudget ? `${Math.round(adjustedBudgetRatio * 100)}%` : "Not set";
  costUse.textContent = `${money(adjustedPerUse, currentDecision.currency)} / use`;
  catScore.textContent = adjustedScore;

  if (adjustedScore >= 72 && (!hasBudget || adjustedBudgetRatio <= 1)) {
    verdict.textContent = "Conditional purrmission";
    reason.textContent = `${currentDecision.item} is allowed if you wait ${waitDays} day${waitDays === 1 ? "" : "s"}, pay no more than ${money(targetPrice, currentDecision.currency)}, and use it ${promisedUsage}. The cat has made a legally fuzzy exception.`;
    currentDecision.verdict = "Conditional purrmission";
    currentDecision.score = adjustedScore;
    mood.textContent = "the cat accepts your terms";
    negotiation.hidden = true;
    rebelButton.hidden = true;
    if (currentDecision.hasNamedItem) rememberDecision();
    playPurr();
    scheduleAmbientPurr();
    bounceCat();
    return;
  }

  verdict.textContent = "Still no purrmission";
  reason.textContent = `The counteroffer improved things, but not enough. The cat wants a lower price, more real use, or a cleaner tradeoff.`;
  mood.textContent = "counteroffer rejected";
  currentDecision.verdict = "Still no purrmission";
  currentDecision.score = adjustedScore;
  rebelButton.hidden = false;
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

impulse.addEventListener("input", updateImpulseLabel);

form.addEventListener("submit", (event) => {
  event.preventDefault();
  calculateDecision();
});

negotiation.addEventListener("submit", calculateNegotiation);

rebelButton.addEventListener("click", () => {
  mood.textContent = "the cat saw that";
  reason.textContent = "You purrchased it anyway. The cat is now emotionally unavailable.";
  updateCurrentFeedback("bought");
  playPurr({ mood: "grumpy" });
  angryScratch();
});

feedbackButtons.forEach((button) => {
  button.addEventListener("click", () => {
    updateCurrentFeedback(button.dataset.feedback);
  });
});

clearHistory.addEventListener("click", () => {
  saveHistory([]);
  mood.textContent = "memory wiped, dignity restored";
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
calculateDecision({ remember: false, sound: false });
setMuted(isMuted, { silent: true });
renderProfile();
renderHistory();
