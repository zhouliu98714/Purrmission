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

const STORAGE_KEY = "purrmission-history";

let currentDecision = {
  item: "this",
  price: 0,
  budget: 0,
  uses: 0,
  score: 0,
  budgetRatio: 0,
  verdict: "Wait 72 hours",
  feedback: [],
  id: null,
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
      ["Wait 72 hours", "Skip for now", "Still no"].includes(entry.verdict),
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
  if (!currentDecision.id) return;
  const history = loadHistory();
  const entry = history.find((item) => item.id === currentDecision.id);
  if (!entry) return;

  if (!entry.feedback.includes(feedback)) {
    entry.feedback.push(feedback);
  }

  saveHistory(history);
  mood.textContent = feedback === "regretted" ? "the cat is taking notes" : "memory updated";
}

function calculateDecision({ remember = true } = {}) {
  const item = document.querySelector("#item").value.trim() || "this";
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
  };

  budgetBite.textContent = budget > 0 ? `${Math.round(budgetRatio * 100)}%` : "No budget";
  costUse.textContent = `${money(perUse)} / use`;
  catScore.textContent = normalizedScore;

  let result;
  let message;

  if (normalizedScore >= 72) {
    result = "Buy it";
    message = `${item} looks useful enough. The cat allows the purchase, but still wants the receipt.`;
  } else if (normalizedScore >= 50) {
    result = "Wait 72 hours";
    message = `${item} may be fine, but the cat smells impulse. Revisit it after the mood changes.`;
  } else {
    result = "Skip for now";
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
  const tradeoff = Number(document.querySelector("#tradeoff").value);
  const priceDrop = currentDecision.price > 0 ? Math.max(0, currentDecision.price - targetPrice) : 0;
  const priceDropRatio = currentDecision.price > 0 ? priceDrop / currentDecision.price : 0;
  const extraUses = Math.max(0, promisedUses - currentDecision.uses);
  const waitBonus = Math.min(18, waitDays * 3);
  const priceBonus = Math.min(22, Math.round(priceDropRatio * 42));
  const useBonus = Math.min(18, extraUses * 2);
  const adjustedScore = Math.max(
    0,
    Math.min(100, currentDecision.score + waitBonus + priceBonus + useBonus + tradeoff),
  );
  const adjustedBudgetRatio = currentDecision.budget > 0 ? targetPrice / currentDecision.budget : 1.4;
  const adjustedPerUse = promisedUses > 0 ? targetPrice / promisedUses : targetPrice;

  budgetBite.textContent = currentDecision.budget > 0 ? `${Math.round(adjustedBudgetRatio * 100)}%` : "No budget";
  costUse.textContent = `${money(adjustedPerUse)} / use`;
  catScore.textContent = adjustedScore;

  if (adjustedScore >= 72 && adjustedBudgetRatio <= 1) {
    verdict.textContent = "Conditional yes";
    reason.textContent = `${currentDecision.item} is allowed if you wait ${waitDays} day${waitDays === 1 ? "" : "s"}, pay no more than ${money(targetPrice)}, and actually use it. The cat has made a legally fuzzy exception.`;
    currentDecision.verdict = "Conditional yes";
    currentDecision.score = adjustedScore;
    mood.textContent = "the cat accepts your terms";
    negotiation.hidden = true;
    rebelButton.hidden = true;
    rememberDecision();
    bounceCat();
    return;
  }

  verdict.textContent = "Still no";
  reason.textContent = `The counteroffer improved things, but not enough. The cat wants a lower price, more real use, or a cleaner tradeoff.`;
  mood.textContent = "counteroffer rejected";
  currentDecision.verdict = "Still no";
  currentDecision.score = adjustedScore;
  rebelButton.hidden = false;
  calculator.classList.add("skeptical");
  rememberDecision();

  if (adjustedBudgetRatio > 1) {
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
  reason.textContent = "You bought it anyway. The cat is now emotionally unavailable.";
  updateCurrentFeedback("bought");
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
});

updateImpulseLabel();
calculateDecision({ remember: false });
renderProfile();
renderHistory();
