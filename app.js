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
const rebelButton = document.querySelector("#rebel-button");
const scratchAttack = document.querySelector("#scratch-attack");
const negotiation = document.querySelector("#negotiation");
const catPersona = document.querySelector("#cat-persona");
const personaNote = document.querySelector("#persona-note");
const historyList = document.querySelector("#history-list");
const clearHistory = document.querySelector("#clear-history");
const feedbackButtons = document.querySelectorAll("[data-feedback]");
const soundToggle = document.querySelector("#sound-toggle");

const STORAGE_KEY = "purrmission-history";
const SOUND_KEY = "purrmission-muted";

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
  feedback: [],
  id: null,
  hasNamedItem: false,
};

const impulseNames = {
  1: "Calm",
  2: "Curious",
  3: "Medium",
  4: "Itchy paws",
  5: "Dopamine sprint",
};

function money(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: value >= 10 ? 0 : 2,
  }).format(value);
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
  const duration = 0.45 + Math.random() * 0.45;
  const sampleCount = Math.floor(sampleRate * duration);
  const bytesPerSample = 2;
  const dataSize = sampleCount * bytesPerSample;
  const buffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(buffer);
  const base = mood === "grumpy" ? 92 + Math.random() * 18 : 74 + Math.random() * 22;
  const wobble = 8 + Math.random() * 9;
  const volume = mood === "grumpy" ? 0.2 : 0.16;

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
    const pulse = 0.55 + 0.45 * Math.sin(2 * Math.PI * wobble * time);
    const wave =
      Math.sin(2 * Math.PI * base * time) * 0.54 +
      Math.sin(2 * Math.PI * base * 1.92 * time) * 0.26 +
      Math.sin(2 * Math.PI * base * 2.7 * time) * 0.14 +
      (Math.random() * 2 - 1) * 0.03;
    const sample = Math.max(-1, Math.min(1, wave * pulse * envelope * volume));
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
    audio.volume = 0.72;
    audio.addEventListener("ended", () => URL.revokeObjectURL(blobUrl), { once: true });
    audio.play().catch(() => URL.revokeObjectURL(blobUrl));
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
  const played = playGeneratedPurr(options);
  if (!played) playSynthPurr(options);
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
  soundToggle.textContent = isMuted ? "purr off" : "purr on";
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
    summary.append(name, `${entry.verdict} · ${money(entry.price)} · ${feedback}`);
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
  const duplicate = Number(document.querySelector("#duplicate").value);
  const impulseValue = Number(impulse.value);

  const budgetRatio = budget > 0 ? price / budget : 1.4;
  const useScore = Math.min(30, uses * 3);
  const budgetPenalty = Math.min(42, budgetRatio * 48);
  const impulsePenalty = impulseValue * 7;
  const duplicatePenalty = duplicate * 15;
  const score = Math.round(68 + useScore - budgetPenalty - impulsePenalty - duplicatePenalty);
  const normalizedScore = Math.max(0, Math.min(100, score));
  const perUse = uses > 0 ? price / uses : price;

  currentDecision = {
    item,
    price,
    budget,
    uses,
    score: normalizedScore,
    budgetRatio,
    verdict: "",
    feedback: [],
    id: null,
    hasNamedItem: Boolean(itemName),
  };

  budgetBite.textContent = budget > 0 ? `${Math.round(budgetRatio * 100)}%` : "No budget";
  costUse.textContent = `${money(perUse)} / use`;
  catScore.textContent = normalizedScore;

  let result;
  let message;

  if (normalizedScore >= 72) {
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

  verdict.textContent = result;
  reason.textContent = message;
  currentDecision.verdict = result;
  mood.textContent = normalizedScore >= 72 ? "approved, with supervision" : "judgment has been served";
  rebelButton.hidden = normalizedScore >= 72;
  negotiation.hidden = normalizedScore >= 72;
  if (remember) rememberDecision();
  if (sound) {
    playPurr({ mood: normalizedScore >= 72 ? "soft" : "grumpy" });
    scheduleAmbientPurr();
  }
  bounceCat();

  if (budgetRatio > 1) {
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
  const adjustedBudgetRatio = currentDecision.budget > 0 ? targetPrice / currentDecision.budget : 1.4;
  const adjustedPerUse = promisedUses > 0 ? targetPrice / promisedUses : targetPrice;
  const promisedUsage = usageLabel(promisedUses, usePeriod);

  budgetBite.textContent = currentDecision.budget > 0 ? `${Math.round(adjustedBudgetRatio * 100)}%` : "No budget";
  costUse.textContent = `${money(adjustedPerUse)} / use`;
  catScore.textContent = adjustedScore;

  if (adjustedScore >= 72 && adjustedBudgetRatio <= 1) {
    verdict.textContent = "Conditional purrmission";
    reason.textContent = `${currentDecision.item} is allowed if you wait ${waitDays} day${waitDays === 1 ? "" : "s"}, pay no more than ${money(targetPrice)}, and use it ${promisedUsage}. The cat has made a legally fuzzy exception.`;
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

  if (adjustedBudgetRatio > 1) {
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

updateImpulseLabel();
setMuted(isMuted, { silent: true });
calculateDecision({ remember: false, sound: false });
renderProfile();
renderHistory();
