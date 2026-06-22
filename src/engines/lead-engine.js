// ─── Bridge Leads Engine ─────────────────────────────────────────────────────

window.LEAD_SUITS  = ['♠', '♥', '♦', '♣'];
window.LEAD_RANKS  = ['A', 'K', 'Q', 'J', '10', '9', '8', '7', '6', '5', '4', '3', '2'];
window.LEAD_HONORS = ['A', 'K', 'Q', 'J', '10', '9'];

window.LEAD_SCENARIOS = [
  { bids: [{ seat:'South',call:'1♥' },{ seat:'West',call:'Pass' },{ seat:'North',call:'4♥' },{ seat:'East',call:'Pass' },{ seat:'South',call:'Pass' },{ seat:'West',call:'Pass' }], contract:"4♥ by South", contractType:"suit", trump:"♥", weight:1 },
  { bids: [{ seat:'South',call:'1NT' },{ seat:'West',call:'Pass' },{ seat:'North',call:'3NT' },{ seat:'East',call:'Pass' },{ seat:'South',call:'Pass' },{ seat:'West',call:'Pass' }], contract:"3NT by South", contractType:"notrump", trump:null, weight:1 },
  { bids: [{ seat:'South',call:'1♠' },{ seat:'West',call:'Pass' },{ seat:'North',call:'4♠' },{ seat:'East',call:'Pass' },{ seat:'South',call:'Pass' },{ seat:'West',call:'Pass' }], contract:"4♠ by South", contractType:"suit", trump:"♠", weight:1 },
  { bids: [{ seat:'North',call:'1♦' },{ seat:'East',call:'Pass' },{ seat:'South',call:'1♥' },{ seat:'West',call:'Pass' },{ seat:'North',call:'2♥' },{ seat:'East',call:'Pass' },{ seat:'South',call:'4♥' },{ seat:'West',call:'Pass' },{ seat:'North',call:'Pass' },{ seat:'East',call:'Pass' }], contract:"4♥ by South", contractType:"suit", trump:"♥", weight:5 },
  { bids: [{ seat:'South',call:'1♣' },{ seat:'West',call:'Pass' },{ seat:'North',call:'1♠' },{ seat:'East',call:'Pass' },{ seat:'South',call:'3♠' },{ seat:'West',call:'Pass' },{ seat:'North',call:'4♠' },{ seat:'East',call:'Pass' },{ seat:'South',call:'Pass' },{ seat:'West',call:'Pass' }], contract:"4♠ by North", contractType:"suit", trump:"♠", weight:5 },
  { bids: [{ seat:'South',call:'1♣' },{ seat:'West',call:'Pass' },{ seat:'North',call:'1♦' },{ seat:'East',call:'Pass' },{ seat:'South',call:'1♥' },{ seat:'West',call:'Pass' },{ seat:'North',call:'1♠' },{ seat:'East',call:'Pass' },{ seat:'South',call:'2♠' },{ seat:'West',call:'Pass' },{ seat:'North',call:'4♠' },{ seat:'East',call:'Pass' },{ seat:'South',call:'Pass' },{ seat:'West',call:'Pass' }], contract:"4♠ by South", contractType:"suit", trump:"♠", weight:15 },
  { bids: [{ seat:'North',call:'1♣' },{ seat:'East',call:'Pass' },{ seat:'South',call:'1♥' },{ seat:'West',call:'Pass' },{ seat:'North',call:'1♠' },{ seat:'East',call:'Pass' },{ seat:'South',call:'2♥' },{ seat:'West',call:'Pass' },{ seat:'North',call:'4♥' },{ seat:'East',call:'Pass' },{ seat:'South',call:'Pass' },{ seat:'West',call:'Pass' }], contract:"4♥ by North", contractType:"suit", trump:"♥", weight:15 },
  { bids: [{ seat:'East',call:'1♦' },{ seat:'South',call:'1♥' },{ seat:'West',call:'Pass' },{ seat:'North',call:'4♥' },{ seat:'East',call:'Pass' },{ seat:'South',call:'Pass' },{ seat:'West',call:'Pass' }], contract:"4♥ by North", contractType:"suit", trump:"♥", partnerBid:"♦", weight:30 },
  { bids: [{ seat:'East',call:'1♠' },{ seat:'South',call:'2♥' },{ seat:'West',call:'Pass' },{ seat:'North',call:'4♥' },{ seat:'East',call:'Pass' },{ seat:'South',call:'Pass' },{ seat:'West',call:'Pass' }], contract:"4♥ by North", contractType:"suit", trump:"♥", partnerBid:"♠", weight:30 },
  { bids: [{ seat:'North',call:'1♥' },{ seat:'East',call:'Dbl' },{ seat:'South',call:'4♥' },{ seat:'West',call:'Pass' },{ seat:'North',call:'Pass' },{ seat:'East',call:'Pass' }], contract:"4♥ by South", contractType:"suit", trump:"♥", partnerDoubled:true, weight:35 },
  { bids: [{ seat:'North',call:'1NT' },{ seat:'East',call:'Dbl' },{ seat:'South',call:'3NT' },{ seat:'West',call:'Pass' },{ seat:'North',call:'Pass' },{ seat:'East',call:'Pass' }], contract:"3NT by South", contractType:"notrump", partnerDoubled:true, weight:35 },
];

