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

let currentDecision = {
  item: "this",
  price: 0,
  budget: 0,
  uses: 0,
  score: 0,
  budgetRatio: 0,
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

function calculateDecision() {
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
  mood.textContent = normalizedScore >= 72 ? "approved, with supervision" : "judgment has been served";
  rebelButton.hidden = normalizedScore >= 72;
  negotiation.hidden = normalizedScore >= 72;
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
    mood.textContent = "the cat accepts your terms";
    negotiation.hidden = true;
    rebelButton.hidden = true;
    bounceCat();
    return;
  }

  verdict.textContent = "Still no";
  reason.textContent = `The counteroffer improved things, but not enough. The cat wants a lower price, more real use, or a cleaner tradeoff.`;
  mood.textContent = "counteroffer rejected";
  rebelButton.hidden = false;
  calculator.classList.add("skeptical");

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
  angryScratch();
});

updateImpulseLabel();
calculateDecision();