window.leadGetRandomScenario = leadGetRandomScenario;
function leadGetRandomScenario() {
  const total = LEAD_SCENARIOS.reduce((s, x) => s + x.weight, 0);
  let r = Math.random() * total;
  for (const sc of LEAD_SCENARIOS) { r -= sc.weight; if (r <= 0) return sc; }
  return LEAD_SCENARIOS[LEAD_SCENARIOS.length - 1];
}

window.leadGenerateHand = leadGenerateHand;
function leadGenerateHand(scenario) {
  const hand = { "♠":[], "♥":[], "♦":[], "♣":[] };
  const trump = scenario ? scenario.trump : null;
  let remaining = 13;
  const dist = {};
  const shuffle = arr => [...arr].sort(() => Math.random() - 0.5);
  if (trump) {
    dist[trump] = Math.floor(Math.random() * 3) + 1;
    remaining -= dist[trump];
    const others = shuffle(LEAD_SUITS.filter(s => s !== trump));
    for (let i = 0; i < others.length - 1; i++) {
      const max = Math.min(7, remaining - (others.length - i - 1) * 2);
      const min = Math.max(2, remaining - (others.length - i - 1) * 7);
      dist[others[i]] = Math.max(0, Math.floor(Math.random() * (max - min + 1)) + min);
      remaining -= dist[others[i]];
    }
    dist[others[others.length - 1]] = Math.max(0, remaining);
  } else {
    const sh = shuffle(LEAD_SUITS);
    for (let i = 0; i < sh.length - 1; i++) {
      const max = Math.min(7, remaining - (sh.length - i - 1) * 2);
      const min = Math.max(2, remaining - (sh.length - i - 1) * 7);
      dist[sh[i]] = Math.floor(Math.random() * (max - min + 1)) + min;
      remaining -= dist[sh[i]];
    }
    dist[sh[sh.length - 1]] = remaining;
  }
  LEAD_SUITS.forEach(s => {
    const n = Math.max(0, dist[s] || 0);
    hand[s] = [...LEAD_RANKS].sort(() => Math.random() - 0.5).slice(0, n)
      .sort((a, b) => LEAD_RANKS.indexOf(a) - LEAD_RANKS.indexOf(b));
  });
  return hand;
}

window.leadGetHonorSeqs = leadGetHonorSeqs;
function leadGetHonorSeqs(hand, suit) {
  const hons = hand[suit].filter(c => LEAD_HONORS.includes(c));
  if (hons.length < 2) return [];
  const seqs = []; let cur = [hons[0]];
  for (let i = 0; i < hons.length - 1; i++) {
    if (LEAD_RANKS.indexOf(hons[i+1]) === LEAD_RANKS.indexOf(hons[i]) + 1) { cur.push(hons[i+1]); }
    else { if (cur.length >= 2) seqs.push([...cur]); cur = [hons[i+1]]; }
  }
  if (cur.length >= 2) seqs.push(cur);
  return seqs;
}

window.leadGetFullSeq = leadGetFullSeq;
function leadGetFullSeq(hand, suit) {
  const s = leadGetHonorSeqs(hand, suit).filter(x => x.length >= 3);
  return s.length ? s.reduce((b, x) => x.length > b.length ? x : b, s[0]) : null;
}

window.leadGetPartialSeq = leadGetPartialSeq;
function leadGetPartialSeq(hand, suit) {
  const s = leadGetHonorSeqs(hand, suit).filter(x => x.length === 2);
  return s.length ? s[0] : null;
}

window.leadGetBestSeq = leadGetBestSeq;
function leadGetBestSeq(hand, suit) { return leadGetFullSeq(hand, suit) || leadGetPartialSeq(hand, suit); }

window.leadGetStrategy = leadGetStrategy;
function leadGetStrategy(scenario, hand) {
  const hcp = LEAD_SUITS.reduce((h, s) => h + hand[s].reduce((x, c) => x + ({A:4,K:3,Q:2,J:1}[c]||0), 0), 0);
  if (scenario.contractType === "notrump") return { strategy:"active", reason:"Against NT, race to establish your long suit before declarer sets up theirs.", priority:"Lead your longest/strongest suit" };
  if (hcp < 8) return { strategy:"active", reason:"With a weak hand, lead actively — attack before declarer sets up tricks.", priority:"Lead from honors (sequences, partner's suit) to establish tricks quickly" };
  if (scenario.partnerBid || scenario.partnerDoubled) return { strategy:"active", reason:"Partner showed strength — lead actively.", priority: scenario.partnerBid ? `Lead partner's ${scenario.partnerBid} suit` : "Lead aggressively (A-K, singleton for ruff)" };
  const trumpLen = scenario.trump ? hand[scenario.trump].length : 0;
  if (hcp >= 10 || trumpLen >= 4) return { strategy:"passive", reason: hcp >= 10 ? "With defensive strength, lead safely — let declarer do the work." : "With trump length, lead passively — you control the hand.", priority:"Safe leads: sequences (10-9), worthless suits, avoid giving away tricks" };
  return { strategy:"balanced", reason:"Normal hand — balance between safety and aggression.", priority:"Lead solid sequences or safe suits" };
}

window.leadGetBestLead = leadGetBestLead;
function leadGetBestLead(hand, excludeSuit, scenario) {
  const trump = scenario ? scenario.trump : null;
  const strat = scenario ? leadGetStrategy(scenario, hand) : null;
  const isActive = strat && strat.strategy === "active";
  const isPassive = strat && strat.strategy === "passive";
  for (const s of LEAD_SUITS) {
    if (s === excludeSuit || s === trump) continue;
    if (hand[s].length >= 2 && hand[s][0] === "A" && hand[s][1] === "K") return { suit:s, card:"A", reason:`top of A-K sequence in ${s}` };
  }
  if (isActive) {
    for (const s of LEAD_SUITS) {
      if (s === excludeSuit || s === trump) continue;
      const seq = leadGetBestSeq(hand, s);
      if (seq && seq.length >= 2 && hand[s].length >= 3) {
        if (hand[s].includes("A") && !hand[s].includes("K") && seq[0] !== "A") continue;
        return { suit:s, card:seq[0], reason:`top of ${seq.join("-")} sequence in ${s} (active)` };
      }
    }
  }
  if (isPassive) {
    const safe = [];
    for (const s of LEAD_SUITS) {
      if (s === excludeSuit || s === trump) continue;
      const seq = leadGetBestSeq(hand, s);
      if (seq && !hand[s].includes("A") && !hand[s].includes("K")) safe.push({ suit:s, card:seq[0], reason:`safe ${seq.join("-")} sequence in ${s}` });
      if (!hand[s].some(c => ["A","K","Q","J","10"].includes(c)) && hand[s].length >= 3) safe.push({ suit:s, card:hand[s][0], reason:`worthless suit ${s} (passive)` });
    }
    if (safe.length) return safe.reduce((b, c) => hand[c.suit].length > hand[b.suit].length ? c : b);
  }
  let bestScore = -1, bestResult = null;
  for (const s of LEAD_SUITS) {
    if (s === excludeSuit || s === trump) continue;
    const seq = leadGetBestSeq(hand, s);
    if (seq) {
      if (hand[s].includes("A") && !hand[s].includes("K") && seq[0] !== "A") continue;
      const score = seq.length * 10 + hand[s].length;
      if (score > bestScore) { bestScore = score; bestResult = { suit:s, card:seq[0], reason:`top of ${seq.join("-")} sequence in ${s}` }; }
    }
  }
  if (bestResult) return bestResult;
  let cands = LEAD_SUITS.filter(s => s !== excludeSuit && s !== trump && !(hand[s].includes("A") && !hand[s].includes("K")));
  if (!cands.length) { const na = LEAD_SUITS.filter(s => s !== trump && !hand[s].includes("A")); cands = na.length ? na : LEAD_SUITS.filter(s => s !== trump); }
  const scoreS = s => { const c=hand[s]; const h=c.some(x=>LEAD_HONORS.includes(x)); if(c.length>=4) return 100+c.length; if(c.length===3&&h) return 80; if(c.length===3&&!h) return 60; if(c.length===2&&!h) return 40; if(c.length===2&&h) return 10; return 20; };
  const best = cands.reduce((a, b) => scoreS(a) > scoreS(b) ? a : b);
  const cards = hand[best];
  const hasHon = cards.some(c => LEAD_HONORS.includes(c));
  const is3Hon = cards.length === 3 && hasHon;
  const lc = is3Hon ? cards[cards.length-1] : cards.length >= 4 ? cards[3] : cards[0];
  const desc = is3Hon ? "lowest from 3 to an honor" : cards.length >= 4 ? "4th best" : "top card";
  return { suit:best, card:lc, reason:`${desc} from ${best} (${cards.join(" ")})` };
}

window.leadEvaluate = leadEvaluate;
function leadEvaluate(card, suit, hand, scenario) {
  const sc = hand[suit];
  let fb = { correct:false, message:"" };
  const trump = scenario.trump;
  const fullSeq = leadGetFullSeq(hand, suit);
  const partSeq = leadGetPartialSeq(hand, suit);
  const hasAK = sc.length >= 2 && sc[0]==="A" && sc[1]==="K";
  const hasAKQ = hasAK && sc.length >= 3 && sc[2]==="Q";
  const hasAKJ = hasAK && sc.length >= 3 && sc[2]==="J";
  const nearSeq = (() => {
    const h = sc.filter(c => LEAD_HONORS.includes(c));
    if (h.length < 2) return null;
    const i0=LEAD_RANKS.indexOf(h[0]), i1=LEAD_RANKS.indexOf(h[1]);
    if (i1 !== i0+1) return null;
    if (sc.length >= 3) { const i2=LEAD_RANKS.indexOf(sc[2]); if(i2===i0+2) return [h[0],h[1],sc[2]]; }
    return null;
  })();

  if (scenario.contractType === "notrump") {
    const longest = LEAD_SUITS.reduce((a,b) => hand[a].length > hand[b].length ? a : b);
    if (suit !== longest) { const b=leadGetBestLead(hand,null,scenario); fb.message=`✗ RECOMMENDED: ${b.suit}${b.card}

Lead your longest suit against NT. ${b.reason}.`; return fb; }
    let recCard, recReason;
    if (hasAKQ||hasAKJ) { recCard="A"; recReason=hasAKQ?"A-K-Q solid sequence — lead the A":"A-K-J near sequence — lead the A"; }
    else if (hasAK) { recCard=sc.length>=4?sc[3]:sc[0]; recReason="A-K without Q/J — lead 4th best"; }
    else if (fullSeq) { recCard=fullSeq[0]; recReason=`${fullSeq.join("-")} full sequence — lead top`; }
    else if (nearSeq) { recCard=nearSeq[0]; recReason=`${nearSeq.join("-")} near sequence — lead top`; }
    else if (partSeq && partSeq[0]!=="A") { recCard=partSeq[0]; recReason=`${partSeq.join("-")} partial sequence`; }
    else { recCard=sc.length>=4?sc[3]:sc[0]; recReason=sc.length>=4?"4th best — standard NT lead":"top card (fewer than 4)"; }
    const alt = partSeq && sc.length>=4 ? sc[3] : null;
    if (card===recCard||(alt&&card===alt)) { fb.correct=true; fb.message=`✓ Correct! ${suit}${card} — ${recReason}.

Your ${suit}: ${sc.join(" ")}`; }
    else { fb.message=`✗ RECOMMENDED: ${suit}${recCard}

${recReason}.

Your ${suit}: ${sc.join(" ")}`; }
    return fb;
  }

  if (suit === trump) {
    const b=leadGetBestLead(hand,suit,scenario);
    fb.message=`✗ RECOMMENDED: ${b.suit}${b.card}

${sc.length===1?"Never lead a singleton trump!":"Leading trump is almost never correct against a suit contract."} ${b.reason}.`;
    return fb;
  }

  if (scenario.partnerDoubled) {
    const akS=LEAD_SUITS.filter(s=>s!==trump&&hand[s].length>=2&&hand[s][0]==="A"&&hand[s][1]==="K");
    if (akS.length) { const bak=akS[0]; if(suit===bak&&card==="A"){fb.correct=true;fb.message=`✓ Excellent! Partner doubled. A from A-K — cash tricks and see dummy.

Your ${suit}: ${sc.join(" ")}`;}else{fb.message=`✗ RECOMMENDED: ${bak}A

Partner doubled. Lead A from A-K.`;}return fb; }
    const sings=LEAD_SUITS.filter(s=>s!==trump&&hand[s].length===1);
    if (sings.length) { const sg=sings[0]; if(suit===sg){fb.correct=true;fb.message=`✓ Excellent! Singleton ${suit}${card} for a potential ruff.

Your ${suit}: ${sc.join(" ")}`;}else{fb.message=`✗ RECOMMENDED: ${sg}${hand[sg][0]}

Partner doubled — lead singleton for a potential ruff.`;}return fb; }
    const b=leadGetBestLead(hand,null,scenario); if(suit===b.suit&&card===b.card){fb.correct=true;fb.message=`✓ Good! Partner doubled. ${b.reason}.

Your ${suit}: ${sc.join(" ")}`;}else{fb.message=`✗ RECOMMENDED: ${b.suit}${b.card}

Partner doubled. ${b.reason}.`;}return fb;
  }

  const bsq = leadGetBestSeq(hand, suit);
  const seqBelowAce = bsq && sc.includes("A") && bsq[0] !== "A";
  if (bsq && !seqBelowAce) {
    if(card===bsq[0]){fb.correct=true;fb.message=`✓ Perfect! ${suit}${card} — top of your ${bsq.join("-")} sequence.

Your ${suit}: ${sc.join(" ")}`;}
    else{fb.message=`✗ RECOMMENDED: ${suit}${bsq[0]}

You have a ${bsq.join("-")} sequence — lead the top card.

Your ${suit}: ${sc.join(" ")}`;}
    return fb;
  }
  if (seqBelowAce) { const b=leadGetBestLead(hand,suit,scenario); fb.message=`✗ RECOMMENDED: ${b.suit}${b.card}

Don't underlead an Ace even with a sequence. Lead from a different suit.

Your ${suit}: ${sc.join(" ")}`; return fb; }
  if (sc.includes("A") && !sc.includes("K")) {
    if(scenario.partnerBid===suit&&card==="A"){fb.correct=true;fb.message=`✓ Excellent! Partner bid ${suit} — leading ${suit}A is correct here.

Your ${suit}: ${sc.join(" ")}`;return fb;}
    if(sc.length===1&&card==="A"){fb.correct=true;fb.message=`✓ Singleton ${suit}A — only choice!

Your ${suit}: ${sc.join(" ")}`;return fb;}
    const nts=LEAD_SUITS.filter(s=>s!==trump); const allAN=nts.every(s=>hand[s].includes("A")&&!hand[s].includes("K")||hand[s].length===0);
    if(allAN){const sh=nts.reduce((a,b)=>hand[a].length<hand[b].length?a:b);if(suit===sh&&card==="A"){fb.correct=true;fb.message=`✓ Correct! All suits have Aces but no King — lead Ace from shortest.

Your ${suit}: ${sc.join(" ")}`;}else{fb.message=`✗ RECOMMENDED: ${sh}A

With Aces everywhere, lead Ace from your shortest suit.`;}return fb;}
    if(card==="A"){const b=leadGetBestLead(hand,suit,scenario);fb.message=`✗ RECOMMENDED: ${b.suit}${b.card}

NEVER underlead an Ace against a suit contract. ${b.reason}.`;return fb;}
    const b=leadGetBestLead(hand,suit,scenario);fb.message=`✗ RECOMMENDED: ${b.suit}${b.card}

Don't lead from Ace-without-King. ${b.reason}.`;return fb;
  }
  if (sc.includes("A")&&sc.includes("K")){if(card==="A"||card==="K"){fb.correct=true;fb.message=`✓ Good! Leading ${suit}${card} from A-K.

Your ${suit}: ${sc.join(" ")}`;}else{fb.message=`✗ RECOMMENDED: ${suit}A

With A-K in ${suit}, lead the Ace.

Your ${suit}: ${sc.join(" ")}`;}return fb;}
  const hasHon=sc.some(c=>LEAD_HONORS.includes(c)); const is3Hon=sc.length===3&&hasHon;
  if(sc.length>=4){fb.correct=true;fb.message=`✓ ${card===sc[3]?"4th best — correct!":"Reasonable lead from this long suit."} ${suit}: ${sc.join(" ")}`;return fb;}
  if(is3Hon){const low=sc[sc.length-1];if(card===low){fb.correct=true;fb.message=`✓ Correct! Lowest from 3 to an honor.

Your ${suit}: ${sc.join(" ")}`;}else{fb.message=`✗ RECOMMENDED: ${suit}${low}

From 3 cards to an honor, lead the lowest.

Your ${suit}: ${sc.join(" ")}`;}return fb;}
  if(sc.length===2){if(!hasHon){if(card===sc[0]){fb.correct=true;fb.message=`✓ Top of doubleton.

Your ${suit}: ${sc.join(" ")}`;}else{fb.message=`✗ RECOMMENDED: ${suit}${sc[0]}

Lead top of doubleton.

Your ${suit}: ${sc.join(" ")}`;}return fb;}
    const b=leadGetBestLead(hand,suit,scenario);if(b.suit===suit&&b.card===card){fb.correct=true;fb.message=`✓ Acceptable. Doubleton honor.

Your ${suit}: ${sc.join(" ")}`;}else{fb.message=`✗ RECOMMENDED: ${b.suit}${b.card}

Doubleton honor is risky. ${b.reason}.`;}return fb;}
  const b=leadGetBestLead(hand,suit,scenario);fb.message=`✗ RECOMMENDED: ${b.suit}${b.card}

Short suits are risky leads. ${b.reason}.`;return fb;
}
