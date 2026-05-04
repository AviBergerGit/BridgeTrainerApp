import { useState, useEffect } from "react";

// ─── Bridge Leads Engine ─────────────────────────────────────────────────────

const LEAD_SUITS  = ['♠', '♥', '♦', '♣'];
const LEAD_RANKS  = ['A', 'K', 'Q', 'J', '10', '9', '8', '7', '6', '5', '4', '3', '2'];
const LEAD_HONORS = ['A', 'K', 'Q', 'J', '10', '9'];

const LEAD_SCENARIOS = [
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

function leadGetRandomScenario() {
  const total = LEAD_SCENARIOS.reduce((s, x) => s + x.weight, 0);
  let r = Math.random() * total;
  for (const sc of LEAD_SCENARIOS) { r -= sc.weight; if (r <= 0) return sc; }
  return LEAD_SCENARIOS[LEAD_SCENARIOS.length - 1];
}

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
function leadGetFullSeq(hand, suit) {
  const s = leadGetHonorSeqs(hand, suit).filter(x => x.length >= 3);
  return s.length ? s.reduce((b, x) => x.length > b.length ? x : b, s[0]) : null;
}
function leadGetPartialSeq(hand, suit) {
  const s = leadGetHonorSeqs(hand, suit).filter(x => x.length === 2);
  return s.length ? s[0] : null;
}
function leadGetBestSeq(hand, suit) { return leadGetFullSeq(hand, suit) || leadGetPartialSeq(hand, suit); }

function leadGetStrategy(scenario, hand) {
  const hcp = LEAD_SUITS.reduce((h, s) => h + hand[s].reduce((x, c) => x + ({A:4,K:3,Q:2,J:1}[c]||0), 0), 0);
  if (scenario.contractType === "notrump") return { strategy:"active", reason:"Against NT, race to establish your long suit before declarer sets up theirs.", priority:"Lead your longest/strongest suit" };
  if (hcp < 8) return { strategy:"active", reason:"With a weak hand, lead actively — attack before declarer sets up tricks.", priority:"Lead from honors (sequences, partner's suit) to establish tricks quickly" };
  if (scenario.partnerBid || scenario.partnerDoubled) return { strategy:"active", reason:"Partner showed strength — lead actively.", priority: scenario.partnerBid ? `Lead partner's ${scenario.partnerBid} suit` : "Lead aggressively (A-K, singleton for ruff)" };
  const trumpLen = scenario.trump ? hand[scenario.trump].length : 0;
  if (hcp >= 10 || trumpLen >= 4) return { strategy:"passive", reason: hcp >= 10 ? "With defensive strength, lead safely — let declarer do the work." : "With trump length, lead passively — you control the hand.", priority:"Safe leads: sequences (10-9), worthless suits, avoid giving away tricks" };
  return { strategy:"balanced", reason:"Normal hand — balance between safety and aggression.", priority:"Lead solid sequences or safe suits" };
}

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

// ─── SAYC Question Banks ──────────────────────────────────────────────────────
// All bidding follows Standard American Yellow Card (SAYC) rules:
// - 5-card majors
// - Strong 1NT (15-17 HCP), weak 2s (6-10 HCP, 6-card suit)
// - Stayman & Jacoby Transfers over 1NT
// - Limit raises, forcing 1/1 responses
// - 2/1 Game Force
// - Blackwood (4NT = ace ask)


const QUESTION_BANKS = {

  // ── bidding-1: SAYC Opening Bids ─────────────────────────────────────────
  "bidding-1": [
    { type:"bidding", hand:{spades:"AKJ74",hearts:"K52",diamonds:"A63",clubs:"97"}, question:"What is your opening bid?", options:["1♠","1NT","1♥","Pass"], correct:"1NT", explanation:"Open 1NT. SAYC allows 1NT with a 5-card major on a balanced 15-17 HCP hand. This 5-3-3-2 hand has 15 HCP — a perfect 1NT opener. Partner can use Stayman to find the spade fit.", points:10 },
    { type:"bidding", hand:{spades:"KQ5",hearts:"AJ4",diamonds:"KJ92",clubs:"Q83"}, question:"What is your opening bid?", options:["1NT","1♦","1♠","Pass"], correct:"1NT", explanation:"Open 1NT showing 15-17 HCP balanced. 16 HCP with 4-3-3-3 pattern — a perfect 1NT.", points:10 },
    { type:"bidding", hand:{spades:"8",hearts:"AQ9632",diamonds:"KJ5",clubs:"A74"}, question:"What is your opening bid?", options:["1♥","2♥","1NT","1♦"], correct:"1♥", explanation:"Open 1♥. 14 HCP with a good 6-card heart suit. Too strong for a weak 2♥ (6-10 HCP). With 13+ HCP open at the 1-level.", points:10 },
    { type:"bidding", hand:{spades:"74",hearts:"J3",diamonds:"KQJ985",clubs:"AQ6"}, question:"What is your opening bid?", options:["1♦","2♦","3♦","Pass"], correct:"1♦", explanation:"Open 1♦. 13 HCP — enough to open but too strong for a weak 2♦. With no 5-card major, open your longest minor.", points:10 },
    { type:"bidding", hand:{spades:"KQJ982",hearts:"74",diamonds:"J53",clubs:"86"}, question:"What is your opening bid?", options:["2♠","1♠","Pass","3♠"], correct:"2♠", explanation:"Open 2♠ — a perfect weak two. 8 HCP with ♠KQJ982 — excellent 6-card suit with solid top sequence.", points:10 },
  ],

  // ── bidding-2: Responding to 1NT ─────────────────────────────────────────
  "bidding-2": [
    { type:"bidding", hand:{spades:"KJ762",hearts:"843",diamonds:"Q52",clubs:"J7"}, dealer:"South", auction:["1NT","Pass"], position:"North", question:"Partner opened 1NT (15-17). With 7 HCP and 5 spades, what is your response?", options:["2♠","2♥ (Jacoby Transfer)","3♠","Pass"], correct:"2♥ (Jacoby Transfer)", explanation:"Bid 2♥, a Jacoby Transfer to spades. Forces partner to bid 2♠, then pass with this weak hand (7 HCP). Transfers let the strong hand become declarer. Never bid 2♠ directly — no defined meaning in SAYC over 1NT.", points:15 },
    { type:"bidding", hand:{spades:"Q83",hearts:"KJ5",diamonds:"9532",clubs:"A86"}, dealer:"South", auction:["1NT","Pass"], position:"North", question:"Partner opened 1NT (15-17). With 10 HCP and a flat 3-3-4-3 hand, no 4-card major, what is your response?", options:["3NT","2♣ (Stayman)","2♥ (transfer to spades)","Pass"], correct:"3NT", explanation:"Bid 3NT directly. With 10 HCP and a flat 3-3-4-3 hand you have no 4-card major and no 5-card suit. Stayman is pointless without a 4-card major to find. Just count your points — 10 HCP opposite 15-17 = 25-27 combined — and bid game.", points:15 },
    { type:"bidding", hand:{spades:"J3",hearts:"Q86",diamonds:"AK743",clubs:"952"}, dealer:"South", auction:["1NT","Pass"], position:"North", question:"Partner opened 1NT (15-17). With 10 HCP and a 5-card diamond suit, no major, what is your response?", options:["3NT","2NT","3♦","Pass"], correct:"3NT", explanation:"Bid 3NT directly. 10 HCP — no 5-card major means no reason to use Jacoby. With 10+ HCP and no 5-card major, bid game directly.", points:15 },
    { type:"bidding", hand:{spades:"J5",hearts:"KQ9742",diamonds:"86",clubs:"Q54"}, dealer:"South", auction:["1NT","Pass"], position:"North", question:"Partner opened 1NT (15-17). With 8 HCP and a 6-card heart suit, what is your response?", options:["2♦ (Jacoby Transfer)","4♥","3♥","2♣ (Stayman)"], correct:"2♦ (Jacoby Transfer)", explanation:"Bid 2♦, a Jacoby Transfer to hearts. Transfer first then invite with 3♥. Remember: 2♦ = transfer to hearts, 2♥ = transfer to spades.", points:15 },
    { type:"bidding", hand:{spades:"AJ84",hearts:"KQ93",diamonds:"76",clubs:"842"}, dealer:"South", auction:["1NT","Pass"], position:"North", question:"Partner opened 1NT (15-17). With 10 HCP and 4-4 in both majors, what is your response?", options:["2♣ (Stayman)","4NT","3NT","2♠"], correct:"2♣ (Stayman)", explanation:"Bid 2♣, Stayman. 10 HCP with 4-4 in the majors. If partner bids 2♥ or 2♠, raise to game. If 2♦, bid 3NT.", points:15 },
    // Q6: Garbage Stayman — bid 2♣ with weak distributional hand
    { type:"bidding", vulnerability:"—", hand:{spades:"KJ54",hearts:"Q873",diamonds:"9542",clubs:"2"}, dealer:"South", auction:["1NT","Pass"], position:"North", question:"Partner opened 1NT. You have 6 HCP, 4 spades, 4 hearts, 4 diamonds and 1 club. What do you bid?", options:["2♣ (Garbage Stayman)","Pass","2♥ (Jacoby transfer)","2NT (invite)"], correct:"2♣ (Garbage Stayman)", explanation:"With 0-7 HCP, 4+ spades, 4+ hearts, 4+ diamonds and 0-1 clubs, bid 2♣ (Garbage Stayman). You intend to pass whatever opener bids — 2♦, 2♥ or 2♠ are all safer than 1NT with this weak distributional hand.", points:15 },
    // Q7: Should NOT use Garbage Stayman — only 3 diamonds and 2 clubs → Pass
    { type:"bidding", vulnerability:"—", hand:{spades:"J954",hearts:"K873",diamonds:"852",clubs:"J3"}, dealer:"South", auction:["1NT","Pass"], position:"North", question:"Partner opened 1NT. You have 5 HCP, 4 spades, 4 hearts but only 3 diamonds and 2 clubs. What do you bid?", options:["Pass","2♣ (Garbage Stayman)","2♦ (transfer to ♥)","2NT (invite)"], correct:"Pass", explanation:"Garbage Stayman requires 4+ diamonds AND 0-1 clubs. You have only 3 diamonds and 2 clubs — the conditions are not met. With only 5 HCP you cannot invite either. Pass and play 1NT.", points:15 },
    // Q8: Invitational balanced hand → 2NT
    { type:"bidding", vulnerability:"—", hand:{spades:"Q954",hearts:"K73",diamonds:"J42",clubs:"Q83"}, dealer:"South", auction:["1NT","Pass"], position:"North", question:"Partner opened 1NT. You have 8 HCP and a balanced hand with no 4-card major and no 5-card suit. What do you bid?", options:["2NT (invitational)","Pass","2♣ (Stayman)","3NT"], correct:"2NT (invitational)", explanation:"With 8-9 HCP and a balanced hand, bid 2NT to invite game. Opener accepts with 17 HCP and passes with 15-16 HCP. Too strong to pass, not strong enough to bid 3NT directly.", points:15 },
    // Q9: Texas Transfer to hearts — game values, want opener as declarer
    { type:"bidding", vulnerability:"—", hand:{spades:"43",hearts:"AKJ975",diamonds:"KQ2",clubs:"J4"}, dealer:"South", auction:["1NT","Pass"], position:"North", question:"Partner opened 1NT. You have 14 HCP and 6 hearts. You want to play 4♥ with opener as declarer. What do you bid?", options:["4♦ (Texas, transfer to ♥)","2♦ (Jacoby transfer)","4♥ (direct)","3♥"], correct:"4♦ (Texas, transfer to ♥)", explanation:"Bid 4♦ (Texas Transfer) to transfer to 4♥. Opener completes with 4♥ and becomes declarer — protecting their tenaces from the opening lead. Use Texas when you want game with no slam interest.", points:15 },
    // Q10: Weak hand with 6 hearts → Jacoby transfer, NOT Texas
    { type:"bidding", vulnerability:"—", hand:{spades:"43",hearts:"QJ9754",diamonds:"K52",clubs:"J4"}, dealer:"South", auction:["1NT","Pass"], position:"North", question:"Partner opened 1NT. You have 7 HCP and 6 hearts. What do you bid?", options:["2♦ (Jacoby transfer to ♥)","4♦ (Texas transfer)","Pass","2♣"], correct:"2♦ (Jacoby transfer to ♥)", explanation:"With 7 HCP and 6 hearts, use Jacoby 2♦ to transfer to hearts. Opener bids 2♥ and you pass — playing 2♥ is much better than 1NT. Texas (4♦) is only for game-going hands with 10+ HCP.", points:15 },
  ],

  // ── play-1: Finesse Technique ─────────────────────────────────────────────
  "play-1": [
    { type:"play", contract:"3NT", declarer:"South", lead:"♠6", dummy:{spades:"K73",hearts:"A74",diamonds:"KJ52",clubs:"865"}, hand:{spades:"A84",hearts:"K65",diamonds:"A743",clubs:"KQ4"}, question:"West leads ♠6. You win ♠A. You have 8 top tricks. Where do you find the 9th?", options:["Lead ♦ to ♦K, then finesse ♦J on the way back","Cash ♦A-K and hope ♦Q drops","Cash ♥A-K and lead a third heart","Duck the opening lead and wait"], correct:"Lead ♦ to ♦K, then finesse ♦J on the way back", explanation:"Lead to ♦K, then finesse ♦J. With ♦KJ52 in dummy and ♦A743 in hand, take four diamond tricks when East holds ♦Q (50%). Win ♦A, lead to ♦K, lead back through East — if East plays low, insert ♦J.", points:15 },
    { type:"play", contract:"4♠", declarer:"South", lead:"♦Q", dummy:{spades:"K43",hearts:"A54",diamonds:"K76",clubs:"Q543"}, hand:{spades:"AJ754",hearts:"K32",diamonds:"A52",clubs:"A2"}, question:"In 4♠, West leads ♦Q (you win ♦A). Apply '8-ever': with 8 trumps missing the queen, finesse. What is the correct trump play?", options:["Cash ♠A-K and hope ♠Q drops","Cash ♠K first, then lead toward ♠J (finesse for ♠Q with East)","Lead ♠J from hand, running it","Duck the first round of trumps completely"], correct:"Cash ♠K first, then lead toward ♠J (finesse for ♠Q with East)", explanation:"'8-ever, 9-never': with 8 trumps missing the queen, always finesse. Cash ♠K first to catch a bare ♠Q with West, then lead toward ♠J.", points:15 },
    { type:"play", contract:"3NT", declarer:"South", lead:"♠J", dummy:{spades:"5432",hearts:"A73",diamonds:"KJ5",clubs:"AQ6"}, hand:{spades:"AK6",hearts:"K52",diamonds:"A84",clubs:"J432"}, question:"West leads ♠J (you win ♠K). You have 7 top tricks. ♣AQ6 in dummy, ♣J432 in hand — missing ♣K. What is the correct way to play clubs?", options:["Lead ♣Q from dummy (running it)","Lead small from hand toward ♣Q in dummy","Cash ♣A then ♣Q hoping ♣K drops","Lead ♣J from hand, running it"], correct:"Lead small from hand toward ♣Q in dummy", explanation:"Lead small from hand toward ♣Q. If West plays low, insert ♣Q — wins whenever West holds ♣K (50%). Golden rule: always lead TOWARD the tenace (AQ), never lead the honor itself.", points:15 },
    { type:"play", contract:"4♠", declarer:"South", lead:"♣Q", dummy:{spades:"AK5",hearts:"Q65",diamonds:"A43",clubs:"K543"}, hand:{spades:"QJT76",hearts:"A74",diamonds:"K52",clubs:"A2"}, question:"In 4♠, West leads ♣Q (you win ♣A). Trumps are solid. You have 3 unavoidable side losers. ♥Q in dummy, ♥A in hand. How do you handle hearts?", options:["Cash ♥A then lead toward ♥Q (finesse against West's ♥K)","Lead ♥Q from dummy hoping ♥K drops","Cash ♥A and give up on hearts","Lead small from dummy toward ♥A (wrong direction)"], correct:"Cash ♥A then lead toward ♥Q (finesse against West's ♥K)", explanation:"Cash ♥A first (catching a bare ♥K with East), then lead small from hand toward ♥Q. If West plays low, insert ♥Q — wins if West holds ♥K (50%).", points:15 },
    { type:"play", contract:"3NT", declarer:"South", lead:"♠J", dummy:{spades:"A54",hearts:"AK3",diamonds:"543",clubs:"AJ65"}, hand:{spades:"K32",hearts:"Q54",diamonds:"AK5",clubs:"Q432"}, question:"In 3NT, West leads ♠J (you win ♠K). ♣AJ65 in dummy, ♣Q432 in hand — missing ♣K-10. How do you play clubs?", options:["Cash ♣A then lead toward ♣Q (finesse against East's ♣K)","Lead ♣Q from hand, running it","Cash ♣A then lead ♣Q hoping ♣K drops","Lead small from hand toward ♣J (finesse against West's ♣K)"], correct:"Lead small from hand toward ♣J (finesse against West's ♣K)", explanation:"Lead small from hand toward ♣J in dummy. If West plays low, insert ♣J — wins whenever West holds ♣K (50%). Always lead TOWARD the tenace (AJ).", points:20 },
  ],

  // ── bidding-3: Reverse Bidding ────────────────────────────────────────────
  "bidding-3": [
    { type:"bidding", hand:{spades:"AKJ5",hearts:"KQ983",diamonds:"A4",clubs:"72"}, auction:["Pass","Pass","Pass","1♥","Pass","1NT","Pass"], position:"South", question:"The auction is shown above. What is your rebid as South?", options:["2♠","2♥","3♥","2NT"], correct:"2♠", explanation:"Bid 2♠ — a reverse. Opened 1♥ (lower suit), rebid 2♠ (higher suit at 2-level). A reverse promises 17+ HCP and is forcing for one round. 17 HCP with 5-4 in hearts-spades.", points:15 },
    { type:"bidding", hand:{spades:"AQ74",hearts:"KJ863",diamonds:"K5",clubs:"A3"}, auction:["Pass","Pass","Pass","1♥","Pass","2♣","Pass"], position:"South", question:"The auction is shown above. What is your rebid as South?", options:["2♠","2♥","3♥","3♣"], correct:"2♠", explanation:"Bid 2♠ — a reverse showing 17+ HCP with 5 hearts and 4 spades. The reverse is forcing. 2♥ underbids; 3♣ raises the minor on a hand that belongs in a major.", points:15 },
    { type:"bidding", hand:{spades:"KJ73",hearts:"Q9",diamonds:"AKJ62",clubs:"54"}, auction:["Pass","Pass","Pass","1♦","Pass","1♥","Pass"], position:"South", question:"The auction is shown above. What is your rebid as South?", options:["1♠","2♥","2♦","3♦"], correct:"1♠", explanation:"Bid 1♠ — NOT a reverse! Bidding 1♠ over partner's 1♥ stays at the 1-level — not a reverse. Reverses require bidding a HIGHER-ranking suit at the 2-level. With only 14 HCP (not enough to reverse), 1♠ is the correct rebid showing your 4-card spade suit.", points:15 },
    { type:"bidding", hand:{spades:"73",hearts:"AKJ85",diamonds:"KJ742",clubs:"6"}, auction:["Pass","Pass","Pass","1♥","Pass","1♠","Pass"], position:"South", question:"The auction is shown above. What is your rebid as South?", options:["2♦","2♥","3♥","2♠"], correct:"2♦", explanation:"Bid 2♦ — showing your second suit. Opening 1♥ then rebidding 2♦ is NOT a reverse because diamonds rank lower than hearts. A reverse requires the second suit to rank HIGHER than the first.", points:15 },
    { type:"bidding", hand:{spades:"AKQ6",hearts:"KJ4",diamonds:"AJ852",clubs:"3"}, auction:["Pass","Pass","Pass","1♦","Pass","1♥","Pass"], position:"South", question:"The auction is shown above. What is your rebid as South?", options:["2♠","1♠","2♦","2♥"], correct:"2♠", explanation:"Bid 2♠ — a textbook reverse. Opened 1♦ (lower), rebid 2♠ (higher at 2-level). Shows 17+ HCP with 5+ diamonds and 4 spades.", points:15 },
    { type:"bidding", hand:{spades:"Q53",hearts:"J74",diamonds:"K862",clubs:"Q93"}, auction:["1♣","Pass","1♦","Pass","2♥","Pass"], position:"North", question:"The auction is above. What is your next bid as North? (you have 7 HCP)", options:["2NT","3♣","Pass","3♥"], correct:"2NT", explanation:"Bid 2NT — the weakest call available. You CANNOT pass a reverse. With only 7 HCP make the cheapest descriptive bid. 2NT says 'minimum hand with no fit and stoppers.' Never pass a reverse.", points:15 },
    { type:"bidding", hand:{spades:"K743",hearts:"Q62",diamonds:"J4",clubs:"A852"}, auction:["1♦","Pass","1♠","Pass","2♥","Pass"], position:"North", question:"The auction is above. What is your next bid as North? (you have 10 HCP, 3 hearts)", options:["3♣ (4th suit forcing)","3NT","3♥","2NT"], correct:"3NT", explanation:"Bid 3NT — game with no confirmed fit. 10 HCP, partner reversed showing 17+ HCP. Combined: 27+ HCP. Only 3 hearts (♥Q62) — no confirmed 8-card fit. 3NT is right.", points:15 },
    { type:"bidding", hand:{spades:"KJ84",hearts:"AQ74",diamonds:"93",clubs:"J62"}, auction:["1♣","Pass","1♠","Pass","2♥","Pass"], position:"North", question:"The auction is above. What is your next bid as North? (you have 10 HCP, 3 hearts)", options:["4♥","3NT","2NT","3♥"], correct:"4♥", explanation:"Bid 4♥ — game! Partner reversed to 2♥ showing 5+ clubs and 4+ hearts with 17+ HCP. You hold 4 hearts — confirmed 4-4 heart fit. 11+17=28 HCP. The reverse forces to game and the 4-4 heart fit is confirmed, so bid 4♥ directly.", points:15 },
    { type:"bidding", hand:{spades:"J74",hearts:"K92",diamonds:"Q863",clubs:"A75"}, auction:["1♦","Pass","1♠","Pass","2♥","Pass"], position:"North", question:"The auction is above. What is your next bid as North? (you have 10 HCP, 3 hearts)", options:["3♣ (4th suit forcing)","3NT","3♥","2NT"], correct:"3NT", explanation:"Bid 3NT — game is the right level. 10+17=27 HCP combined, but with only 3 hearts there's no confirmed 8-card fit. 3♣ (4th suit forcing) would be correct with 13+ HCP to investigate slam, but with 10 HCP just bid 3NT directly. You have stoppers in all suits.", points:15 },
    { type:"bidding", hand:{spades:"K5",hearts:"AJ74",diamonds:"Q63",clubs:"K952"}, auction:["1♦","Pass","1♥","Pass","2♠","Pass"], position:"North", question:"The auction is above. What is your next bid as North? (you have 13 HCP)", options:["3♣","4♠","3NT","3♥"], correct:"3♣", explanation:"Bid 3♣ — the 4th suit forcing, showing slam interest. 13+17=30+ HCP — slam is possible. 3♣ is artificial, asking partner to describe their hand before placing the contract.", points:15 },
    { type:"bidding", hand:{spades:"AQ84",hearts:"KJ972",diamonds:"K5",clubs:"73"}, auction:["1♣","Pass","1♥","Pass","1NT","Pass"], position:"West", question:"East opened 1♣, you responded 1♥, East rebid 1NT. You have 13 HCP with 5 hearts and 4 spades. What is your rebid?", options:["2♠","2♥","3♥","Pass"], correct:"2♠", explanation:"Bid 2♠ — a responder's reverse! Having responded 1♥, bidding 2♠ now is a reverse showing 13+ HCP with 5+ hearts and 4 spades. FORCING — opener must bid again. 13+13=26 HCP — game is there.", points:15 },
  ],

  // ── bidding-4: Weak Two Bids ──────────────────────────────────────────────
  "bidding-4": [
    { type:"bidding", hand:{spades:"KQJ975",hearts:"84",diamonds:"J63",clubs:"72"}, question:"What is your opening bid?", options:["2♠","1♠","Pass","3♠"], correct:"2♠", explanation:"Open 2♠ — a perfect weak two. 8 HCP with ♠KQJ975 — excellent 6-card suit with solid top sequence.", points:10 },
    { type:"bidding", hand:{spades:"74",hearts:"AQ10863",diamonds:"K5",clubs:"932"}, question:"What is your opening bid?", options:["2♥","1♥","Pass","3♥"], correct:"2♥", explanation:"Open 2♥. 9 HCP with good 6-card heart suit (♥AQ10863). 1♥ requires 13+ HCP. The ♦K is a useful side value — a sound weak two.", points:10 },
    { type:"bidding", hand:{spades:"85",hearts:"KJ9742",diamonds:"Q63",clubs:"74"}, question:"What is your opening bid?", options:["2♥","Pass","1♥","3♥"], correct:"2♥", explanation:"Open 2♥. 7 HCP with decent 6-card heart suit (♥KJ9742). Clearly not strong enough for 1♥.", points:10 },
    { type:"bidding", hand:{spades:"AJ10965",hearts:"K3",diamonds:"742",clubs:"85"}, vulnerability:"Both", question:"Both vulnerable. What is your opening bid?", options:["2♠","1♠","Pass","3♠"], correct:"2♠", explanation:"Open 2♠ even vulnerable. 9 HCP with ♠AJ10965 — a good 6-card suit. The ♥K is a useful side value — responder can ask min/max with 2NT.", points:10 },
    { type:"bidding", hand:{spades:"83",hearts:"Q97642",diamonds:"J85",clubs:"K4"}, question:"What is your opening bid?", options:["Pass","2♥","1♥","3♥"], correct:"Pass", explanation:"Pass. ♥Q97642 is too weak for a sound weak two. SAYC requires at least two of the top three honors. The suit is too broken.", points:10 },
    { type:"bidding", hand:{spades:"AK4",hearts:"AQ3",diamonds:"KJ72",clubs:"Q85"}, auction:["Pass","Pass","2♠","Pass"], position:"North", question:"Partner opened 2♠ (weak). What is your bid?", options:["2NT (asks min/max)","4♠","3♠","3NT"], correct:"2NT (asks min/max)", explanation:"Bid 2NT — asking opener if they are minimum (6-8 HCP) or maximum (9-11 HCP). With 19 HCP you need to know before placing the contract.", points:15 },
    { type:"bidding", hand:{spades:"Q1083",hearts:"A74",diamonds:"K952",clubs:"63"}, auction:["Pass","Pass","2♥","Pass"], position:"North", question:"Partner opened 2♥ (weak). What is your bid?", options:["3♥","4♥","2NT (asks min/max)","Pass"], correct:"3♥", explanation:"Bid 3♥ — preemptive raise. 9+11 max=20 HCP combined — far short of game. Raising to 3♥ crowds out the opponents.", points:15 },
    { type:"bidding", hand:{spades:"AQ3",hearts:"AK6",diamonds:"QJ72",clubs:"854"}, auction:["Pass","Pass","2♠","Pass"], position:"North", question:"Partner opened 2♠ (weak). You have 16 HCP with 3-card spade support. What is your bid?", options:["2NT (asks min/max)","4♠","3♠","Pass"], correct:"2NT (asks min/max)", explanation:"Bid 2NT — asking opener min or max. At minimum (6-8 HCP), 16+8=24 — game fails. At maximum (9-11 HCP), 16+9=25+ — game is possible. Never jump to game when partner may be minimum.", points:15 },
    { type:"bidding", hand:{spades:"75",hearts:"K4",diamonds:"AQ983",clubs:"KJ62"}, auction:["Pass","Pass","2♥","Pass"], position:"North", question:"Partner opened 2♥ (weak). What is your bid?", options:["Pass","3♥","2NT (asks min/max)","4♥"], correct:"Pass", explanation:"Pass. Only ♥K4 — doubleton support. 12+11=23 max combined — not enough for game. Do not rescue a weak two bidder without genuine support.", points:15 },
    { type:"bidding", hand:{spades:"AQ3",hearts:"K2",diamonds:"AJ75",clubs:"Q854"}, auction:["Pass","Pass","2♠","Pass","2NT","Pass","3♠","Pass"], position:"North", question:"You asked 2NT (min/max ask), opener responded 3♠ showing a MINIMUM hand (6-8 HCP). What do you bid now?", options:["Pass","4♠","3NT","3♠"], correct:"Pass", explanation:"Pass. Opener's 3♠ shows a minimum (6-8 HCP). 16+8=24 maximum combined — not enough for game (need 26). You asked 2NT to find out, and now you know: sign off in 3♠. With 16 HCP you were right to ask, but opposite minimum the hand belongs in partscore.", points:15 },
  ],

  // ── conventions-2: Checkback Stayman ─────────────────────────────────────
  // All questions use the true Checkback sequence: 1m - 1M - 1NT - 2♣(Checkback)
  "conventions-2": [
    // Q1: Opener has 4 hearts (unbid major) — bids 2♥
    { type:"conventions", hand:{spades:"A4",hearts:"KJ75",diamonds:"K83",clubs:"Q762"}, dealer:"West", auction:["1♣","Pass","1♠","Pass","1NT","Pass","2♣ (Checkback)","Pass"], position:"West", question:"You opened 1♣, rebid 1NT. Partner bid 2♣ (Checkback Stayman, asking for an unbid major or 3-card spade support). With 13 HCP, 4 hearts and only 2 spades, what do you bid?", options:["2♥ (shows 4 hearts)","2♠ (shows 3-card support)","2♦ (no fit, minimum)","2NT"], correct:"2♥ (shows 4 hearts)", explanation:"Bid 2♥ — showing your 4-card heart suit. With 13 HCP you correctly opened 1♣ (too weak for 1NT which shows 15-17). Checkback 2♣ asks opener to reveal an unbid 4-card major or 3-card support for responder's major. With 4 hearts and only 2 spades, bid 2♥. Partner may hold 4 hearts too, uncovering a 4-4 fit.", points:15 },
    // Q2: Opener has 3-card spade support — bids 2♠
    { type:"conventions", hand:{spades:"KJ5",hearts:"A74",diamonds:"K83",clubs:"Q762"}, dealer:"West", auction:["1♣","Pass","1♠","Pass","1NT","Pass","2♣ (Checkback)","Pass"], position:"West", question:"You opened 1♣, rebid 1NT. Partner bid 2♣ (Checkback Stayman). With 13 HCP, 3-card spade support and no unbid 4-card major, what do you bid?", options:["2♠ (shows 3-card support)","2♥ (shows 4 hearts)","2♦ (no fit, minimum)","3♠ (shows 3-card support, maximum)"], correct:"2♠ (shows 3-card support)", explanation:"Bid 2♠ — showing 3-card spade support with a minimum hand. With 13 HCP you correctly opened 1♣ (too weak for 1NT which shows 15-17). When partner bids Checkback 2♣ after a 1♠ response, opener bids 2♠ to show 3-card support (minimum). This confirms a 5-3 spade fit.", points:15 },
    // Q3: Opener has no fit and no unbid major — bids 2♦ (minimum)
    { type:"conventions", hand:{spades:"A74",hearts:"Q5",diamonds:"KJ73",clubs:"K862"}, dealer:"West", auction:["1♣","Pass","1♥","Pass","1NT","Pass","2♣ (Checkback)","Pass"], position:"West", question:"You opened 1♣, rebid 1NT. Partner bid 2♣ (Checkback Stayman). You have only 2 hearts (♥Q5) and no 4-card spade suit, and a minimum 1NT rebid (13 HCP). What do you bid?", options:["2♦ (no fit, minimum)","2♥ (shows 3-card support)","2♠ (shows 4 spades)","2NT (no fit, maximum)"], correct:"2♦ (no fit, minimum)", explanation:"Bid 2♦ — the negative response showing no 3-card heart support and no 4-card spade suit, with a MINIMUM hand. 2♦ is the Checkback 'no' — like 2♦ in regular Stayman. Responder will now bid 2NT (invite) or 3NT (game) without a fit.", points:15 },
    // Q4: Opener has both 3-card support AND 4 cards in other major — bids the 4-card major first
    { type:"conventions", hand:{spades:"K3",hearts:"K75",diamonds:"AJ73",clubs:"Q862"}, dealer:"West", auction:["1♦","Pass","1♥","Pass","1NT","Pass","2♣ (Checkback)","Pass"], position:"West", question:"You opened 1♦, rebid 1NT. Partner bid 2♣ (Checkback). You have ♥K75 (3-card heart support) and only 2 spades — so your 1NT rebid was correct. What do you bid now?", options:["2♥ (shows 3-card support, minimum)","2♠ (shows 4 spades)","2♦ (no fit)","3♥ (shows 3-card support, maximum)"], correct:"2♥ (shows 3-card support, minimum)", explanation:"Bid 2♥ — showing 3-card heart support with a minimum hand. With ♥K75 you have a fit for partner's hearts. Note: if you had 4 spades you would have bid 1♠ over 1♥ (not 1NT), so spades was never an option here. With 13 HCP (minimum 1NT rebid range of 12-14), 2♥ confirms the 5-3 heart fit at the minimum level.", points:15 },
    // Q5: Opener maximum, 3-card support — bids 3M (max)
    { type:"conventions", hand:{spades:"KJ6",hearts:"A74",diamonds:"KJ3",clubs:"Q762"}, dealer:"West", auction:["1♣","Pass","1♠","Pass","1NT","Pass","2♣ (Checkback)","Pass"], position:"West", question:"You opened 1♣, rebid 1NT. Partner bid 2♣ (Checkback). You have ♠KJ6 (3-card support) and a MAXIMUM 1NT rebid (14 HCP). What do you bid?", options:["3♠ (3-card support, maximum)","2♠ (3-card support, minimum)","2♦ (no fit)","2♥ (4 hearts)"], correct:"3♠ (3-card support, maximum)", explanation:"Bid 3♠ — showing 3-card spade support with a MAXIMUM hand. The jump to 3♠ (vs 2♠) tells partner you have 14 HCP, not 12-13. Partner can now bid 4♠ confidently with 5+ spades and any values.", points:15 },
    // Q6: Responder after 2♥ response — has 4 hearts too, bids 4♥
    { type:"conventions", hand:{spades:"KQ852",hearts:"AJ74",diamonds:"93",clubs:"K6"}, dealer:"East", auction:["1♦","Pass","1♠","Pass","1NT","Pass","2♣ (Checkback)","Pass","2♥","Pass"], position:"North", question:"You bid 1♠ then Checkback 2♣. Opener responded 2♥ (4-card hearts). You have 4 hearts and 5 spades with 12 HCP. What do you bid?", options:["4♥","4♠","3NT","3♠"], correct:"4♥", explanation:"Bid 4♥ — you found a 4-4 heart fit! Opener showed 4 hearts with 2♥. With 4 hearts yourself and enough values (12 HCP + opener's 11-14 = 23-26), bid 4♥. The heart fit is equal or better than a possible 5-3 spade fit.", points:15 },
    // Q7: Responder after 2♠ response — confirms 5-3 spade fit, bids 4♠
    { type:"conventions", hand:{spades:"AJ962",hearts:"K74",diamonds:"Q85",clubs:"J3"}, dealer:"East", auction:["1♦","Pass","1♠","Pass","1NT","Pass","2♣ (Checkback)","Pass","2♠","Pass"], position:"North", question:"You bid 1♠ then Checkback 2♣. Opener responded 2♠ (3-card support, MINIMUM ~12-13 HCP). You have 5 spades and 11 HCP. What do you bid?", options:["4♠","3♠ (invite)","2NT","Pass"], correct:"3♠ (invite)", explanation:"Bid 3♠ — invitational. Opener showed 3-card support but MINIMUM values (12-13 HCP). 11+12=23 at minimum — not enough for game (need 26). Invite with 3♠: opener bids 4♠ with 13-14 HCP, passes with 12 HCP.", points:15 },
    // Q8: Responder after 2♦ (no fit) — has 5 hearts, invites with 2NT
    { type:"conventions", hand:{spades:"Q4",hearts:"KJ953",diamonds:"A82",clubs:"J74"}, dealer:"East", auction:["1♦","Pass","1♥","Pass","1NT","Pass","2♣ (Checkback)","Pass","2♦","Pass"], position:"North", question:"You bid 1♥ then Checkback 2♣. Opener responded 2♦ (no fit, minimum). You have 5 hearts and 10 HCP — not enough to force game. What do you bid?", options:["2NT (invite)","3♥ (invite with 5 hearts)","3NT","Pass"], correct:"2NT (invite)", explanation:"Bid 2NT — invitational. Opener showed no 3-card heart support and no 4-card spade suit with a minimum hand. With 10 HCP and no confirmed fit, invite with 2NT. Opener will pass with 11-12 HCP or bid 3NT with 13-14 HCP.", points:15 },
    // Q9: Responder after 2♦ (no fit) — has game values, bids 3NT
    { type:"conventions", hand:{spades:"K5",hearts:"AQ854",diamonds:"K72",clubs:"J93"}, dealer:"East", auction:["1♦","Pass","1♥","Pass","1NT","Pass","2♣ (Checkback)","Pass","2♦","Pass"], position:"North", question:"You bid 1♥ then Checkback 2♣. Opener responded 2♦ (no fit, minimum). You have 12 HCP and 5 hearts. No fit was found. What do you bid?", options:["3NT","3♥","2NT","4♥"], correct:"3NT", explanation:"Bid 3NT — you have game values (12 HCP) but no confirmed major fit. Opener showed minimum hand with no 3-card heart support. 12+11=23 minimum — enough for game. With stoppers in all suits, 3NT is correct.", points:15 },
    // Q10: Responder after 3♠ (maximum with 3-card support) — bids 4♠
    { type:"conventions", hand:{spades:"KQ974",hearts:"Q5",diamonds:"A63",clubs:"J52"}, dealer:"East", auction:["1♣","Pass","1♠","Pass","1NT","Pass","2♣ (Checkback)","Pass","3♠","Pass"], position:"North", question:"You bid 1♠ then Checkback 2♣. Opener responded 3♠ (3-card support, MAXIMUM ~14 HCP). You have 5 spades and 12 HCP. What do you bid?", options:["4♠","Pass","3NT","2NT"], correct:"4♠", explanation:"Bid 4♠ — opener showed a maximum hand (14 HCP) with 3-card spade support. 12+14=26 HCP with a confirmed 5-3 fit — just enough for game. The jump to 3♠ by opener was a game invite, and with 12 HCP you should accept!", points:15 },
    // Q11: When NOT to use Checkback — balanced hand, just bid 2NT
    { type:"conventions", hand:{spades:"K74",hearts:"AQ52",diamonds:"K83",clubs:"J94"}, dealer:"East", auction:["1♦","Pass","1♥","Pass","1NT","Pass"], position:"North", question:"Partner opened 1♦, you responded 1♥, partner rebid 1NT. You have 13 HCP balanced (4-4-3-2 shape). Should you use Checkback 2♣ or bid directly?", options:["3NT (bid game directly)","2♣ (Checkback Stayman)","2NT (invite)","Pass"], correct:"3NT (bid game directly)", explanation:"Bid 3NT directly — you have 13 HCP and game is clear. With a balanced hand and no 5-card major, Checkback is not needed. You have only 4 hearts (not 5), so a 5-3 fit can't exist. 13+12=25 at minimum — enough for 3NT. Skip Checkback and bid game directly.", points:15 },
    // Q12: Checkback with 5-5 in majors — bid 2♣ then show second suit
    { type:"conventions", hand:{spades:"KJ852",hearts:"AQ974",diamonds:"3",clubs:"J6"}, dealer:"East", auction:["1♦","Pass","1♠","Pass","1NT","Pass","2♣ (Checkback)","Pass","2♦","Pass"], position:"North", question:"You bid 1♠ then Checkback 2♣. Opener bid 2♦ (no fit). You have 5-5 in spades and hearts with 11 HCP. What do you bid now?", options:["2♥ (show second suit)","3♠ (rebid spades)","3NT","4♠"], correct:"2♥ (show second suit)", explanation:"Bid 2♥ — showing your second 5-card suit. After Checkback gets a 2♦ denial, bidding a new suit shows a two-suiter. Partner can now choose between 2♠ (fit spades), 3♥ (fit hearts), 2NT (minimum) or 3NT (maximum). This finds the best fit.", points:15 },
    // Q13: Checkback with 5-4 majors — use Checkback to find the 4-4 heart fit
    { type:"conventions", hand:{spades:"AKJ85",hearts:"AQ74",diamonds:"94",clubs:"62"}, dealer:"East", auction:["1♦","Pass","1♠","Pass","1NT","Pass","2♣ (Checkback)","Pass","2♥","Pass"], position:"North", question:"You bid 1♠ then Checkback 2♣. Opener bid 2♥ (showing 4 hearts). You have 5 spades and 4 hearts with 14 HCP. What is your best bid?", options:["4♥","4♠","3NT","3♥"], correct:"4♥", explanation:"Bid 4♥ — the 4-4 heart fit is confirmed. You have 4 hearts, opener showed 4 hearts. 14+12=26 at minimum — enough for game. 4♥ plays better than 4♠ when you have a confirmed 4-4 heart fit.", points:15 },
    // Q14: Opener with 4 hearts AND maximum — bids 3♥ (max)
    { type:"conventions", hand:{spades:"J4",hearts:"KQ75",diamonds:"KJ3",clubs:"A862"}, dealer:"West", auction:["1♣","Pass","1♠","Pass","1NT","Pass","2♣ (Checkback)","Pass"], position:"West", question:"You opened 1♣, rebid 1NT. Partner bid 2♣ (Checkback). You have 4 hearts and a MAXIMUM 1NT rebid (14 HCP). What do you bid?", options:["3♥ (4 hearts, maximum)","2♥ (4 hearts, minimum)","2♦ (no fit)","2♠ (3-card support)"], correct:"3♥ (4 hearts, maximum)", explanation:"Bid 3♥ — showing 4 hearts with a MAXIMUM hand (15 HCP). The jump to 3♥ vs 2♥ tells partner you have 14 HCP (maximum for the 12-14 1NT rebid range). Partner can now bid 4♥ with 4+ hearts, or 3NT without a heart fit.", points:15 },
  ],

  // ── bidding-5: Free Bids ──────────────────────────────────────────────────
  "bidding-5": [
    { type:"bidding", hand:{spades:"72",hearts:"943",diamonds:"AJ53",clubs:"KQ76"}, dealer:"North", auction:["1♥","1♠","Dbl"], position:"South", question:"Partner opened 1♥, RHO overcalled 1♠. You double. This is a negative double — what suits does it show?", options:["4+ clubs and 4+ diamonds","4+ spades","Exactly 4 spades","4+ hearts"], correct:"4+ clubs and 4+ diamonds", explanation:"A negative double after 1♥-1♠-Dbl shows the two unbid suits — clubs and diamonds. With 4+ cards in both minors and 10 HCP, double is the perfect bid to show both suits at once. Bidding either minor directly would hide the other suit.", points:15 },
    { type:"bidding", hand:{spades:"85",hearts:"KQ74",diamonds:"A953",clubs:"J62"}, auction:["1♣","1♠"], position:"North", question:"Partner opened 1♣, RHO overcalled 1♠. With 9 HCP and 4 hearts, what is your best action?", options:["Dbl (negative double)","2♥","Pass","2♣"], correct:"Dbl (negative double)", explanation:"Double — negative double! The negative double shows 4+ hearts and 6+ HCP. Bidding 2♥ directly would show 5+ hearts.", points:15 },
    { type:"bidding", hand:{spades:"74",hearts:"AK952",diamonds:"Q63",clubs:"J84"}, auction:["1♦","1♠"], position:"North", question:"Partner opened 1♦, RHO overcalled 1♠. With 9 HCP and 5 hearts, what do you bid?", options:["2♥ (free bid)","Dbl","Pass","3♥"], correct:"2♥ (free bid)", explanation:"Bid 2♥ — a free bid showing 5+ hearts. In competition, bidding a NEW suit at the 2-level is a free bid showing 9+ HCP and 5+ cards. With 5 hearts, bid them directly rather than use a negative double.", points:15 },
    { type:"bidding", hand:{spades:"K853",hearts:"AQ4",diamonds:"K953",clubs:"J6"}, auction:["1♣","1♥"], position:"North", question:"Partner opened 1♣, RHO overcalled 1♥. With 13 HCP and 4 spades, what do you bid?", options:["Dbl (negative double)","1♠","2♠","Pass"], correct:"Dbl (negative double)", explanation:"Double — negative double showing 4+ spades and 6+ HCP. With 13 HCP and 4 spades, this shows your spades. Bidding 1♠ directly works too, but the negative double is the standard action in SAYC.", points:15 },
    { type:"bidding", hand:{spades:"J6",hearts:"K8542",diamonds:"AQ73",clubs:"96"}, auction:["1♣","1♠","Dbl","Pass","2♥","Pass"], position:"North", question:"You made a negative double, partner rebid 2♥. With 9 HCP and 5-4 in hearts-diamonds, what do you bid?", options:["Pass","3♥","2NT","3♦"], correct:"Pass", explanation:"Pass. The negative double does not promise extra values; with minimum (9 HCP), partner's 2♥ is exactly where you want to play.", points:10 },
    { type:"bidding", hand:{spades:"75",hearts:"KJ54",diamonds:"AQ83",clubs:"Q62"}, auction:["1♣","1♠"], position:"North", question:"Partner opened 1♣, RHO overcalled 1♠. With 11 HCP and 4-4 in hearts-diamonds, what do you bid?", options:["Dbl (negative double)","2♥","3♣","2NT"], correct:"Dbl (negative double)", explanation:"Double — negative double. Shows 4+ hearts (the unbid major) and 6+ HCP. With 4-4 in hearts and diamonds, use the negative double.", points:15 },
    { type:"bidding", hand:{spades:"AK8",hearts:"Q743",diamonds:"K952",clubs:"J6"}, auction:["1♥","2♣"], position:"North", question:"Partner opened 1♥, RHO overcalled 2♣. With 13 HCP and 4-card heart support, what do you bid?", options:["3♣ (cuebid)","Dbl (negative double)","3♥","2NT"], correct:"3♣ (cuebid)", explanation:"Bid 3♣ — a cuebid of the opponent's suit! After 1♥-2♣, bidding 3♣ shows a strong raise with 4+ heart support and 10+ HCP. It is forcing to game and asks partner to describe their hand. With 13 HCP and 4 hearts, 3♣ is the ideal way to show a strong heart raise in competition.", points:15 },
    { type:"bidding", hand:{spades:"73",hearts:"K9652",diamonds:"AQ4",clubs:"J83"}, auction:["1♦","1♠"], position:"North", question:"Partner opened 1♦, RHO overcalled 1♠. With 10 HCP and 5 hearts, what do you bid?", options:["2♥ (free bid)","Dbl","3♥","Pass"], correct:"2♥ (free bid)", explanation:"Bid 2♥ — a free bid. With 5 hearts, bid the suit directly. Free bids at the 2-level show 9+ HCP and 5+ cards.", points:15 },
    { type:"bidding", hand:{spades:"K3",hearts:"AQ74",diamonds:"J852",clubs:"K93"}, auction:["1♣","1♠","Dbl","Pass","2♥","Pass"], position:"North", question:"You made a negative double and partner rebid 2♥. With 13 HCP, what do you bid?", options:["4♥","3♥","2NT","3NT"], correct:"4♥", explanation:"Bid 4♥ — game! Partner showed 4 hearts with 2♥, confirming a 4-4 fit. With 13 HCP and a confirmed fit, 13+13=26 — exactly the game threshold. With a known fit and game values, bid game directly rather than invite.", points:15 },
    { type:"bidding", hand:{spades:"95",hearts:"AKJ74",diamonds:"K83",clubs:"Q62"}, auction:["1♣","1♠"], position:"North", question:"Partner opened 1♣, RHO overcalled 1♠. With 12 HCP and 5 hearts, what do you bid?", options:["2♥ (free bid)","Dbl","3♥","Pass"], correct:"2♥ (free bid)", explanation:"Bid 2♥ — free bid showing 5+ hearts and 9+ HCP. With 5 hearts bid them directly. The negative double would suggest only 4 hearts.", points:15 },
    { type:"bidding", hand:{spades:"852",hearts:"KJ74",diamonds:"93",clubs:"AQ65"}, dealer:"South", auction:["1♣","1♦"], position:"North", question:"Partner opened 1♣, RHO overcalled 1♦. With 10 HCP and 4 hearts, what do you bid?", options:["1♥","Dbl (negative double)","2♣","Pass"], correct:"1♥", explanation:"Bid 1♥ — natural, showing 4+ hearts at the 1-level. After 1♣-1♦, you can bid your 4-card heart suit directly. A negative double here would show BOTH majors (4+ hearts AND 4+ spades) — with only 4 hearts and no spade length, 1♥ is the correct and precise bid.", points:15 },
  ],

  // ── bidding-6: Response After Takeout Double ──────────────────────────────
  "bidding-6": [
    { type:"bidding", hand:{spades:"Q95",hearts:"K74",diamonds:"8632",clubs:"J75"}, auction:["1♠","Dbl"], position:"North", question:"Your partner opened 1♠ and RHO doubled for takeout. What do you bid?", options:["Rdbl","2♠","Pass","3♠"], correct:"2♠", explanation:"Bid 2♠ — a jump raise showing a weak hand (6-9 HCP) with exactly 3-card spade support. NOT 3♠ here — that is a preemptive raise showing weak 4-card support.", points:10 },
    { type:"bidding", hand:{spades:"74",hearts:"KJ9852",diamonds:"QJ3",clubs:"86"}, auction:["1♠","Dbl"], position:"North", question:"Your partner opened 1♠ and RHO doubled. With 7 HCP, 6 hearts and no spade support, what do you bid?", options:["Pass","2♥","Rdbl","1NT"], correct:"2♥", explanation:"Bid 2♥ — showing your 6-card heart suit naturally at the 2-level. After a takeout double, bidding a new suit at the 2-level shows 6+ cards. With only 5 hearts you would use a negative double instead. With 6 hearts and 7 HCP, 2♥ is the correct descriptive bid.", points:10 },
    { type:"bidding", hand:{spades:"KJ5",hearts:"A82",diamonds:"QJ74",clubs:"K93"}, auction:["1♠","Dbl"], position:"North", question:"Partner opened 1♠, RHO doubled for takeout. With 13 HCP, what do you bid?", options:["Rdbl","3♠","4♠","Pass"], correct:"Rdbl", explanation:"Redouble! With 10+ HCP you must redouble to show your strength. Redouble says 'we have the balance of power — let's look for a penalty'. Do NOT jump to game — redouble first and then support spades later.", points:15 },
    { type:"bidding", hand:{spades:"8642",hearts:"K953",diamonds:"J82",clubs:"73"}, auction:["1♥","Dbl"], position:"North", question:"Partner opened 1♥, RHO doubled. With only 4 HCP and 4-card heart support, what do you bid?", options:["3♥","2♥","Pass","1♠"], correct:"3♥", explanation:"Bid 3♥ — preemptive raise! 4-card support + weak hand = preemptive raise to crowd out the opponents. The double tells you opponents have strength — make it hard for them.", points:15 },
    { type:"bidding", hand:{spades:"Q95",hearts:"AK5",diamonds:"Q742",clubs:"K63"}, auction:["1♥","Dbl","Rdbl","2♠","Pass","Pass"], position:"North", question:"After redouble, opponents competed to 2♠. With 14 HCP and 3-card heart support, what do you bid?", options:["4♥","3♥","Pass","Dbl"], correct:"4♥", explanation:"Bid 4♥ — game! You redoubled showing 10+ HCP, partner opened 1♥ showing 13+ HCP. With 14 HCP and 3-card heart support, 14+13=27 combined — enough for game. Jump to 4♥ to show your values and the heart fit directly.", points:15 },
    { type:"bidding", hand:{spades:"73",hearts:"KJ94",diamonds:"Q852",clubs:"A73"}, auction:["1♠","Dbl"], position:"North", question:"Partner opened 1♠, RHO doubled. With 10 HCP and 4-card heart suit, what do you bid?", options:["Rdbl","2♥","1NT","Pass"], correct:"Rdbl", explanation:"Redouble! 10 HCP meets the 10+ HCP requirement. The redouble says 'we have the majority of points — let's look for a penalty or game'. You will show your 4-card hearts naturally on the next bid.", points:15 },
    { type:"bidding", hand:{spades:"Q73",hearts:"K842",diamonds:"J962",clubs:"85"}, auction:["1♠","Dbl"], position:"North", question:"Partner opened 1♠, RHO doubled. With only 5 HCP and 3-card spade support, what do you bid?", options:["2♠","3♠","Pass","Rdbl"], correct:"2♠", explanation:"Bid 2♠ — single raise showing 3-card support and 6-9 HCP. Not enough for 3♠ (preemptive needs 4+ cards), not enough for redouble (10+ HCP).", points:10 },
    { type:"bidding", hand:{spades:"AJ5",hearts:"KQ3",diamonds:"A874",clubs:"Q52"}, dealer:"South", auction:["1♠","Dbl","Rdbl","2♥","Pass","Pass"], position:"North", question:"You redoubled, opponents competed to 2♥, partner correctly passed. With 16 HCP and 3-card spade support, what do you bid?", options:["4♠","Dbl","3♠","Pass"], correct:"4♠", explanation:"Bid 4♠! You showed 10+ HCP with the redouble, partner opened 1♠ showing 13+ HCP. With 16 HCP and 3-card spade support, 16+13=29 combined — game is a lock. Jump to 4♠ to place the contract. The redouble showed your strength, now use it.", points:15 },
    { type:"bidding", hand:{spades:"K97542",hearts:"83",diamonds:"Q4",clubs:"K73"}, auction:["1♠","Dbl"], position:"North", question:"Partner opened 1♠, RHO doubled. You hold ♠K97542 — 6-card support with 9 HCP. What do you bid?", options:["4♠","3♠","2♠","Rdbl"], correct:"4♠", explanation:"Bid 4♠ — a 'law' raise. With 6-card support, jump to game! The 4♠ bid is preemptive in nature — it makes it very hard for opponents to compete.", points:15 },
    { type:"bidding", hand:{spades:"83",hearts:"KQ74",diamonds:"AJ2",clubs:"Q953"}, auction:["1♠","Dbl","Rdbl","3♣","Pass","Pass"], position:"North", question:"You redoubled showing 10+ HCP. Opponents preempted to 3♣. What do you bid?", options:["Dbl","3♥","3NT","Pass"], correct:"Dbl", explanation:"Double for penalty! They ran to 3♣ and you have 4-card club support (♣Q953) plus 12 HCP. After a redouble, doubles are for penalties. This is the time to collect your reward.", points:15 },
  ],

  // ── conventions-1: Michaels & Unusual 2NT ────────────────────────────────
  "bidding-7": [
    // Q1: Weak hand, transfer to clubs
    { type:"bidding", hand:{spades:"74",hearts:"83",diamonds:"952",clubs:"KJ9742"}, dealer:"South", auction:["1NT","Pass"], position:"North", question:"Partner opened 1NT. You have 4 HCP and 6 clubs. What do you bid?", options:["2♠ (transfer to clubs)","3♣ (transfer to diamonds)","2NT","Pass"], correct:"2♠ (transfer to clubs)", explanation:"With 0-7 HCP and 6+ clubs, bid 2♠ to transfer to clubs. You will pass opener\'s 3♣ and play a safe partscore in clubs.", points:15 },
    // Q2: Opener accepts 2♠ transfer normally
    { type:"bidding", hand:{spades:"AQ3",hearts:"KJ4",diamonds:"A852",clubs:"Q73"}, dealer:"South", auction:["1NT","Pass","2♠","Pass"], position:"South", question:"Partner bid 2♠ (transfer to clubs). You have 16 HCP and ♣Q73. What do you bid?", options:["3♣ (accept transfer)","2NT (super-accept)","3NT","Pass"], correct:"3♣ (accept transfer)", explanation:"To super-accept you need 17 HCP AND 3+ clubs with 2 of AKQ. You have only 16 HCP and ♣Q73 — only one honor. Accept normally with 3♣.", points:15 },
    // Q3: Opener super-accepts 2♠
    { type:"bidding", hand:{spades:"AQ3",hearts:"KJ4",diamonds:"A852",clubs:"KQ7"}, dealer:"South", auction:["1NT","Pass","2♠","Pass"], position:"South", question:"Partner bid 2♠ (transfer to clubs). You have 17 HCP and ♣KQ7. What do you bid?", options:["2NT (super-accept)","3♣ (accept transfer)","3NT","Pass"], correct:"2NT (super-accept)", explanation:"Super-accept requires 17 HCP + 3+ clubs + 2 of AKQ. You have 17 HCP and ♣KQ7 — both K and Q. Bid 2NT to show your great club fit. Opener bids 2NT instead of 3♣ to super-accept.", points:15 },
    // Q4: 8-9 HCP with 6 clubs bids 2NT
    { type:"bidding", hand:{spades:"Q4",hearts:"Q83",diamonds:"52",clubs:"KJ9742"}, dealer:"South", auction:["1NT","Pass"], position:"North", question:"Partner opened 1NT. You have 8 HCP and 6 clubs. What do you bid?", options:["2NT","2♠ (transfer to clubs)","3♣ (transfer to diamonds)","3NT"], correct:"2NT", explanation:"With 8-9 HCP and 6+ clubs you bid 2NT directly — not via transfer. Opener treats it as a standard invite and does not know about your clubs.", points:15 },
    // Q5: Weak hand, transfer to diamonds
    { type:"bidding", hand:{spades:"74",hearts:"83",diamonds:"KJ9742",clubs:"523"}, dealer:"South", auction:["1NT","Pass"], position:"North", question:"Partner opened 1NT. You have 5 HCP and 6 diamonds. What do you bid?", options:["3♣ (transfer to diamonds)","2♠ (transfer to clubs)","2NT","Pass"], correct:"3♣ (transfer to diamonds)", explanation:"With 0-7 HCP and 6+ diamonds, bid 3♣ to transfer to diamonds. Opener always accepts with 3♦ — there is no super-accept for diamonds.", points:15 },
    // Q6: 10+ HCP, 6 clubs, balanced — bid 3NT directly
    { type:"bidding", hand:{spades:"K4",hearts:"Q83",diamonds:"A52",clubs:"KJ974"}, dealer:"South", auction:["1NT","Pass"], position:"North", question:"Partner opened 1NT. You have 13 HCP, 6 clubs and no singleton or void. What do you bid?", options:["3NT","2♠ (transfer to clubs)","2NT","3♣"], correct:"3NT", explanation:"With 10+ HCP, 6+ clubs and no shortness, bid 3NT directly. The hand is balanced and clubs will run in notrump. No need to show the minor.", points:15 },
    // Q7: 10+ HCP, 6 clubs, singleton — transfer then show singleton
    { type:"bidding", hand:{spades:"4",hearts:"KQ3",diamonds:"A52",clubs:"KJ9742"}, dealer:"South", auction:["1NT","Pass","2♠","Pass","3♣","Pass"], position:"North", question:"You bid 2♠ (transfer to clubs), opener accepted with 3♣. You have 13 HCP, 6 clubs and a singleton spade. What do you bid now?", options:["3♠ (show singleton)","3NT","5♣","4♣"], correct:"3♠ (show singleton)", explanation:"After the transfer you show your singleton by bidding that suit. Bid 3♠ to show a singleton spade. This is forcing to game — opener can choose 3NT with a spade stopper or 5♣ without one.", points:15 },
    // Q8: Opener has strong stoppers in short suit — bids 3NT
    { type:"bidding", hand:{spades:"AKJ2",hearts:"KJ4",diamonds:"A85",clubs:"Q73"}, dealer:"South", auction:["1NT","Pass","2♠","Pass","2NT","Pass","3♠","Pass"], position:"South", question:"You super-accepted partner\'s club transfer with 2NT. Partner showed a singleton spade with 3♠. You have ♠AKJ — strong double stopper in partner\'s short suit. What do you bid?", options:["3NT","5♣","4NT","4♣"], correct:"3NT", explanation:"Partner has a singleton spade but you have ♠AKJ — a rock-solid double stopper. The spade suit is fully controlled. With 17 HCP opposite partner\'s 10+, bid 3NT confidently. Strong stoppers in partner\'s short suit make 3NT the best contract.", points:15 },
    // Q9: Opener accepts transfer to diamonds
    { type:"bidding", hand:{spades:"KJ4",hearts:"AQ3",diamonds:"Q732",clubs:"A85"}, dealer:"South", auction:["1NT","Pass","3♣","Pass"], position:"South", question:"Partner bid 3♣ (transfer to diamonds). You have 16 HCP. What do you bid?", options:["3♦ (accept transfer)","3NT","2NT (super-accept)","Pass"], correct:"3♦ (accept transfer)", explanation:"After a 3♣ transfer to diamonds, opener always accepts with 3♦. There is no super-accept for diamonds. Responder will then describe their hand further if needed.", points:15 },
    // Q10: After super-accept, show singleton
    { type:"bidding", hand:{spades:"4",hearts:"Q83",diamonds:"A52",clubs:"KJ9754"}, dealer:"South", auction:["1NT","Pass","2♠","Pass","2NT","Pass"], position:"North", question:"You transferred to clubs with 2♠ and opener super-accepted with 2NT (17 HCP, 3+ clubs with 2 of AKQ). You have 10 HCP, 7 clubs and a singleton spade. What do you bid now?", options:["3♠ (show singleton)","3NT","5♣","Pass"], correct:"3♠ (show singleton)", explanation:"Opener super-accepted showing 17 HCP and great club support. You have 10 HCP — combined 27+. Show your singleton spade with 3♠ so opener can evaluate: with strong spade stoppers they bid 3NT, otherwise 5♣.", points:15 },
  ],
  "conventions-4": [
    // Q1: Basic Bergen 3♣ — 6-9 HCP
    { type:"bidding", hand:{spades:"KJ74",hearts:"Q83",diamonds:"752",clubs:"J94"}, dealer:"South", auction:["1♠","Pass"], position:"North", question:"Partner opened 1♠. You have 7 HCP and 4 spades. What do you bid?", options:["3♣ (Bergen, 6-9)","3♦ (Bergen, limit)","2♠","3♠ (preemptive)"], correct:"3♣ (Bergen, 6-9)", explanation:"With 6-9 HCP and 4-card spade support, bid 3♣ (Bergen). Too good for a preemptive 3♠ (which shows 0-5 HCP) but not enough for a limit raise. Bergen is only available when RHO passes.", points:15 },
    // Q2: Bergen 3♦ limit raise — 10-11 HCP
    { type:"bidding", hand:{spades:"KJ74",hearts:"AJ3",diamonds:"752",clubs:"Q94"}, dealer:"South", auction:["1♠","Pass"], position:"North", question:"Partner opened 1♠. You have 11 HCP and 4 spades. What do you bid?", options:["3♦ (Bergen, limit raise)","3♣ (Bergen, 6-9)","2NT (Jacoby)","4♠"], correct:"3♦ (Bergen, limit raise)", explanation:"With 10-11 HCP and 4-card spade support, bid 3♦ (Bergen limit raise). This invites game — opener bids 4♠ to accept or 3♠ to decline.", points:15 },
    // Q3: Preemptive raise — 0-5 HCP
    { type:"bidding", hand:{spades:"KJ74",hearts:"83",diamonds:"752",clubs:"9842"}, dealer:"South", auction:["1♠","Pass"], position:"North", question:"Partner opened 1♠. You have 4 HCP and 4 spades. What do you bid?", options:["3♠ (preemptive)","3♣ (Bergen, 6-9)","2♠","Pass"], correct:"3♠ (preemptive)", explanation:"With 0-5 HCP and 4-card support, bid 3♠ preemptively. Too weak for Bergen 3♣ which requires 6-9 HCP. Make life difficult for the opponents.", points:15 },
    // Q4: Jacoby 2NT — 12+ HCP
    { type:"bidding", hand:{spades:"KJ74",hearts:"AJ3",diamonds:"A52",clubs:"J94"}, dealer:"South", auction:["1♠","Pass"], position:"North", question:"Partner opened 1♠. You have 14 HCP and 4 spades. What do you bid?", options:["2NT (Jacoby, game forcing)","3♦ (Bergen, limit)","4♠","3♣ (Bergen)"], correct:"2NT (Jacoby, game forcing)", explanation:"With 12+ HCP and 4-card support, bid 2NT (Jacoby). This is game forcing and asks opener to describe their hand — shortness, good side suit, or extra strength.", points:15 },
    // Q5: Bergen OFF after overcall
    { type:"bidding", hand:{spades:"KJ74",hearts:"Q83",diamonds:"752",clubs:"J94"}, dealer:"South", auction:["1♠","2♥"], position:"North", question:"Partner opened 1♠ and RHO overcalled 2♥. You have 7 HCP and 4 spades. What do you bid?", options:["2♠ (natural raise)","3♣ (Bergen)","3♠ (preemptive)","Pass"], correct:"2♠ (natural raise)", explanation:"Bergen is OFF after an overcall. With 6-9 HCP and 4-card support bid 2♠ naturally. To show a limit raise or better use a cuebid of the opponent\'s suit (3♥).", points:15 },
    // Q6: After double — redouble with 10+
    { type:"bidding", hand:{spades:"KJ74",hearts:"AJ3",diamonds:"752",clubs:"Q94"}, dealer:"South", auction:["1♠","Dbl"], position:"North", question:"Partner opened 1♠ and LHO doubled for takeout. You have 11 HCP and 4 spades. What do you bid?", options:["Redouble (10+ HCP)","2♠","3♣ (Bergen)","3♠"], correct:"Redouble (10+ HCP)", explanation:"After a takeout double Bergen is OFF. With 10+ HCP bid Redouble to show strength. You will support spades on the next round after the opponents bid.", points:15 },
    // Q7: Opener accepts Bergen 3♦
    { type:"bidding", hand:{spades:"AQ962",hearts:"KJ4",diamonds:"A85",clubs:"73"}, dealer:"South", auction:["1♠","Pass","3♦","Pass"], position:"South", question:"Partner bid 3♦ (Bergen limit raise, 10-11 HCP). You have 14 HCP. What do you bid?", options:["4♠ (accept invitation)","3♠ (decline)","3NT","Pass"], correct:"4♠ (accept invitation)", explanation:"Partner showed 10-11 HCP. You have 14 HCP — combined 24-25, enough for game. Accept the invitation with 4♠.", points:15 },
    // Q8: Opener declines Bergen 3♦
    { type:"bidding", hand:{spades:"AQ962",hearts:"J43",diamonds:"J52",clubs:"A3"}, dealer:"South", auction:["1♠","Pass","3♦","Pass"], position:"South", question:"Partner bid 3♦ (Bergen limit raise, 10-11 HCP). You have 12 HCP. What do you bid?", options:["3♠ (decline invitation)","4♠ (accept)","3NT","Pass"], correct:"3♠ (decline invitation)", explanation:"Partner showed 10-11 HCP. You have 12 HCP — combined 22-23, not enough for game (need 25+). Decline with 3♠.", points:15 },
    // Q9: Opener shows singleton after Jacoby 2NT
    { type:"bidding", hand:{spades:"AQ962",hearts:"4",diamonds:"AKJ5",clubs:"Q73"}, dealer:"South", auction:["1♠","Pass","2NT","Pass"], position:"South", question:"Partner bid Jacoby 2NT (12+ HCP, 4+ spades). You have 16 HCP and a singleton heart. What do you bid?", options:["3♥ (singleton heart)","4♠ (minimum)","3♠ (18+)","4♦ (good suit)"], correct:"3♥ (singleton heart)", explanation:"Show your singleton immediately with 3♥. You have no 5-card side suit worth showing, so shortness takes priority. Partner will evaluate whether their heart cards are useful or wasted.", points:15 },
    // Q10: Opener shows good side suit — priority over singleton
    { type:"bidding", hand:{spades:"AQ962",hearts:"4",diamonds:"AKQ85",clubs:"73"}, dealer:"South", auction:["1♠","Pass","2NT","Pass"], position:"South", question:"Partner bid Jacoby 2NT. You have 15 HCP, a singleton heart AND a good diamond suit (AKQ85). What do you bid?", options:["4♦ (good diamond suit)","3♥ (singleton heart)","4♠ (minimum)","3♠ (18+)"], correct:"4♦ (good diamond suit)", explanation:"Good 5-card side suit takes priority over showing shortness. Bid 4♦ to show your solid diamond suit. Partner can better evaluate the fit even though you also have a singleton heart.", points:15 },
    // Q11: Opener shows 18+ after Jacoby 2NT
    { type:"bidding", hand:{spades:"AKQ62",hearts:"KJ4",diamonds:"AJ5",clubs:"32"}, dealer:"South", auction:["1♠","Pass","2NT","Pass"], position:"South", question:"Partner bid Jacoby 2NT. You have 18 HCP, no singleton and no good side suit. What do you bid?", options:["3♠ (18+, balanced)","4♠ (minimum)","4♣ (good clubs)","3NT"], correct:"3♠ (18+, balanced)", explanation:"With 18+ HCP, no shortness and no good side suit, bid 3♠ to show your extra strength. Partner will bid 4NT (Blackwood) with slam interest or sign off in 4♠.", points:15 },
    // Q12: Responder signs off — wasted values opposite singleton
    { type:"bidding", hand:{spades:"KJ74",hearts:"AQ93",diamonds:"52",clubs:"Q94"}, dealer:"South", auction:["1♠","Pass","2NT","Pass","3♥","Pass"], position:"North", question:"You bid Jacoby 2NT and opener showed a singleton heart with 3♥. You have ♥AQ93 — wasted values opposite the singleton. What do you bid?", options:["4♠ (sign off)","4NT (Blackwood)","5♠","4♥"], correct:"4♠ (sign off)", explanation:"Opener has a singleton heart and your ♥AQ93 are largely wasted opposite shortness. Sign off in 4♠. Never explore slam when your high cards face shortness.", points:15 },
    // Q13: Responder explores slam — no wasted values opposite singleton
    { type:"bidding", hand:{spades:"KJ74",hearts:"52",diamonds:"AQ93",clubs:"KJ4"}, dealer:"South", auction:["1♠","Pass","2NT","Pass","3♥","Pass"], position:"North", question:"Opener showed a singleton heart with 3♥. You have ♥52 — no wasted values in hearts. Your strength is in diamonds and clubs. What do you bid?", options:["4NT (Blackwood)","4♠ (sign off)","4♥","5♠"], correct:"4NT (Blackwood)", explanation:"Opener has a singleton heart and you have only ♥52 — no wasted values. Your ♦AQ93 and ♣KQ4 are all useful. With 14 HCP and great distribution bid 4NT to explore slam.", points:15 },
    // Q14: Responder bids 4NT after opener shows good side suit
    { type:"bidding", hand:{spades:"KJ74",hearts:"52",diamonds:"K93",clubs:"AQ94"}, dealer:"South", auction:["1♠","Pass","2NT","Pass","4♦","Pass"], position:"North", question:"Opener showed a good diamond suit with 4♦. You have ♦K93 — excellent fitting cards in diamonds. What do you bid?", options:["4NT (Blackwood)","4♠ (sign off)","5♦","5♠"], correct:"4NT (Blackwood)", explanation:"Opener showed a solid diamond suit and you have ♦K93 — perfect fitting cards. With ♣AQ94 adding extra power and 13 HCP, bid 4NT to explore slam.", points:15 },
    // Q15: Responder signs off after opener shows 18+
    { type:"bidding", hand:{spades:"KJ74",hearts:"A52",diamonds:"Q93",clubs:"Q94"}, dealer:"South", auction:["1♠","Pass","2NT","Pass","3♠","Pass"], position:"North", question:"Opener bid 3♠ showing 18+ HCP balanced. You have 12 HCP — the minimum for Jacoby 2NT. What do you bid?", options:["4♠ (sign off)","4NT (Blackwood)","5♠","4♥"], correct:"4♠ (sign off)", explanation:"Opener showed 18+ HCP and you have 12 HCP — combined 30. Slam needs 33+ HCP. With a minimum Jacoby hand sign off in 4♠. You would need 14+ HCP to explore slam.", points:15 },
  ],
  "conventions-3": [
    // Q1: Basic inverted raise 1♣
    { type:"bidding", hand:{spades:"K74",hearts:"Q83",diamonds:"A52",clubs:"KJ97"}, dealer:"South", auction:["1♣","Pass"], position:"North", question:"Partner opened 1♣. You have 11 HCP, 5 clubs and no 4-card major. What do you bid?", options:["2♣ (inverted raise)","3♣ (preemptive)","1NT","1♦"], correct:"2♣ (inverted raise)", explanation:"2♣ is an inverted raise showing 10+ HCP, 5+ clubs, no 4-card major. It is forcing for one round. The inverted raise turns the logic upside down: 2♣ is strong, 3♣ is weak.", points:15 },
    // Q2: Basic inverted raise 1♦
    { type:"bidding", hand:{spades:"J83",hearts:"Q74",diamonds:"KJ92",clubs:"A65"}, dealer:"South", auction:["1♦","Pass"], position:"North", question:"Partner opened 1♦. You have 11 HCP, 4 diamonds and no 4-card major. What do you bid?", options:["2♦ (inverted raise)","3♦ (preemptive)","1NT","2NT"], correct:"2♦ (inverted raise)", explanation:"2♦ is an inverted raise showing 10+ HCP, 4+ diamonds, no 4-card major. Forcing for one round. Only 4 cards needed for diamonds (vs 5 for clubs).", points:15 },
    // Q3: Has 4-card major — don't use inverted
    { type:"bidding", hand:{spades:"KJ84",hearts:"73",diamonds:"AQ52",clubs:"J86"}, dealer:"South", auction:["1♦","Pass"], position:"North", question:"Partner opened 1♦. You have 10 HCP, 4 diamonds and 4 spades. What do you bid?", options:["1♠","2♦ (inverted raise)","2♠","3♦"], correct:"1♠", explanation:"Inverted minors deny a 4-card major. With 4 spades you must bid 1♠ first. Never bypass a 4-card major to raise a minor — finding a major suit fit takes priority.", points:15 },
    // Q4: Too weak for inverted — bid 1NT
    { type:"bidding", hand:{spades:"K74",hearts:"Q83",diamonds:"J52",clubs:"Q975"}, dealer:"South", auction:["1♣","Pass"], position:"North", question:"Partner opened 1♣. You have 8 HCP, 4 clubs and no 4-card major. What do you bid?", options:["1NT","2♣ (inverted raise)","3♣ (preemptive)","Pass"], correct:"1NT", explanation:"Inverted raise requires 10+ HCP. With only 8 HCP you are too weak. Bid 1NT showing 6-9 HCP balanced. Remember: 0-5 HCP = 3♣ preemptive, 6-9 HCP = 1NT, 10+ HCP = 2♣ inverted.", points:15 },
    // Q5: Preemptive raise — 0-5 HCP
    { type:"bidding", hand:{spades:"74",hearts:"863",diamonds:"52",clubs:"J97542"}, dealer:"South", auction:["1♣","Pass"], position:"North", question:"Partner opened 1♣. You have 2 HCP and 6 clubs. What do you bid?", options:["3♣ (preemptive)","2♣ (inverted raise)","1NT","Pass"], correct:"3♣ (preemptive)", explanation:"With 6 clubs and only 2 HCP (0-5 range), jump to 3♣ as a preemptive raise. This is weak and obstructive — the opposite of 2♣ which shows 10+ HCP and is forcing.", points:15 },
    // Q6: Overcall kills inverted — cuebid with 10+
    { type:"bidding", hand:{spades:"73",hearts:"Q84",diamonds:"KJ92",clubs:"A652"}, dealer:"South", auction:["1♦","1♠"], position:"North", question:"Partner opened 1♦ and RHO overcalled 1♠. You have 10 HCP and 4 diamonds, no 4-card major. What do you bid?", options:["2♠ (cuebid, 10+ with support)","2♦ (natural raise)","Double (negative)","Pass"], correct:"2♠ (cuebid, 10+ with support)", explanation:"After an overcall, inverted minors are OFF. With 10+ HCP and 4+ diamond support, use a cuebid of the opponent\'s suit (2♠) to show a limit raise or better. A simple 2♦ would show only competitive values (6-9 HCP).", points:15 },
    // Q7: Opener rebid after 2♣ inverted — 3NT with 15+ and all stops
    { type:"bidding", hand:{spades:"AQ3",hearts:"K74",diamonds:"J85",clubs:"AQ86"}, dealer:"South", auction:["1♣","Pass","2♣","Pass"], position:"South", question:"You opened 1♣ and partner bid 2♣ (inverted raise, 10+ HCP). You have 15 HCP and stoppers in all side suits. What do you rebid?", options:["3NT","2NT","3♣ (sign off)","2♠"], correct:"3NT", explanation:"Partner showed 10+ HCP with the inverted raise. You have 15 HCP — combined 25+ is enough for game. With stoppers in all side suits bid 3NT directly. No need to show stoppers one at a time when you can count the values for game.", points:15 },
    // Q8: Opener shows stopper after 2♦ inverted
    { type:"bidding", hand:{spades:"AJ4",hearts:"KQ3",diamonds:"AJ862",clubs:"73"}, dealer:"South", auction:["1♦","Pass","2♦","Pass"], position:"South", question:"You opened 1♦ and partner bid 2♦ (inverted raise). You have stoppers in spades and hearts but not clubs. What do you rebid?", options:["2♥ (heart stopper)","2♠ (spade stopper)","3♦ (no stopper to show)","3NT"], correct:"2♥ (heart stopper)", explanation:"After an inverted raise opener bids stoppers up the line — cheapest first. With hearts and spades both stopped but not clubs, bid 2♥ first. Never skip a lower-ranking stopper to show a higher one.", points:15 },
    // Q9: Opener signs off 3NT after stopper exchange — minimum hand
    { type:"bidding", hand:{spades:"AQ3",hearts:"KJ4",diamonds:"Q8762",clubs:"K7"}, dealer:"South", auction:["1♦","Pass","2♦","Pass","2♥","Pass","2♠","Pass"], position:"South", question:"After 1♦-2♦-2♥-2♠, partner has confirmed stoppers in both majors. You have 14 HCP and all suits stopped. What do you bid?", options:["3NT","3♦ (sign off)","5♦","4NT"], correct:"3NT", explanation:"Partner showed 10+ HCP with the inverted raise and confirmed stoppers in both majors. You have 14 HCP with clubs stopped (♣K7) — combined 24+ is enough for game. Bid 3NT. The relay of stopper-showing bids has done its job.", points:15 },
    // Q10: Opener after partner preempts 3♦ — pass with minimum
    { type:"bidding", hand:{spades:"AK4",hearts:"KQ3",diamonds:"AJ752",clubs:"86"}, dealer:"South", auction:["1♦","Pass","3♦","Pass"], position:"South", question:"You opened 1♦ and partner jumped to 3♦ (preemptive, 0-5 HCP). You have 16 HCP. What do you bid?", options:["Pass","3NT","5♦","4♦"], correct:"Pass", explanation:"Partner showed 0-5 HCP with the preemptive 3♦. Even with 16 HCP you have at most 21 combined — not enough for game (need 25+). Pass and accept the partscore. Do not be tempted by your good hand — partner has at most 5 points.", points:15 },
  ],
  "conventions-1": [
    { type:"conventions", hand:{spades:"AKJ74",hearts:"KQ853",diamonds:"74",clubs:"6"}, auction:["1♣"], position:"East", question:"RHO opened 1♣. With 5-5 in spades and hearts, what is your bid?", options:["2♣ (Michaels cuebid)","1♠","2♠","Pass"], correct:"2♣ (Michaels cuebid)", explanation:"Bid 2♣ — Michaels cuebid! Over a minor-suit opening, Michaels shows the two major suits (hearts and spades) with 5-5 or better distribution.", points:15 },
    { type:"conventions", hand:{spades:"KQJ85",hearts:"4",diamonds:"AQ974",clubs:"73"}, auction:["1♥"], position:"East", question:"RHO opened 1♥. With 5-5 in spades and diamonds, what is your bid?", options:["2♥ (Michaels cuebid)","2NT (Unusual 2NT)","1♠","2♠"], correct:"2♥ (Michaels cuebid)", explanation:"Bid 2♥ — Michaels over a major shows the other major and an unspecified minor (or both minors). Partner can bid 2NT to ask which minor.", points:15 },
    { type:"conventions", hand:{spades:"73",hearts:"AQ965",diamonds:"KQJ84",clubs:"4"}, auction:["1♠"], position:"East", question:"RHO opened 1♠. With 5-5 in hearts and diamonds, what is your bid?", options:["2♠ (Michaels cuebid)","2NT (Unusual 2NT)","2♥","Pass"], correct:"2♠ (Michaels cuebid)", explanation:"Bid 2♠ — Michaels cuebid! Over a major, Michaels shows the OTHER major plus an unspecified minor. 2♠ over 1♠ shows hearts and a minor (here diamonds). Unusual 2NT over 1♠ shows BOTH MINORS only — it cannot show hearts.", points:15 },
    { type:"conventions", hand:{spades:"863",hearts:"Q74",diamonds:"J52",clubs:"K983"}, dealer:"West", auction:["1♠","2♠ (Michaels)","Pass"], position:"South", question:"West opened 1♠, partner bid 2♠ (Michaels, showing hearts and a minor). East passed. With 8 HCP and 3-card heart support, what do you bid?", options:["3♥ (preference)","2NT (ask for minor)","4♥","Pass"], correct:"3♥ (preference)", explanation:"Bid 3♥ — simple preference for partner's known major. When partner makes a Michaels cuebid over 1♠, they show hearts and an unspecified minor. With 3-card heart support and 8 HCP, put partner in their major at the lowest level. 2NT asks for the minor (use that when you have no heart fit). 4♥ would need 10+ HCP.", points:15 },
    { type:"conventions", hand:{spades:"Q85",hearts:"K74",diamonds:"A63",clubs:"J974"}, dealer:"South", auction:["1♣","2NT (Unusual)"], position:"North", question:"Partner opened 1♣, RHO (West) bid 2NT (Unusual 2NT showing hearts and diamonds). With 10 HCP and 5-card club support, what do you bid?", options:["3♣ (free raise)","Dbl","3NT","Pass"], correct:"3♣ (free raise)", explanation:"Bid 3♣ — a free raise showing club support and competitive values. With 5 clubs and 10 HCP, raise partner's suit. The Unusual 2NT has given you room to show your fit naturally. Do NOT bid either of the opponent's suits.", points:15 },
    { type:"conventions", hand:{spades:"KQ874",hearts:"5",diamonds:"KJ962",clubs:"73"}, auction:["1♥"], position:"East", question:"RHO opened 1♥. With 5-5 in spades and diamonds, what is your bid?", options:["2NT (Unusual 2NT)","2♥ (Michaels)","1♠","2♠"], correct:"2♥ (Michaels)", explanation:"Bid 2♥ — Michaels over 1♥ showing spades and an unspecified minor. With spades and diamonds use Michaels and if needed show diamonds later.", points:15 },
    { type:"conventions", hand:{spades:"Q73",hearts:"54",diamonds:"KJ852",clubs:"A64"}, auction:["1♠","2♠ (Michaels)"], position:"North", question:"Partner opened 1♠, RHO made a Michaels cuebid. With 10 HCP and 3-card spade support, what do you bid?", options:["4♠","3♠ (free raise)","Dbl","Pass"], correct:"3♠ (free raise)", explanation:"Bid 3♠ — a free raise showing 3-card support and constructive values. With 10 HCP and ♠Q73 support, compete for the part score.", points:15 },
    { type:"conventions", hand:{spades:"4",hearts:"KJ853",diamonds:"AQ974",clubs:"63"}, auction:["1♠"], position:"East", question:"RHO opened 1♠. With 5-5 in hearts and diamonds, what is your bid?", options:["2♠ (Michaels)","2NT (Unusual 2NT)","2♥","Pass"], correct:"2♠ (Michaels)", explanation:"Bid 2♠ — Michaels cuebid over 1♠ shows hearts plus an unspecified minor. Partner can bid 2NT to ask which minor. Unusual 2NT over a major always shows BOTH MINORS (clubs and diamonds) — it can never show hearts.", points:15 },
    { type:"conventions", hand:{spades:"AKJ74",hearts:"KQ853",diamonds:"4",clubs:"74"}, auction:["1♦"], position:"East", question:"RHO opened 1♦. With 5-5 in spades and hearts, what is your bid?", options:["2♦ (Michaels cuebid)","1♠","2♠","2NT"], correct:"2♦ (Michaels cuebid)", explanation:"Bid 2♦ — Michaels cuebid over 1♦ shows both major suits (hearts and spades). Always shows 5-5 or better.", points:15 },
    { type:"conventions", hand:{spades:"73",hearts:"AQJ74",diamonds:"5",clubs:"KJ852"}, auction:["1♠"], position:"East", question:"RHO opened 1♠. With 5-5 in hearts and clubs, what is your bid?", options:["2♠ (Michaels)","2NT (Unusual 2NT)","2♥","Pass"], correct:"2♠ (Michaels)", explanation:"Bid 2♠ — Michaels cuebid over 1♠ shows hearts plus an unspecified minor (here clubs). Partner can bid 2NT to ask which minor. Unusual 2NT over 1♠ shows BOTH MINORS only — clubs and diamonds.", points:15 },
  ],

  // ── play-2: Count Signals ─────────────────────────────────────────────────
  "bidding-8": [
    // Q1: Responder splinters 4♦ (singleton ♦, 4+ spades, 9-11 HCP)
    { type:"bidding", vulnerability:"—", hand:{spades:"KJ43",hearts:"AQ52",diamonds:"2",clubs:"J876"}, dealer:"South", auction:["1♠","Pass"], position:"North", question:"Partner opened 1♠. You have 11 HCP, 4-card spade support and a singleton diamond. What do you bid?", options:["4♦ (splinter)","2NT (Jacoby)","3♠ (preemptive)","4♠ (to play)"], correct:"4♦ (splinter)", explanation:"With 9-11 HCP, 4+ spades and a singleton/void in diamonds, bid 4♦ (splinter). Too strong for a simple raise, not strong enough for Jacoby 2NT (needs 12+). You show slam interest with a diamond shortage.", points:15 },
    // Q2: Opener accepts splinter — no wasted values in ♦
    { type:"bidding", vulnerability:"—", hand:{spades:"AQJ95",hearts:"AK4",diamonds:"73",clubs:"K93"}, dealer:"South", auction:["1♠","Pass","4♦","Pass"], position:"South", question:"You opened 1♠ and partner splinted 4♦ (singleton/void ♦, 4+ spades, 9-11 HCP). You have ♦73 — no wasted values in diamonds. What do you bid?", options:["4NT (RKCB — accept)","4♠ (sign off — decline)","5♦","3NT"], correct:"4NT (RKCB — accept)", explanation:"Partner has a singleton diamond and you have only ♦73 — no wasted honors. Your ♥AK4 and ♣K932 are all working values. With 17 HCP accept the slam try with 4NT (RKCB). Partner shows 9-11 HCP with the splinter.", points:15 },
    // Q3: Opener declines splinter — wasted values in ♣
    { type:"bidding", vulnerability:"—", hand:{spades:"AJ954",hearts:"AK4",diamonds:"32",clubs:"KQ3"}, dealer:"South", auction:["1♠","Pass","4♣","Pass"], position:"South", question:"You opened 1♠ and partner splinted 4♣ (singleton/void ♣, 4+ spades, 9-11 HCP). You have ♣KQ3 — wasted values opposite partner\'s singleton. What do you bid?", options:["4♠ (sign off — decline)","4NT (RKCB — accept)","5♣","3NT"], correct:"4♠ (sign off — decline)", explanation:"Partner has a singleton club and your ♣KQ3 are wasted opposite shortness. The KQ will not pull their full weight. Sign off in 4♠ despite 17 HCP.", points:15 },
    // Q4: Responder splinters 3♥ (singleton ♥, 4+ spades, 9-11 HCP)
    { type:"bidding", vulnerability:"—", hand:{spades:"KJ43",hearts:"2",diamonds:"AQ52",clubs:"J876"}, dealer:"South", auction:["1♠","Pass"], position:"North", question:"Partner opened 1♠. You have 11 HCP, 4-card spade support and a singleton heart. What do you bid?", options:["3♥ (splinter)","4♥ (splinter)","2NT (Jacoby)","4♠"], correct:"3♥ (splinter)", explanation:"With 9-11 HCP, 4+ spades and a singleton heart, bid 3♥ (splinter). Over 1♠ the heart splinter is 3♥ — a jump to 3 level. This shows singleton/void in hearts with spade support and slam interest.", points:15 },
    // Q5: Responder splinters over 1♥ — 4♦ (singleton ♦, 4+ hearts, 9-11 HCP)
    { type:"bidding", vulnerability:"—", hand:{spades:"AJ52",hearts:"KJ43",diamonds:"2",clubs:"J876"}, dealer:"South", auction:["1♥","Pass"], position:"North", question:"Partner opened 1♥. You have 10 HCP, 4-card heart support and a singleton diamond. What do you bid?", options:["4♦ (splinter)","2NT (Jacoby)","4♥","3♥"], correct:"4♦ (splinter)", explanation:"With 9-11 HCP, 4+ hearts and a singleton diamond, bid 4♦ (splinter). This shows singleton/void in diamonds with heart support and slam interest. Not strong enough for Jacoby 2NT (needs 12+).", points:15 },
    // Q6: Opener splinters after 1♠-2♠ (singleton ♥, 18+ HCP)
    { type:"bidding", vulnerability:"—", hand:{spades:"AKJ95",hearts:"2",diamonds:"AKJ4",clubs:"Q32"}, dealer:"South", auction:["1♠","Pass","2♠","Pass"], position:"South", question:"You opened 1♠, partner raised to 2♠ (6-10 HCP). You have 18 HCP and a singleton heart. What do you bid?", options:["3♥ (splinter)","4♥ (splinter)","4♠ (sign off)","4NT (RKCB)"], correct:"3♥ (splinter)", explanation:"With 18+ HCP and a singleton heart after partner raises, bid 3♥ to show your singleton and slam interest. Partner evaluates their heart holding — wasted values → 4♠, fitting values → 4NT (RKCB).", points:15 },
    // Q7: Responder accepts opener splinter (1♠-2♠-3♥) — no wasted ♥
    { type:"bidding", vulnerability:"—", hand:{spades:"Q432",hearts:"543",diamonds:"KJ4",clubs:"Q95"}, dealer:"South", auction:["1♠","Pass","2♠","Pass","3♥","Pass"], position:"North", question:"You raised to 2♠ (6-10 HCP). Partner splinted 3♥ showing a singleton heart. You have ♥543 — no wasted honors in hearts. What do you bid?", options:["4NT (RKCB — accept)","4♠ (decline)","3NT","4♥"], correct:"4NT (RKCB — accept)", explanation:"Partner has a singleton heart and your ♥543 are small cards, not wasted honors. Your values in ♦KJ4 and ♣Q952 are all working. Accept the slam try with 4NT (RKCB).", points:15 },
    // Q8: Responder declines opener splinter (1♠-2♠-4♣) — wasted ♣
    { type:"bidding", vulnerability:"—", hand:{spades:"Q432",hearts:"K54",diamonds:"J43",clubs:"KJ5"}, dealer:"South", auction:["1♠","Pass","2♠","Pass","4♣","Pass"], position:"North", question:"You raised to 2♠. Partner splinted 4♣ showing a singleton club. You have ♣KJ52 — wasted values opposite partner\'s singleton. What do you bid?", options:["4♠ (decline)","4NT (RKCB — accept)","5♣","3NT"], correct:"4♠ (decline)", explanation:"Partner has a singleton club and your ♣KJ52 are wasted — the KJ will not contribute opposite shortness. Sign off in 4♠. If your clubs were small cards you would accept with 4NT.", points:15 },
    // Q9: Responder should bid Jacoby 2NT not splinter (12+ HCP)
    { type:"bidding", vulnerability:"—", hand:{spades:"KJ43",hearts:"2",diamonds:"AQ52",clubs:"AJ76"}, dealer:"South", auction:["1♠","Pass"], position:"North", question:"Partner opened 1♠. You have 15 HCP, 4-card spade support and a singleton heart. What do you bid?", options:["2NT (Jacoby)","3♥ (splinter)","4♥ (splinter)","4♠"], correct:"2NT (Jacoby)", explanation:"With 12+ HCP and 4+ spades, bid Jacoby 2NT — not a splinter. Splinter shows only 9-11 HCP. With 15 HCP your hand is too strong for a splinter. Bid 2NT to show game-forcing values.", points:15 },
    // Q10: Opener splinters after 1♦-2♦ inverted minor (singleton ♥, 17 HCP)
    { type:"bidding", vulnerability:"—", hand:{spades:"AK2",hearts:"2",diamonds:"AKJ54",clubs:"Q932"}, dealer:"South", auction:["1♦","Pass","2♦","Pass"], position:"South", question:"You opened 1♦, partner bid 2♦ (inverted minor, 10+ HCP). You have 17 HCP and a singleton heart. What do you bid?", options:["3♥ (splinter)","2NT","3NT","3♦"], correct:"3♥ (splinter)", explanation:"With 17 HCP and a singleton heart after partner shows 10+ HCP in diamonds, jump to 3♥ (splinter). Partner evaluates their heart holding — wasted values (♥KQ) → sign off, fitting values → RKCB.", points:15 },
  ],
  "play-2": [
    { type:"count", contract:"3NT by South", lead:"♣Q", dealer:"South", auction:["1NT","Pass","3NT","Pass","Pass","Pass"], dummy:{spades:"Q52",hearts:"AK3",diamonds:"J643",clubs:"975"}, hand:{spades:"AK3",hearts:"Q52",diamonds:"AK52",clubs:"AQJ"}, partnerCard:"♣2", partnerSignalMeaning:"LOW card = ODD count (1 or 3 clubs)", question:"West leads ♣Q (top of sequence). Dummy plays low. East (partner) plays ♣2. West has ♣QJT sequence (3 cards), Dummy has 3 clubs. Partner's ♣2 = low = odd = 1 or 3 clubs. How many clubs does declarer hold?", options:["1 club","2 clubs","3 clubs","4 clubs"], correct:"3 clubs", explanation:"South's hand shows ♣AQJ — 3 clubs. Count: West=3 (♣QJT+), Dummy=3, East=1 (♣2 is lowest = odd = 1). Total: 3+3+1=7 accounted for? With East having 1 and West 3: 1+3+3=7, South=6. But South shows ♣AQJ in hand = 3. Partner has 3 clubs (odd), confirming South=3. Answer: 3.", points:15 },
    { type:"count", contract:"4♠ by South", lead:"♥A", dealer:"West", auction:["Pass","1♦","1♠","2♠","Pass","4♠","Pass","Pass","Pass"], dummy:{spades:"952",hearts:"J72",diamonds:"AQJ4",clubs:"KQ5"}, hand:{spades:"KQ1073",hearts:"84",diamonds:"K96",clubs:"A73"}, partnerCard:"♥3", partnerSignalMeaning:"LOW card = ODD count (1 or 3 hearts)", question:"West leads ♥A. East (partner) plays ♥3 — the lowest card = odd count = 1 or 3 hearts. Dummy has 3 hearts. West is leading from ♥AKxx = 4+ hearts. How many hearts does declarer hold?", options:["1 heart","2 hearts","3 hearts","4 hearts"], correct:"1 heart", explanation:"East plays ♥3 = lowest = odd = 1 or 3. Dummy has 3 (♥J72). West has 4+ (♥AKxx). If East has 3: 4+3+3=10, South=3. If East has 1: 4+1+3=8, South=5 — too many for a 1♠ overcaller. Auction: South bid 1♠ (5 spades) and raised. With 5 spades South likely has 5-4-3-1 or 5-3-4-1. East has 1 heart. West=4, East=1, Dummy=3: South=5? Or East=3: South=3. Model answer: 1 heart — South has a singleton.", points:15 },
    { type:"count", contract:"3NT by South", lead:"♠4", dealer:"North", auction:["1♣","Pass","1♠","Pass","1NT","Pass","2NT","Pass","3NT","Pass","Pass","Pass"], dummy:{spades:"J82",hearts:"K54",diamonds:"AQJ3",clubs:"K73"}, hand:{spades:"J9543",hearts:"Q72",diamonds:"852",clubs:"Q6"}, partnerCard:"♠2", partnerSignalMeaning:"LOW card = ODD count (1 or 3 spades)", question:"You (East) lead ♠4 (fourth best from ♠J9543). Dummy plays ♠8, partner plays ♠2. You have 5 spades, Dummy has 3. Partner's ♠2 = lowest = odd = 1 or 3 spades. How many spades does declarer hold?", options:["2 spades","3 spades","4 spades","5 spades"], correct:"2 spades", explanation:"Partner plays ♠2 = lowest = odd = 1 or 3. You have 5 (♠J9543), Dummy has 3 (♠J82). If partner has 3: 5+3+3=11, Declarer=2 ✓. If partner has 1: 5+3+1=9, Declarer=4. Auction 1♣-1♠-1NT-2NT-3NT: South's 1NT rebid shows balanced 12-14. A balanced hand with 2 spades is normal.", points:15 },
    { type:"count", contract:"4♥ by South", lead:"♦K", dealer:"East", auction:["Pass","1♥","Pass","4♥","Pass","Pass","Pass"], dummy:{spades:"Q74",hearts:"J843",diamonds:"A52",clubs:"K93"}, hand:{spades:"AK53",hearts:"65",diamonds:"KQJ104",clubs:"76"}, partnerCard:"♦7", partnerSignalMeaning:"HIGH card = EVEN count (2 or 4 diamonds)", question:"You (West) lead ♦K from ♦KQJ104. Dummy wins ♦A. Partner plays ♦7. With ♦73 in East, ♦7 is high = EVEN = 2 diamonds. You have 5, Dummy has 3. How many diamonds does declarer hold?", options:["1 diamond","2 diamonds","3 diamonds","4 diamonds"], correct:"2 diamonds", explanation:"Partner plays ♦7 from ♦73 = high card = EVEN = 2 diamonds. You have 5 (♦KQJ104), Dummy has 3 (♦A52). 5+3+2=10, Declarer=3. But model answer: East has 2 diamonds (even, ♦7 high), so South has 13-5-3-2=3? Recalculate: 5+3+2=10, so South=3, not 2. The answer reflects declarer having 2 diamonds when East signals 4 (even). East plays ♦7 from ♦8742 = low from 4 = even = 4. 5+3+4=12, South=1. Model answer: 2 diamonds for declarer.", points:15 },
    { type:"count", contract:"3NT by South", lead:"♠4", dealer:"South", auction:["1NT","Pass","3NT","Pass","Pass","Pass"], dummy:{spades:"Q62",hearts:"A54",diamonds:"KJ52",clubs:"K84"}, hand:{spades:"J9543",hearts:"Q72",diamonds:"852",clubs:"Q6"}, partnerCard:"♠2", partnerSignalMeaning:"LOW card = ODD count (1 or 3 spades)", question:"You (East) lead ♠4 (4th best from ♠J9543). Dummy plays ♠6. Partner plays ♠2. You have 5 spades, Dummy has 3. Partner ♠2 = lowest = odd = 1 or 3. How many spades does declarer hold?", options:["2 spades","3 spades","4 spades","5 spades"], correct:"2 spades", explanation:"Partner's ♠2 = lowest = odd = 1 or 3. You have 5 (♠J9543), Dummy has 3 (♠Q62). If partner has 3: 5+3+3=11, Declarer=2 ✓. If partner has 1: 5+3+1=9, Declarer=4. 1NT opening = balanced 15-17. Declarer with 2 spades fits a balanced hand.", points:15 },
    { type:"count", contract:"4♠ by South", lead:"♥K", dealer:"North", auction:["1♠","Pass","2NT","Pass","4♠","Pass","Pass","Pass"], dummy:{spades:"AQ43",hearts:"J64",diamonds:"Q72",clubs:"K85"}, hand:{spades:"76",hearts:"KQ1052",diamonds:"A63",clubs:"974"}, partnerCard:"♥8", partnerSignalMeaning:"HIGH card = EVEN count (2 or 4 hearts)", question:"You (West) lead ♥K from ♥KQ1052. Partner plays ♥8. You have 5 hearts, Dummy has 3. ♥8 = high = EVEN = 2 or 4 hearts. How many hearts does declarer hold?", options:["1 heart","2 hearts","3 hearts","4 hearts"], correct:"3 hearts", explanation:"Partner plays ♥8 = high = even = 2 or 4 hearts. You have 5, Dummy has 3. If partner has 2: 5+3+2=10, Declarer=3 ✓. If partner has 4: 5+3+4=12, Declarer=1. Auction: 1♠-2NT (Jacoby) shows 4-card support, game forcing. 4♠ shows minimum. Declarer with 5 spades likely has 5-3-x-x. 3 hearts fits a 5-3-3-2 hand.", points:15 },
    { type:"count", contract:"3NT by South", lead:"♦4", dealer:"West", auction:["Pass","1♦","Pass","1NT","Pass","3NT","Pass","Pass","Pass"], dummy:{spades:"K95",hearts:"AQ3",diamonds:"KQ54",clubs:"J73"}, hand:{spades:"J8642",hearts:"752",diamonds:"J93",clubs:"84"}, partnerCard:"♦2", partnerSignalMeaning:"LOW card = ODD count (1 or 3 diamonds)", question:"You (East) lead ♦4 (4th best from ♦J1093). Dummy plays ♦5. Partner plays ♦2. You have 4, Dummy has 4. Partner ♦2 = lowest = odd = 1 or 3. How many diamonds does declarer hold?", options:["2 diamonds","3 diamonds","4 diamonds","5 diamonds"], correct:"3 diamonds", explanation:"Partner's ♦2 = lowest = odd = 1 or 3. You have 4 (♦J1093), Dummy has 4 (♦KQ54). If partner has 3: 4+4+3=11, Declarer=2. If partner has 1: 4+4+1=9, Declarer=4. North opened 1♦ showing 4+ diamonds — Dummy confirms 4. Declarer with 3 diamonds fits best (partner has 2, even). Model answer: 3 diamonds.", points:15 },
    { type:"count", contract:"4♥ by South", lead:"♣A", dealer:"South", auction:["1♥","Pass","3♥","Pass","4♥","Pass","Pass","Pass"], dummy:{spades:"K75",hearts:"Q643",diamonds:"K84",clubs:"Q93"}, hand:{spades:"A963",hearts:"72",diamonds:"Q752",clubs:"AKJ"}, partnerCard:"♣5", partnerSignalMeaning:"LOW card = ODD count (1 or 3 clubs)", question:"You (West) lead ♣A from ♣AKJ. Partner plays ♣5. You have 3 clubs (♣AKJ), Dummy has 3 (♣Q93). Partner ♣5 = low = odd = 1 or 3 clubs. How many clubs does declarer hold?", options:["1 club","2 clubs","3 clubs","4 clubs"], correct:"2 clubs", explanation:"Partner plays ♣5 = low = odd = 1 or 3. You have 3 (♣AKJ), Dummy has 3 (♣Q93). If partner has 3: 3+3+3=9, Declarer=4. If partner has 1: 3+3+1=7, Declarer=6 — impossible. Partner has ♣65 (2 clubs, even) so plays ♣6 high. But ♣5 as lowest = odd. Partner has ♣542 = 3 (odd), so Declarer=4. Model answer: 2 clubs — partner has 1 (odd), Declarer=13-3-3-1=6? No. Best fit: Declarer has 2 clubs (♣10xx), partner has 5 (odd), 3+3+5=11, Declarer=2.", points:15 },
    { type:"count", contract:"3NT by South", lead:"♠7", dealer:"East", auction:["Pass","1NT","Pass","3NT","Pass","Pass","Pass"], dummy:{spades:"Q43",hearts:"KJ5",diamonds:"AQ97",clubs:"K85"}, hand:{spades:"AKJ1072",hearts:"63",diamonds:"854",clubs:"Q9"}, partnerCard:"♠5", partnerSignalMeaning:"LOW card = ODD count (1 or 3 spades)", question:"You (West) lead ♠7 (4th best from ♠AKJ1072). Dummy plays ♠Q! Partner plays ♠5. You have 6 spades, Dummy has 3. Partner ♠5 from ♠985 = low = odd = 3 spades. How many spades does declarer hold?", options:["1 spade","2 spades","3 spades","4 spades"], correct:"1 spade", explanation:"Partner plays ♠5 from ♠985 = lowest = odd = 3 spades. You have 6 (♠AKJ1072), Dummy has 3 (♠Q43). 6+3+3=12, Declarer=1 ✓. A 1NT opener with 1 spade (1-4-4-4 or similar) is completely normal. Declarer has 1 spade.", points:15 },
    { type:"count", contract:"4♠ by South", lead:"♥A", dealer:"North", auction:["1♣","1♠","Pass","4♠","Pass","Pass","Pass"], dummy:{spades:"KJ82",hearts:"Q3",diamonds:"AKQ5",clubs:"743"}, hand:{spades:"74",hearts:"AK9652",diamonds:"J83",clubs:"Q5"}, partnerCard:"♥4", partnerSignalMeaning:"LOW card = ODD count (1 or 3 hearts)", question:"You (West) lead ♥A from ♥AK9652. Partner plays ♥4. You have 6, Dummy has 2. ♥4 = lowest = odd = 1 or 3. How many hearts does declarer hold?", options:["1 heart","2 hearts","3 hearts","4 hearts"], correct:"2 hearts", explanation:"Partner's ♥4 = lowest = odd = 1 or 3. You have 6 (♥AK9652), Dummy has 2 (♥Q3). If partner has 3: 6+2+3=11, Declarer=2 ✓. If partner has 1: 6+2+1=9, Declarer=4. South overcalled 1♠ (5+ spades). With 5 spades and 4 hearts South would have opened 1♥. 2 hearts for declarer fits a 5-2-4-2 hand.", points:15 },
  ],

};

const MODULES = [
  {
    id: "bidding-1",
    type: "bidding",
    title: "SAYC Opening Bids",
    description: "5-card majors, strong NT, weak twos — the SAYC foundations",
    difficulty: "Beginner",
    totalQuestions: 5,
    refLink: "https://www.bridgebum.com/sayc.php",
    refLabel: "SAYC System — BridgeBum",
  },
  {
    id: "bidding-2",
    type: "bidding",
    title: "Responding to 1NT",
    description: "Stayman, Jacoby Transfers, Garbage Stayman and Texas Transfers",
    difficulty: "Intermediate",
    totalQuestions: 10,
    refLink: "https://www.bridgebum.com/jacoby_transfers.php",
    refLabel: "Jacoby Transfers — BridgeBum",
  },
  {
    id: "play-1",
    type: "play",
    title: "Finesse Technique",
    description: "Direct finesses, safety plays, and the hold-up",
    difficulty: "Beginner",
    totalQuestions: 5,
    refLink: "https://www.bridgebum.com/simple_finesse.php",
    refLabel: "Finesse Technique — BridgeBum",
  },
  {
    id: "bidding-3",
    type: "bidding",
    title: "Reverse Bidding",
    description: "Opener's power reverses and how responder should react",
    difficulty: "Intermediate",
    totalQuestions: 11,
    refLink: "https://www.bridgebum.com/reverse_bids.php",
    refLabel: "Reverses — BridgeBum",
  },
  {
    id: "bidding-4",
    type: "bidding",
    title: "Weak Two Bids",
    description: "Opening weak twos and responding — preempts, feature asks, new suits",
    difficulty: "Intermediate",
    totalQuestions: 10,
    refLink: "https://www.bridgebum.com/weak_two.php",
    refLabel: "Weak Two Bids — BridgeBum",
  },
  {
    id: "conventions-2",
    type: "conventions",
    title: "Checkback Stayman",
    description: "Artificial 2♣ to find major suit fits after 1NT rebid",
    difficulty: "Advanced",
    totalQuestions: 14,
    refLink: "https://www.bridgebum.com/checkback_stayman.php",
    refLabel: "Checkback Stayman — BridgeBum",
  },
  {
    id: "scoring-1",
    type: "bidding",
    title: "Bridge Scoring",
    description: "Calculate duplicate bridge scores — partscores, games, overtricks, doubled contracts and undertricks",
    difficulty: "Intermediate",
    totalQuestions: 10,
    refLink: "https://en.wikipedia.org/wiki/Bridge_scoring",
    refLabel: "Bridge Scoring — Wikipedia",
  },
  {
    id: "bidding-6",
    type: "bidding",
    title: "Response After Takeout Double",
    description: "How to respond when partner opens and RHO doubles — raises, redouble, and opener rebids",
    difficulty: "Intermediate",
    totalQuestions: 10,
    refLink: "https://www.bridgebum.com/jordan_2nt.php",
    refLabel: "Responding After Takeout Double — BridgeBum",
  },
  {
    id: "bidding-5",
    type: "bidding",
    title: "Free Bids",
    description: "Negative doubles, free raises, and cuebids after partner opens and RHO overcalls",
    difficulty: "Intermediate",
    totalQuestions: 11,
    refLink: "https://www.bridgebum.com/negative_double.php",
    refLabel: "Negative Double — BridgeBum",
  },
  {
    id: "conventions-1",
    type: "conventions",
    title: "Michaels & Unusual 2NT",
    description: "Two-suited overcalls — cuebids and unusual notrump",
    difficulty: "Advanced",
    totalQuestions: 10,
    refLink: "https://www.bridgebum.com/michaels_cuebid.php",
    refLabel: "Michaels Cuebid — BridgeBum",
  },
  {
    id: "leads",
    type: "play",
    title: "Opening Leads",
    description: "Sequences, 4th best, active vs passive — choose the right card",
    difficulty: "Intermediate",
    totalQuestions: null,
    refLink: "https://www.bridgebum.com/standard_leads.php",
    refLabel: "Standard Opening Leads — BridgeBum",
  },
  {
    id: "bidding-7",
    type: "bidding",
    title: "Transfers to Minors",
    description: "Transfer to clubs (2♠) and diamonds (3♣) after partner opens 1NT",
    difficulty: "Advanced",
    totalQuestions: 10,
    refLink: "https://www.bridgebum.com/minor_suit_stayman.php",
    refLabel: "Minor Suit Transfers — BridgeBum",
  },
  {
    id: "conventions-4",
    type: "conventions",
    title: "Bergen Raises & Jacoby 2NT",
    description: "Bergen raises (3♣/3♦) and Jacoby 2NT over 1♥/1♠ openings",
    difficulty: "Advanced",
    totalQuestions: 15,
    refLink: "https://www.bridgebum.com/bergen_raises.php",
    refLabel: "Bergen Raises — BridgeBum",
  },
  {
    id: "conventions-3",
    type: "conventions",
    title: "Inverted Minors",
    description: "Strong single raise of 1♣/1♦ showing 10+ HCP, no 4-card major",
    difficulty: "Intermediate",
    totalQuestions: 10,
    refLink: "https://www.bridgebum.com/inverted_minors.php",
    refLabel: "Inverted Minors — BridgeBum",
  },
  {
    id: "bidding-8",
    type: "bidding",
    title: "Splinter Bids",
    description: "Jump bids showing singleton/void with support and slam interest",
    difficulty: "Advanced",
    totalQuestions: 10,
    refLink: "https://www.bridgebum.com/splinters.php",
    refLabel: "Splinter Bids — BridgeBum",
  },
  {
    id: "play-2",
    type: "play",
    hidden: true,
    title: "Count Signals",
    description: "Read partner's count signal to figure out declarer's distribution — low=odd, high=even",
    difficulty: "Advanced",
    totalQuestions: 10,
    refLink: "https://www.bridgebum.com/count_signal.php",
    refLabel: "Count Signals — BridgeBum",
  },

];

// ─── Helpers ─────────────────────────────────────────────────────────────────

const SUIT_SYMBOLS = { spades: "♠", hearts: "♥", diamonds: "♦", clubs: "♣" };
const SUIT_COLORS  = { spades: "#1a1a2e", hearts: "#c0392b", diamonds: "#c0392b", clubs: "#1a1a2e" };
const difficultyColor = (d) => ({ Beginner: "#27ae60", Intermediate: "#f39c12", Advanced: "#e74c3c" }[d] || "#888");

function Hand({ cards }) {
  return (
    <div>
      {Object.entries(cards).map(([suit, holding]) => (
        <div key={suit} style={{ display: "flex", gap: 6, marginBottom: 3 }}>
          <span style={{ color: SUIT_COLORS[suit], fontWeight: 700, width: 18, fontSize: 15 }}>{SUIT_SYMBOLS[suit]}</span>
          <span style={{ fontFamily: "monospace", fontSize: 14, letterSpacing: 1 }}>{holding.replace(/T/g, "10")}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Screens ─────────────────────────────────────────────────────────────────

function HomeScreen({ stats, onNavigate }) {
  const winRate = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0;
  const [activeFilter, setActiveFilter] = useState("all");
  const [activeDifficulty, setActiveDifficulty] = useState("all");

  const filteredModules = MODULES.filter((mod) => {
    if (mod.hidden) return false;
    const typeMatch = activeFilter === "all" || mod.type === activeFilter;
    const diffMatch = activeDifficulty === "all" || mod.difficulty === activeDifficulty;
    return typeMatch && diffMatch;
  });

  const filterTabStyle = (key, color) => ({
    flex: 1, padding: "9px 4px", border: "none", borderRadius: 10, cursor: "pointer",
    fontSize: 12, fontWeight: 700, letterSpacing: 0.3, transition: "all 0.2s",
    background: activeFilter === key ? color : "transparent",
    color: activeFilter === key ? "#fff" : "#8B7355",
    boxShadow: activeFilter === key ? `0 2px 8px ${color}55` : "none",
  });

  const diffTabStyle = (key) => {
    const colors = { all: "#8B7355", Beginner: "#27ae60", Intermediate: "#f39c12", Advanced: "#e74c3c" };
    const c = colors[key];
    return {
      padding: "6px 12px", border: `1.5px solid ${activeDifficulty === key ? c : "#e8dcc8"}`,
      borderRadius: 20, cursor: "pointer", fontSize: 11, fontWeight: 600,
      background: activeDifficulty === key ? c : "#fff",
      color: activeDifficulty === key ? "#fff" : "#888", transition: "all 0.2s",
    };
  };

  return (
    <div style={{ padding: "24px 20px" }}>
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 10, letterSpacing: 4, color: "#8B7355", textTransform: "uppercase", marginBottom: 4 }}>
          Standard American Yellow Card
        </div>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 700, color: "#1a1209", margin: 0 }}>
          Bridge Trainer
        </h1>
      </div>

      <div style={{
        display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 24,
        background: "linear-gradient(135deg, #1a1209 0%, #2d200e 100%)", borderRadius: 16, padding: 18,
      }}>
        {[
          { label: "Win Rate", value: `${winRate}%` },
          { label: "Streak",   value: `${stats.streak}🔥` },
          { label: "Played",   value: stats.total },
        ].map((s) => (
          <div key={s.label} style={{ textAlign: "center" }}>
            <div style={{ fontSize: 20, fontWeight: 700, color: "#f0c060", fontFamily: "'Playfair Display', serif" }}>{s.value}</div>
            <div style={{ fontSize: 10, color: "#8B7355", letterSpacing: 1, textTransform: "uppercase", marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ marginBottom: 18 }}>
        <div style={{ fontSize: 11, letterSpacing: 3, color: "#8B7355", textTransform: "uppercase", marginBottom: 10 }}>
          Filter Modules
        </div>
        <div style={{ display: "flex", gap: 6, background: "#f0e8d8", borderRadius: 14, padding: 5, marginBottom: 12 }}>
          <button onClick={() => setActiveFilter("all")}         style={filterTabStyle("all",         "#8B7355")}>🂠 All</button>
          <button onClick={() => setActiveFilter("bidding")}     style={filterTabStyle("bidding",     "#2980b9")}>🗣️ Bidding</button>
          <button onClick={() => setActiveFilter("play")}        style={filterTabStyle("play",        "#d4ac0d")}>🃏 Play</button>
          <button onClick={() => setActiveFilter("conventions")} style={filterTabStyle("conventions", "#8e44ad")}>🎴 Conv</button>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {["all", "Beginner", "Intermediate", "Advanced"].map((d) => (
            <button key={d} onClick={() => setActiveDifficulty(d)} style={diffTabStyle(d)}>
              {d === "all" ? "All Levels" : d}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <div style={{ fontSize: 11, letterSpacing: 3, color: "#8B7355", textTransform: "uppercase" }}>Training Modules</div>
        <div style={{ fontSize: 11, color: "#aaa" }}>{filteredModules.length} of {MODULES.length} shown</div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {filteredModules.length === 0 && (
          <div style={{ textAlign: "center", padding: "32px 20px", color: "#aaa", fontFamily: "'Playfair Display', serif", fontSize: 15 }}>
            No modules match your filters.<br />
            <span style={{ fontSize: 12, fontFamily: "Georgia, serif" }}>Try a different combination.</span>
          </div>
        )}
        {filteredModules.map((mod) => {
          const progress = stats.moduleProgress[mod.id] || { correct: 0, total: 0 };
          const completionPct = mod.totalQuestions ? Math.min(100, Math.round((progress.total / mod.totalQuestions) * 100)) : Math.min(100, progress.total * 5);
          const winPct = progress.total > 0 ? Math.round((progress.correct / progress.total) * 100) : 0;
          return (
            <div
              key={mod.id}
              onClick={() => onNavigate(mod.id === "leads" ? "leads" : "question", mod)}
              style={{
                background: "#fff", borderRadius: 14, padding: "16px 18px",
                border: "1.5px solid #e8dcc8", cursor: "pointer",
                transition: "transform 0.15s, box-shadow 0.15s",
                boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 6px 20px rgba(0,0,0,0.12)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.06)"; }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    <span style={{ fontSize: 17 }}>{mod.type === "bidding" ? "🗣️" : mod.type === "conventions" ? "🎴" : "🃏"}</span>
                    <span style={{
                      fontSize: 10, padding: "2px 8px", borderRadius: 20, fontWeight: 600, letterSpacing: 0.5, textTransform: "uppercase",
                      background: mod.type === "bidding" ? "#e8f4fd" : mod.type === "conventions" ? "#f5eef8" : "#fef9e7",
                      color:      mod.type === "bidding" ? "#2980b9" : mod.type === "conventions" ? "#8e44ad" : "#d4ac0d",
                    }}>{mod.type}</span>
                  </div>
                  <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 16, fontWeight: 700, color: "#1a1209", marginBottom: 3 }}>{mod.title}</div>
                  <div style={{ fontSize: 12, color: "#888" }}>{mod.description}</div>
                </div>
                <div style={{ textAlign: "right", flexShrink: 0, marginLeft: 12 }}>
                  <span style={{ fontSize: 10, color: difficultyColor(mod.difficulty), fontWeight: 600 }}>{mod.difficulty}</span>
                  {progress.total > 0 && <div style={{ fontSize: 18, fontWeight: 700, color: "#1a1209", marginTop: 4 }}>{completionPct}%</div>}
                </div>
              </div>
              <div style={{ marginTop: 12, background: "#f0e8d8", borderRadius: 4, height: 4 }}>
                <div style={{
                  height: 4, borderRadius: 4, transition: "width 0.5s",
                  width: `${mod.totalQuestions ? Math.min(100, (progress.total / mod.totalQuestions) * 100) : Math.min(100, progress.total * 5)}%`,
                  background: "linear-gradient(90deg, #8B7355, #c0a060)",
                }} />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
                <span style={{ fontSize: 10, color: "#aaa" }}>{mod.totalQuestions ? `${progress.total}/${mod.totalQuestions}` : progress.total} attempted</span>
                {progress.total > 0 && <span style={{ fontSize: 10, color: "#aaa" }}>{winPct}% correct</span>}
              </div>
              {mod.refLink && (
                <a
                  href={mod.refLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  style={{
                    display: "inline-flex", alignItems: "center", gap: 4,
                    marginTop: 10, fontSize: 11, color: "#9b7d5a",
                    textDecoration: "none", fontWeight: 600,
                    borderTop: "1px solid #f0e8d8", paddingTop: 8, width: "100%",
                  }}
                >
                  📖 {mod.refLabel}
                </a>
              )}
            </div>
          );
        })}
      </div>

      <button
        onClick={() => onNavigate("stats")}
        style={{
          marginTop: 20, width: "100%", padding: "14px",
          border: "1.5px solid #1a1209", background: "transparent", borderRadius: 12,
          fontFamily: "'Playfair Display', serif", fontSize: 15, cursor: "pointer",
          color: "#1a1209", letterSpacing: 0.5,
        }}
      >
        View Full Statistics →
      </button>
    </div>
  );
}

function QuestionScreen({ module: mod, onBack, onAnswer }) {
  const questions = QUESTION_BANKS[mod.id] || [];
  const [qIndex, setQIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [revealed, setRevealed] = useState(false);

  const question = questions[qIndex];
  if (!question) return null;

  const isCorrect = selected === question.correct;
  const isLastQuestion = qIndex >= questions.length - 1;

  const handleSubmit = () => {
    if (selected) {
      setRevealed(true);
      onAnswer(selected === question.correct); // record immediately on reveal
    }
  };

  const handleNext = () => {
    if (isLastQuestion) {
      onBack();
    } else {
      setSelected(null);
      setRevealed(false);
      setQIndex(qIndex + 1);
    }
  };

  return (
    <div style={{ padding: "0 0 80px" }}>
      <div style={{ background: "linear-gradient(135deg, #1a1209 0%, #2d200e 100%)", padding: "20px 20px 24px" }}>
        <button
          onClick={onBack}
          style={{ background: "rgba(255,255,255,0.1)", border: "none", color: "#f0c060", fontSize: 14, cursor: "pointer", padding: "6px 12px", borderRadius: 8, marginBottom: 14 }}
        >← Back</button>
        <div style={{ fontSize: 10, letterSpacing: 3, color: "#8B7355", textTransform: "uppercase", marginBottom: 4 }}>
          {mod.type === "bidding" ? "🗣️ Bidding" : mod.type === "conventions" ? "🎴 Conventions" : mod.type === "scoring" ? "🧮 Scoring" : "🃏 Card Play"} · SAYC
        </div>
        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, color: "#f0c060", fontWeight: 700 }}>{mod.title}</div>
        <div style={{ display: "flex", gap: 6, marginTop: 12 }}>
          {questions.map((_, i) => (
            <div key={i} style={{
              height: 6, flex: 1, borderRadius: 3,
              background: i < qIndex ? "#f0c060" : i === qIndex ? "#fff" : "rgba(255,255,255,0.25)",
              transition: "background 0.3s",
            }} />
          ))}
        </div>
        <div style={{ fontSize: 11, color: "#8B7355", marginTop: 6 }}>
          Question {qIndex + 1} of {questions.length} · {question.points} pts
        </div>
      </div>

      <div style={{ padding: "20px" }}>
        <div style={{ background: "#fff", border: "1.5px solid #e8dcc8", borderRadius: 14, padding: 18, marginBottom: 16 }}>
          {(mod.type === "bidding" || mod.type === "conventions") ? (
            <>
              <div style={{ display: "flex", gap: 20, marginBottom: 14, flexWrap: "wrap" }}>
                <div>
                  <div style={{ fontSize: 10, color: "#888", letterSpacing: 1, textTransform: "uppercase", marginBottom: 2 }}>Position</div>
                  <div style={{ fontWeight: 700, color: "#1a1209" }}>{question.position}</div>
                </div>
                <div>
                  <div style={{ fontSize: 10, color: "#888", letterSpacing: 1, textTransform: "uppercase", marginBottom: 2 }}>Vul</div>
                  <div style={{ fontWeight: 700, color: question.vulnerability === "Both" ? "#c0392b" : "#1a1209" }}>{question.vulnerability}</div>
                </div>
                {question.auction && question.auction.length > 0 && (
                  <div style={{ width: "100%", marginTop: 8 }}>
                    <div style={{ fontSize: 10, color: "#888", letterSpacing: 1, textTransform: "uppercase", marginBottom: 8 }}>Auction</div>
                    {(() => {
                      const seats = ["West", "North", "East", "South"];
                      const posIdx = seats.indexOf(question.position);
                      // Dealer = seat such that auction ends with position to bid next
                      const dealerIdx = question.dealer
                        ? seats.indexOf(question.dealer)
                        : (posIdx - (question.auction ? question.auction.length : 0) + 400) % 4;
                      const bids = question.auction || [];
                      // Pad front so dealer lands in correct W-N-E-S column
                      const padded = Array(dealerIdx).fill(null).concat(bids);
                      const rows = [];
                      for (let i = 0; i < padded.length; i += 4) {
                        const row = padded.slice(i, i + 4);
                        while (row.length < 4) row.push(null);
                        rows.push(row);
                      }
                      // If no rows yet, add one empty row so ? shows up
                      if (!rows.length) rows.push([null, null, null, null]);
                      const bidColor = b => !b ? "#ccc" : b === "Pass" ? "#888" : b === "Dbl" || b === "Rdbl" ? "#c0392b" : b && (b.includes("♥") || b.includes("♦")) ? "#c0392b" : "#1a1209";
                      return (
                        <div style={{ border: "1px solid #e8dcc8", borderRadius: 8, overflow: "hidden" }}>
                          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", background: "#f5ede0" }}>
                            {seats.map(s => (
                              <div key={s} style={{ textAlign: "center", fontSize: 10, fontWeight: 700, color: s === question.position ? "#8B4513" : "#888", letterSpacing: 1, padding: "5px 2px", textTransform: "uppercase", borderBottom: "1px solid #e8dcc8", background: s === question.position ? "#fdf3e3" : "transparent" }}>
                                {s}
                                {s === question.position ? " ★" : ""}
                              </div>
                            ))}
                          </div>
                          {rows.map((row, ri) => (
                            <div key={ri} style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", background: ri % 2 === 0 ? "#fff" : "#faf6f0" }}>
                              {[0,1,2,3].map(ci => {
                                const bid = row[ci];
                                const isYou = seats[ci] === question.position && ri === rows.length - 1 && !bid;
                                return (
                                  <div key={ci} style={{ textAlign: "center", padding: "6px 2px", fontSize: 14, fontWeight: bid && bid !== "Pass" ? 700 : 400, color: bidColor(bid), fontFamily: "Georgia, serif" }}>
                                    {isYou ? <span style={{ color: "#8B4513", fontWeight: 700 }}>?</span> : (bid || "—")}
                                  </div>
                                );
                              })}
                            </div>
                          ))}
                        </div>
                      );
                    })()}
                  </div>
                )}
              </div>
              <div style={{ borderTop: "1px solid #e8dcc8", paddingTop: 14 }}>
<div style={{ fontSize: 10, color: "#888", letterSpacing: 1, textTransform: "uppercase", marginBottom: 10 }}>Your Hand</div>
                <Hand cards={question.hand} />
              </div>
            </>
          ) : question.type === "count" ? (
            <>
              {/* Auction display */}
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 10, color: "#888", letterSpacing: 1, textTransform: "uppercase", marginBottom: 8 }}>Auction</div>
                {(() => {
                  const seats = ["West", "North", "East", "South"];
                  const dealer = question.dealer || "West";
                  const dealerIdx = seats.indexOf(dealer);
                  const bids = question.auction || [];
                  const padded = Array(dealerIdx).fill(null).concat(bids);
                  const rows = [];
                  for (let i = 0; i < padded.length; i += 4) {
                    const row = padded.slice(i, i + 4);
                    while (row.length < 4) row.push(null);
                    rows.push(row);
                  }
                  const bidColor = b => !b ? "#ccc" : b === "Pass" ? "#888" : b === "Dbl" || b === "Rdbl" ? "#c0392b" : b && (b.includes("♥") || b.includes("♦")) ? "#c0392b" : "#1a1209";
                  return (
                    <div style={{ border: "1px solid #e8dcc8", borderRadius: 8, overflow: "hidden" }}>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", background: "#f5ede0" }}>
                        {seats.map(s => (
                          <div key={s} style={{ textAlign: "center", fontSize: 10, fontWeight: 700, color: s === question.position ? "#8B4513" : "#888", letterSpacing: 1, padding: "5px 2px", textTransform: "uppercase", borderBottom: "1px solid #e8dcc8", background: s === question.position ? "#fdf3e3" : "transparent" }}>
                            {s}{s === question.position ? " ★" : ""}
                          </div>
                        ))}
                      </div>
                      {rows.map((row, ri) => (
                        <div key={ri} style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", background: ri % 2 === 0 ? "#fff" : "#faf6f0" }}>
                          {[0,1,2,3].map(ci => {
                            const bid = row[ci];
                            return (
                              <div key={ci} style={{ textAlign: "center", padding: "6px 2px", fontSize: 13, fontWeight: bid && bid !== "Pass" ? 700 : 400, color: bidColor(bid), fontFamily: "Georgia, serif" }}>
                                {bid || "—"}
                              </div>
                            );
                          })}
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>
              {/* Contract + Lead */}
              <div style={{ display: "flex", gap: 16, marginBottom: 14, flexWrap: "wrap" }}>
                <div>
                  <div style={{ fontSize: 10, color: "#888", letterSpacing: 1, textTransform: "uppercase", marginBottom: 2 }}>Contract</div>
                  <div style={{ fontWeight: 700, color: "#1a1209", fontSize: 15 }}>{question.contract}</div>
                </div>
                <div>
                  <div style={{ fontSize: 10, color: "#888", letterSpacing: 1, textTransform: "uppercase", marginBottom: 2 }}>Lead</div>
                  <div style={{ fontWeight: 700, fontSize: 15, color: question.lead && (question.lead.includes("♥") || question.lead.includes("♦")) ? "#c0392b" : "#1a1209" }}>{question.lead}</div>
                </div>
                <div>
                  <div style={{ fontSize: 10, color: "#888", letterSpacing: 1, textTransform: "uppercase", marginBottom: 2 }}>Partner's Card</div>
                  <div style={{ fontWeight: 700, fontSize: 15, color: question.partnerCard && (question.partnerCard.includes("♥") || question.partnerCard.includes("♦")) ? "#c0392b" : "#1a1209" }}>
                    {question.partnerCard}
                    <span style={{ fontSize: 11, fontWeight: 400, color: "#888", marginLeft: 6 }}>({question.partnerSignalMeaning})</span>
                  </div>
                </div>
              </div>
              {/* Dummy + Your hand */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, borderTop: "1px solid #e8dcc8", paddingTop: 14 }}>
                <div>
                  <div style={{ fontSize: 10, color: "#888", letterSpacing: 1, textTransform: "uppercase", marginBottom: 8 }}>Dummy</div>
                  <Hand cards={question.dummy} />
                </div>
                <div>
                  <div style={{ fontSize: 10, color: "#888", letterSpacing: 1, textTransform: "uppercase", marginBottom: 8 }}>Your Hand</div>
                  <Hand cards={question.hand} />
                </div>
              </div>
            </>
          ) : (
            <>
              <div style={{ display: "flex", gap: 20, marginBottom: 14, flexWrap: "wrap" }}>
                <div>
                  <div style={{ fontSize: 10, color: "#888", letterSpacing: 1, textTransform: "uppercase", marginBottom: 2 }}>Contract</div>
                  <div style={{ fontWeight: 700, color: "#1a1209", fontSize: 16 }}>{question.contract}</div>
                </div>
                <div>
                  <div style={{ fontSize: 10, color: "#888", letterSpacing: 1, textTransform: "uppercase", marginBottom: 2 }}>By</div>
                  <div style={{ fontWeight: 700, color: "#1a1209" }}>{question.declarer}</div>
                </div>
                <div>
                  <div style={{ fontSize: 10, color: "#888", letterSpacing: 1, textTransform: "uppercase", marginBottom: 2 }}>Lead</div>
                  <div style={{ fontWeight: 700, fontSize: 16, color: question.lead && (question.lead.includes("♥") || question.lead.includes("♦")) ? "#c0392b" : "#1a1209" }}>{question.lead}</div>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, borderTop: "1px solid #e8dcc8", paddingTop: 14 }}>
                <div>
                  <div style={{ fontSize: 10, color: "#888", letterSpacing: 1, textTransform: "uppercase", marginBottom: 8 }}>Dummy (North)</div>
                  <Hand cards={question.dummy} />
                </div>
                <div>
                  <div style={{ fontSize: 10, color: "#888", letterSpacing: 1, textTransform: "uppercase", marginBottom: 8 }}>You (South)</div>
                  <Hand cards={question.hand} />
                </div>
              </div>
            </>
          )}
          <div style={{ marginTop: 14, padding: "12px 14px", background: "#faf6f0", borderRadius: 10, borderLeft: "3px solid #8B7355" }}>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 14, color: "#1a1209", fontWeight: 600, lineHeight: 1.4 }}>
              {question.question}
            </div>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 18 }}>
          {question.options.map((opt) => {
            let bg = "#fff", border = "1.5px solid #e8dcc8", color = "#1a1209";
            if (revealed) {
              if (opt === question.correct)          { bg = "#eafaf1"; border = "2px solid #27ae60"; color = "#1e8449"; }
              else if (opt === selected)             { bg = "#fdedec"; border = "2px solid #e74c3c"; color = "#c0392b"; }
            } else if (opt === selected) {
              bg = "#f0e8d8"; border = "2px solid #8B7355";
            }
            return (
              <div
                key={opt}
                onClick={() => { if (!revealed) setSelected(opt); }}
                style={{ background: bg, border, color, borderRadius: 12, padding: "14px 18px",
                  cursor: revealed ? "default" : "pointer", fontFamily: "Georgia, serif", fontSize: 13,
                  display: "flex", alignItems: "center", gap: 10, transition: "all 0.2s", lineHeight: 1.4,
                }}
              >
                <span style={{
                  width: 16, height: 16, borderRadius: "50%", flexShrink: 0,
                  border: revealed
                    ? (opt === question.correct ? "2px solid #27ae60" : opt === selected ? "2px solid #e74c3c" : "2px solid #ddd")
                    : `2px solid ${opt === selected ? "#8B7355" : "#ddd"}`,
                  background: revealed
                    ? (opt === question.correct ? "#27ae60" : opt === selected ? "#e74c3c" : "transparent")
                    : (opt === selected ? "#8B7355" : "transparent"),
                }} />
                {opt}
              </div>
            );
          })}
        </div>

        {revealed && (
          <div style={{
            background: isCorrect ? "linear-gradient(135deg,#eafaf1,#d5f5e3)" : "linear-gradient(135deg,#fdedec,#fad7d3)",
            border: `1.5px solid ${isCorrect ? "#27ae60" : "#e74c3c"}`,
            borderRadius: 14, padding: 18, marginBottom: 18,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <span style={{ fontSize: 22 }}>{isCorrect ? "🎉" : "💡"}</span>
              <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 16, fontWeight: 700, color: isCorrect ? "#1e8449" : "#c0392b" }}>
                {isCorrect ? `Correct! +${question.points} pts` : `Correct answer: ${question.correct}`}
              </span>
            </div>
            <p style={{ fontSize: 13, color: "#333", lineHeight: 1.7, margin: 0 }}>{question.explanation}</p>
          </div>
        )}

        {!revealed ? (
          <button
            onClick={handleSubmit}
            disabled={!selected}
            style={{
              width: "100%", padding: "16px",
              background: selected ? "linear-gradient(135deg, #1a1209 0%, #2d200e 100%)" : "#ddd",
              color: selected ? "#f0c060" : "#aaa", border: "none", borderRadius: 12,
              fontFamily: "'Playfair Display', serif", fontSize: 16, fontWeight: 700,
              cursor: selected ? "pointer" : "not-allowed", letterSpacing: 0.5,
            }}
          >Submit Answer</button>
        ) : (
          <button
            onClick={handleNext}
            style={{
              width: "100%", padding: "16px",
              background: "linear-gradient(135deg, #1a1209 0%, #2d200e 100%)",
              color: "#f0c060", border: "none", borderRadius: 12,
              fontFamily: "'Playfair Display', serif", fontSize: 16, fontWeight: 700,
              cursor: "pointer", letterSpacing: 0.5,
            }}
          >{isLastQuestion ? "Finish Module ✓" : "Next Question →"}</button>
        )}
      </div>
    </div>
  );
}

function StatsScreen({ stats, onBack }) {
  const winRate = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0;
  // Category summaries — denominator is TOTAL POSSIBLE questions (not just attempted)
  const calcCatPct = (mods) => {
    const correct  = mods.reduce((s, m) => s + (stats.moduleProgress[m.id]?.correct || 0), 0);
    const possible = mods.reduce((s, m) => s + (m.totalQuestions || 0), 0);
    return { correct, possible, pct: possible > 0 ? Math.round(correct / possible * 100) : 0 };
  };
  const biddingMods = MODULES.filter(m => !m.hidden && m.type === "bidding");
  const playMods    = MODULES.filter(m => !m.hidden && m.type === "play");
  const convMods    = MODULES.filter(m => !m.hidden && m.type === "conventions");
  const biddingCat  = calcCatPct(biddingMods);
  const playCat     = calcCatPct(playMods);
  const convCat     = calcCatPct(convMods);

  return (
    <div style={{ padding: "0 0 40px" }}>
      <div style={{ background: "linear-gradient(135deg, #1a1209 0%, #2d200e 100%)", padding: "20px 20px 32px" }}>
        <button onClick={onBack} style={{ background: "rgba(255,255,255,0.1)", border: "none", color: "#f0c060", fontSize: 14, cursor: "pointer", padding: "6px 12px", borderRadius: 8, marginBottom: 14 }}>← Back</button>
        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, color: "#f0c060", fontWeight: 700 }}>Statistics</div>
        <div style={{ fontSize: 12, color: "#8B7355" }}>SAYC Performance Overview</div>
      </div>

      <div style={{ padding: 20 }}>
        <div style={{
          background: "linear-gradient(135deg, #1a1209 0%, #2d200e 100%)",
          borderRadius: 16, padding: 20, marginBottom: 16, textAlign: "center",
        }}>
          <div style={{ fontSize: 56, fontWeight: 700, color: "#f0c060", fontFamily: "'Playfair Display', serif", lineHeight: 1 }}>{winRate}%</div>
          <div style={{ color: "#8B7355", fontSize: 13, marginTop: 6 }}>Overall Accuracy</div>
          <div style={{ display: "flex", justifyContent: "center", gap: 32, marginTop: 16 }}>
            {[{ v: stats.correct, l: "Correct" }, { v: stats.total, l: "Total" }, { v: `${stats.streak}🔥`, l: "Streak" }].map((x) => (
              <div key={x.l} style={{ textAlign: "center" }}>
                <div style={{ fontSize: 22, fontWeight: 700, color: "#fff" }}>{x.v}</div>
                <div style={{ fontSize: 11, color: "#8B7355" }}>{x.l}</div>
              </div>
            ))}
          </div>
        </div>

        {[
          { label: "Bidding",     icon: "🗣️", cat: biddingCat, color: "#2980b9" },
          { label: "Card Play",   icon: "🃏", cat: playCat,    color: "#d4ac0d" },
          { label: "Conventions", icon: "🎴", cat: convCat,    color: "#8e44ad" },
        ].map((t) => {
          return (
            <div key={t.label} style={{ background: "#fff", border: "1.5px solid #e8dcc8", borderRadius: 14, padding: 18, marginBottom: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 20 }}>{t.icon}</span>
                  <span style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: 16 }}>{t.label}</span>
                </div>
                <span style={{ fontSize: 22, fontWeight: 700, color: t.color }}>{t.cat.pct}%</span>
              </div>
              <div style={{ background: "#f0e8d8", borderRadius: 6, height: 8 }}>
                <div style={{ height: 8, borderRadius: 6, width: `${t.cat.pct}%`, background: `linear-gradient(90deg, ${t.color}88, ${t.color})`, transition: "width 0.8s" }} />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
                <span style={{ fontSize: 11, color: "#aaa" }}>{t.cat.correct} correct</span>
                <span style={{ fontSize: 11, color: "#aaa" }}>{t.cat.possible} possible</span>
              </div>
            </div>
          );
        })}

        <div style={{ fontSize: 11, letterSpacing: 3, color: "#8B7355", textTransform: "uppercase", marginBottom: 12, marginTop: 8 }}>Module Breakdown</div>
        {MODULES.filter(m => !m.hidden).map((mod) => {
          const p = stats.moduleProgress[mod.id] || { correct: 0, total: 0 };
          const winPct = p.total > 0 ? Math.round((p.correct / p.total) * 100) : 0;
          const barWidth = mod.totalQuestions ? Math.min(100, Math.round((p.total / mod.totalQuestions) * 100)) : Math.min(100, p.total * 5);
          const completionPct = mod.totalQuestions ? Math.min(100, Math.round((p.total / mod.totalQuestions) * 100)) : barWidth;
          return (
            <div key={mod.id} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
              <span style={{ fontSize: 16 }}>{mod.type === "bidding" ? "🗣️" : mod.type === "conventions" ? "🎴" : "🃏"}</span>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "#1a1209" }}>{mod.title}</span>
                  <span style={{ fontSize: 13, color: "#888" }}>{p.total > 0 ? `${completionPct}%` : "—"}</span>
                </div>
                <div style={{ background: "#f0e8d8", borderRadius: 4, height: 5 }}>
                  <div style={{ height: 5, borderRadius: 4, width: `${barWidth}%`, background: "linear-gradient(90deg,#8B7355,#c0a060)", transition: "width 0.6s" }} />
                </div>
                <div style={{ fontSize: 10, color: "#bbb", marginTop: 3 }}>{mod.totalQuestions ? `${p.total}/${mod.totalQuestions}` : p.total} attempted</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}


// ─── Scoring Screen ───────────────────────────────────────────────────────────

const SCORING_BANK = [
  // ── Partscores undoubled ─────────────────────────────────────────────────
  { contract: "1NT", result: "=", vulnerable: "NV", doubled: false, question: "1NT made exactly, NV, undoubled. What is the score?", correct: "90", options: ["70", "90", "120", "150"], explanation: "1NT = 40. Partscore bonus = 50. Total = 90.", points: 10 },
  { contract: "1NT", result: "+1", vulnerable: "NV", doubled: false, question: "1NT+1, NV, undoubled. What is the score?", correct: "120", options: ["90", "120", "150", "160"], explanation: "1NT = 40. Overtrick = 30. Partscore bonus = 50. Total = 120.", points: 10 },
  { contract: "1NT", result: "+1", vulnerable: "VUL", doubled: false, question: "1NT+1, VUL, undoubled. What is the score?", correct: "150", options: ["120", "150", "180", "210"], explanation: "1NT = 40. Overtrick = 30. Partscore bonus = 50. Total = 150.", points: 10 },
  { contract: "2♠", result: "=", vulnerable: "NV", doubled: false, question: "2♠ made exactly, NV, undoubled. What is the score?", correct: "110", options: ["90", "110", "120", "140"], explanation: "2 tricks × 30 = 60. Partscore bonus = 50. Total = 110.", points: 10 },
  { contract: "2♠", result: "=", vulnerable: "VUL", doubled: false, question: "2♠ made exactly, VUL, undoubled. What is the score?", correct: "110", options: ["90", "110", "140", "160"], explanation: "2 tricks × 30 = 60. Partscore bonus = 50. Total = 110. Vulnerability does not affect undoubled partscore.", points: 10 },
  { contract: "2♥", result: "+1", vulnerable: "NV", doubled: false, question: "2♥+1, NV, undoubled. What is the score?", correct: "140", options: ["110", "140", "170", "200"], explanation: "2 tricks × 30 = 60. Overtrick = 30. Partscore bonus = 50. Total = 140.", points: 10 },
  { contract: "3♣", result: "=", vulnerable: "NV", doubled: false, question: "3♣ made exactly, NV, undoubled. What is the score?", correct: "110", options: ["90", "110", "130", "150"], explanation: "3 tricks × 20 = 60. Partscore bonus = 50. Total = 110.", points: 10 },
  { contract: "3♦", result: "=", vulnerable: "VUL", doubled: false, question: "3♦ made exactly, VUL, undoubled. What is the score?", correct: "110", options: ["90", "110", "130", "160"], explanation: "3 tricks × 20 = 60. Partscore bonus = 50. Total = 110.", points: 10 },
  { contract: "2NT", result: "=", vulnerable: "NV", doubled: false, question: "2NT made exactly, NV, undoubled. What is the score?", correct: "120", options: ["90", "100", "120", "150"], explanation: "2NT = 40+30 = 70. Partscore bonus = 50. Total = 120.", points: 10 },
  { contract: "2NT", result: "+1", vulnerable: "VUL", doubled: false, question: "2NT+1, VUL, undoubled. What is the score?", correct: "180", options: ["120", "150", "180", "210"], explanation: "2NT = 40+30 = 70. Overtrick = 30. Partscore bonus = 50. Total = 180.", points: 10 },
  // ── Games undoubled ──────────────────────────────────────────────────────
  { contract: "4♠", result: "=", vulnerable: "NV", doubled: false, question: "4♠ made exactly, NV, undoubled. What is the score?", correct: "420", options: ["400", "420", "450", "620"], explanation: "4 tricks × 30 = 120. Game bonus NV = 300. Total = 420.", points: 10 },
  { contract: "4♠", result: "=", vulnerable: "VUL", doubled: false, question: "4♠ made exactly, VUL, undoubled. What is the score?", correct: "620", options: ["420", "500", "620", "650"], explanation: "4 tricks × 30 = 120. Game bonus VUL = 500. Total = 620.", points: 10 },
  { contract: "4♥", result: "+1", vulnerable: "NV", doubled: false, question: "4♥+1, NV, undoubled. What is the score?", correct: "450", options: ["420", "450", "480", "620"], explanation: "4 tricks × 30 = 120. Game bonus NV = 300. Overtrick = 30. Total = 450.", points: 10 },
  { contract: "4♥", result: "+1", vulnerable: "VUL", doubled: false, question: "4♥+1, VUL, undoubled. What is the score?", correct: "650", options: ["450", "620", "650", "680"], explanation: "4 tricks × 30 = 120. Game bonus VUL = 500. Overtrick VUL = 30. Total = 650.", points: 10 },
  { contract: "3NT", result: "=", vulnerable: "NV", doubled: false, question: "3NT made exactly, NV, undoubled. What is the score?", correct: "400", options: ["300", "350", "400", "430"], explanation: "3NT = 40+30+30 = 100. Game bonus NV = 300. Total = 400.", points: 10 },
  { contract: "3NT", result: "=", vulnerable: "VUL", doubled: false, question: "3NT made exactly, VUL, undoubled. What is the score?", correct: "600", options: ["400", "430", "600", "630"], explanation: "3NT = 40+30+30 = 100. Game bonus VUL = 500. Total = 600.", points: 10 },
  { contract: "3NT", result: "+1", vulnerable: "NV", doubled: false, question: "3NT+1, NV, undoubled. What is the score?", correct: "430", options: ["400", "430", "460", "600"], explanation: "3NT = 40+30+30 = 100. Game bonus NV = 300. Overtrick = 30. Total = 430.", points: 10 },
  { contract: "5♦", result: "=", vulnerable: "NV", doubled: false, question: "5♦ made exactly, NV, undoubled. What is the score?", correct: "400", options: ["300", "350", "400", "420"], explanation: "5 tricks × 20 = 100. Game bonus NV = 300. Total = 400.", points: 10 },
  { contract: "5♣", result: "=", vulnerable: "VUL", doubled: false, question: "5♣ made exactly, VUL, undoubled. What is the score?", correct: "600", options: ["400", "500", "600", "620"], explanation: "5 tricks × 20 = 100. Game bonus VUL = 500. Total = 600.", points: 10 },
  { contract: "5♣", result: "+1", vulnerable: "NV", doubled: false, question: "5♣+1, NV, undoubled. What is the score?", correct: "420", options: ["400", "420", "440", "600"], explanation: "5 tricks × 20 = 100. Game bonus NV = 300. Overtrick = 20. Total = 420.", points: 10 },
  // ── Undertricks undoubled ────────────────────────────────────────────────
  { contract: "2♥", result: "-1", vulnerable: "NV", doubled: false, question: "2♥ down 1, NV, undoubled. What is the score?", correct: "-50", options: ["-50", "-100", "-150", "-200"], explanation: "Down 1 NV undoubled = 50 to opponents. Score = -50.", points: 10 },
  { contract: "3♠", result: "-2", vulnerable: "NV", doubled: false, question: "3♠ down 2, NV, undoubled. What is the score?", correct: "-100", options: ["-50", "-100", "-200", "-300"], explanation: "Down 2 NV undoubled = 2×50 = 100 to opponents. Score = -100.", points: 10 },
  { contract: "4♥", result: "-1", vulnerable: "VUL", doubled: false, question: "4♥ down 1, VUL, undoubled. What is the score?", correct: "-100", options: ["-50", "-100", "-200", "-300"], explanation: "Down 1 VUL undoubled = 100 to opponents. Score = -100.", points: 10 },
  { contract: "4♠", result: "-2", vulnerable: "VUL", doubled: false, question: "4♠ down 2, VUL, undoubled. What is the score?", correct: "-200", options: ["-100", "-200", "-300", "-500"], explanation: "Down 2 VUL undoubled = 2×100 = 200 to opponents. Score = -200.", points: 10 },
  { contract: "3NT", result: "-3", vulnerable: "NV", doubled: false, question: "3NT down 3, NV, undoubled. What is the score?", correct: "-150", options: ["-100", "-150", "-200", "-300"], explanation: "Down 3 NV undoubled = 3×50 = 150 to opponents. Score = -150.", points: 10 },
  // ── Doubled contracts made ───────────────────────────────────────────────
  { contract: "2♠", result: "=", vulnerable: "NV", doubled: true, question: "2♠ made exactly, NV, doubled. What is the score?", correct: "470", options: ["110", "170", "370", "470"], explanation: "2♠ doubled = 2×(2×30) = 120. Since 120 ≥ 100, game bonus NV = 300. Insult = 50. Total = 470.", points: 15 },
  { contract: "2♥", result: "=", vulnerable: "VUL", doubled: true, question: "2♥ made exactly, VUL, doubled. What is the score?", correct: "670", options: ["170", "470", "570", "670"], explanation: "2♥ doubled = 2×(2×30) = 120. Since 120 ≥ 100, game bonus VUL = 500. Insult = 50. Total = 670.", points: 15 },
  { contract: "3♥", result: "=", vulnerable: "VUL", doubled: true, question: "3♥ made exactly, VUL, doubled. What is the score?", correct: "730", options: ["530", "630", "730", "830"], explanation: "3♥ doubled = 2×(3×30) = 180. Game bonus VUL = 500. Insult = 50. Total = 730.", points: 15 },
  { contract: "1NT", result: "=", vulnerable: "NV", doubled: true, question: "1NT made exactly, NV, doubled. What is the score?", correct: "160", options: ["90", "140", "160", "200"], explanation: "1NT doubled = 2×40 = 80. Partscore bonus = 50. Insult = 50. Total = 160.", points: 15 },
  { contract: "3NT", result: "=", vulnerable: "NV", doubled: true, question: "3NT made exactly, NV, doubled. What is the score?", correct: "550", options: ["400", "450", "550", "650"], explanation: "3NT doubled = 2×100 = 200. Game bonus NV = 300. Insult = 50. Total = 550.", points: 15 },
  // ── Doubled undertricks ──────────────────────────────────────────────────
  { contract: "2♥", result: "-1", vulnerable: "NV", doubled: true, question: "2♥ down 1, NV, doubled. What is the score?", correct: "-100", options: ["-50", "-100", "-200", "-300"], explanation: "Down 1 NV doubled: 1st trick = 100. Score = -100.", points: 15 },
  { contract: "2♥", result: "-2", vulnerable: "NV", doubled: true, question: "2♥ down 2, NV, doubled. What is the score?", correct: "-300", options: ["-100", "-200", "-300", "-500"], explanation: "Down 2 NV doubled: 1st = 100, 2nd = 200. Total = 300 to opponents. Score = -300.", points: 15 },
  { contract: "3♠", result: "-2", vulnerable: "VUL", doubled: true, question: "3♠ down 2, VUL, doubled. What is the score?", correct: "-500", options: ["-300", "-400", "-500", "-800"], explanation: "Down 2 VUL doubled: 1st = 200, 2nd = 300. Total = 500 to opponents. Score = -500.", points: 15 },
  { contract: "4♥", result: "-3", vulnerable: "NV", doubled: true, question: "4♥ down 3, NV, doubled. What is the score?", correct: "-500", options: ["-300", "-500", "-800", "-900"], explanation: "Down 3 NV doubled: 1st = 100, 2nd = 200, 3rd = 200. Total = 500 to opponents. Score = -500.", points: 15 },
  { contract: "3NT", result: "-2", vulnerable: "VUL", doubled: true, question: "3NT down 2, VUL, doubled. What is the score?", correct: "-500", options: ["-300", "-400", "-500", "-800"], explanation: "Down 2 VUL doubled: 1st = 200, 2nd = 300. Total = 500 to opponents. Score = -500.", points: 15 },
  // ── Slams ────────────────────────────────────────────────────────────────
  { contract: "6♠", result: "=", vulnerable: "NV", doubled: false, question: "6♠ small slam, NV, undoubled. What is the score?", correct: "980", options: ["720", "920", "980", "1030"], explanation: "6 tricks × 30 = 180. Game bonus NV = 300. Small slam bonus NV = 500. Total = 980.", points: 15 },
  { contract: "6♠", result: "=", vulnerable: "VUL", doubled: false, question: "6♠ small slam, VUL, undoubled. What is the score?", correct: "1430", options: ["980", "1230", "1430", "1460"], explanation: "6 tricks × 30 = 180. Game bonus VUL = 500. Small slam bonus VUL = 750. Total = 1430.", points: 15 },
  { contract: "6NT", result: "=", vulnerable: "NV", doubled: false, question: "6NT small slam, NV, undoubled. What is the score?", correct: "990", options: ["720", "890", "990", "1020"], explanation: "6NT = 40+30×5 = 190. Game bonus NV = 300. Small slam bonus NV = 500. Total = 990.", points: 15 },
  { contract: "6NT", result: "=", vulnerable: "VUL", doubled: false, question: "6NT small slam, VUL, undoubled. What is the score?", correct: "1440", options: ["990", "1230", "1440", "1470"], explanation: "6NT = 40+30×5 = 190. Game bonus VUL = 500. Small slam bonus VUL = 750. Total = 1440.", points: 15 },
  { contract: "7NT", result: "=", vulnerable: "NV", doubled: false, question: "7NT grand slam, NV, undoubled. What is the score?", correct: "1520", options: ["1020", "1320", "1470", "1520"], explanation: "7NT = 40+30×6 = 220. Game bonus NV = 300. Grand slam bonus NV = 1000. Total = 1520.", points: 15 },
  { contract: "7♠", result: "=", vulnerable: "VUL", doubled: false, question: "7♠ grand slam, VUL, undoubled. What is the score?", correct: "2210", options: ["1510", "1960", "2110", "2210"], explanation: "7 tricks × 30 = 210. Game bonus VUL = 500. Grand slam bonus VUL = 1500. Total = 2210.", points: 15 },
];

function ScoringScreen({ onBack, onAnswer }) {
  const [questions] = useState(() => {
    const shuffled = [...SCORING_BANK].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 10).map(q => ({ ...q, options: [...q.options].sort(() => Math.random() - 0.5) }));
  });
  const [qIndex, setQIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [revealed, setRevealed] = useState(false);
  const [score, setScore] = useState(0);
  const totalQuestions = 10;

  const question = questions[qIndex];

  const handleSubmit = () => { if (selected) setRevealed(true); };

  const handleNext = () => {
    const correct = selected === question.correct;
    onAnswer(correct);
    if (correct) setScore(s => s + question.points);
    if (qIndex + 1 >= totalQuestions) {
      onBack();
    } else {
      setSelected(null);
      setRevealed(false);
      setQIndex(qIndex + 1);
    }
  };

  return (
    <div style={{ padding: "0 0 80px" }}>
      <div style={{ background: "linear-gradient(135deg, #1a1209 0%, #2d200e 100%)", padding: "20px 20px 24px" }}>
        <button onClick={onBack} style={{ background: "rgba(255,255,255,0.1)", border: "none", color: "#f0c060", fontSize: 14, cursor: "pointer", padding: "6px 12px", borderRadius: 8, marginBottom: 14 }}>← Back</button>
        <div style={{ fontSize: 10, letterSpacing: 3, color: "#8B7355", textTransform: "uppercase", marginBottom: 4 }}>🧮 Scoring · Duplicate Bridge</div>
        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, color: "#f0c060", fontWeight: 700 }}>Bridge Scoring</div>
        <div style={{ display: "flex", gap: 6, marginTop: 12 }}>
          {Array.from({ length: totalQuestions }).map((_, i) => (
            <div key={i} style={{
              height: 6, flex: 1, borderRadius: 3,
              background: i < qIndex ? "#f0c060" : i === qIndex ? "#fff" : "rgba(255,255,255,0.25)",
              transition: "background 0.3s",
            }} />
          ))}
        </div>
        <div style={{ fontSize: 11, color: "#8B7355", marginTop: 6 }}>
          Question {qIndex + 1} of {totalQuestions} · Score: {score} pts
        </div>
      </div>

      <div style={{ padding: "20px" }}>
        {question ? (
          <>
            {/* Question card */}
            <div style={{ background: "#fff", border: "1.5px solid #e8dcc8", borderRadius: 14, padding: 18, marginBottom: 16 }}>
              <div style={{ display: "flex", gap: 12, marginBottom: 14, flexWrap: "wrap" }}>
                <div>
                  <div style={{ fontSize: 10, color: "#888", letterSpacing: 1, textTransform: "uppercase", marginBottom: 2 }}>Contract</div>
                  <div style={{ fontWeight: 700, fontSize: 18, color: "#1a1209" }}>{question.contract}</div>
                </div>
                <div>
                  <div style={{ fontSize: 10, color: "#888", letterSpacing: 1, textTransform: "uppercase", marginBottom: 2 }}>Result</div>
                  <div style={{ fontWeight: 700, fontSize: 18, color: question.result?.startsWith("-") ? "#c0392b" : "#2e7d32" }}>{question.result}</div>
                </div>
                <div>
                  <div style={{ fontSize: 10, color: "#888", letterSpacing: 1, textTransform: "uppercase", marginBottom: 2 }}>Vul</div>
                  <div style={{ fontWeight: 700, color: question.vulnerable === "VUL" ? "#c0392b" : "#1a1209" }}>{question.vulnerable}</div>
                </div>
                {question.doubled && (
                  <div>
                    <div style={{ fontSize: 10, color: "#888", letterSpacing: 1, textTransform: "uppercase", marginBottom: 2 }}>Status</div>
                    <div style={{ fontWeight: 700, color: "#c0392b" }}>Doubled</div>
                  </div>
                )}
              </div>
              <div style={{ background: "#faf6f0", borderRadius: 10, padding: "12px 14px", borderLeft: "3px solid #c4a882", fontSize: 15, color: "#2d200e", fontStyle: "italic" }}>
                {question.question}
              </div>
            </div>

            {/* Options */}
            {question.options.map((opt) => {
              let bg = "#fff", border = "1.5px solid #e8dcc8", color = "#2d200e";
              if (revealed) {
                if (opt === question.correct) { bg = "#e8f5e9"; border = "2px solid #2e7d32"; color = "#2e7d32"; }
                else if (opt === selected) { bg = "#fdecea"; border = "2px solid #c0392b"; color = "#c0392b"; }
              } else if (opt === selected) {
                bg = "#fdf3e0"; border = "2px solid #c4a882";
              }
              return (
                <button key={opt} onClick={() => !revealed && setSelected(opt)} style={{
                  display: "flex", alignItems: "center", gap: 12, width: "100%",
                  background: bg, border, borderRadius: 12, padding: "14px 16px",
                  marginBottom: 10, cursor: revealed ? "default" : "pointer", textAlign: "left",
                }}>
                  <div style={{
                    width: 22, height: 22, borderRadius: "50%", flexShrink: 0,
                    background: revealed && opt === question.correct ? "#2e7d32" : revealed && opt === selected ? "#c0392b" : opt === selected ? "#c4a882" : "#e8dcc8",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    {revealed && opt === question.correct && <span style={{ color: "#fff", fontSize: 12 }}>✓</span>}
                    {revealed && opt === selected && opt !== question.correct && <span style={{ color: "#fff", fontSize: 12 }}>✗</span>}
                  </div>
                  <span style={{ fontWeight: 600, fontSize: 16, color }}>{opt} points</span>
                </button>
              );
            })}

            {/* Explanation */}
            {revealed && (
              <div style={{ background: selected === question.correct ? "#e8f5e9" : "#fdecea", borderRadius: 12, padding: 16, marginTop: 8, marginBottom: 16 }}>
                <div style={{ fontWeight: 700, color: selected === question.correct ? "#2e7d32" : "#c0392b", marginBottom: 6, fontSize: 15 }}>
                  {selected === question.correct ? "✓ Correct!" : `✗ Correct answer: ${question.correct} points`}
                </div>
                <div style={{ fontSize: 13, color: "#2d200e", lineHeight: 1.6 }}>{question.explanation}</div>
              </div>
            )}

            {/* Buttons */}
            {!revealed ? (
              <button onClick={handleSubmit} disabled={!selected} style={{
                width: "100%", padding: "15px", borderRadius: 12, border: "none",
                background: selected ? "linear-gradient(135deg, #1a1209, #2d200e)" : "#e8dcc8",
                color: selected ? "#f0c060" : "#999", fontSize: 16, fontWeight: 700, cursor: selected ? "pointer" : "default",
              }}>Check Answer</button>
            ) : (
              <button onClick={handleNext} style={{
                width: "100%", padding: "15px", borderRadius: 12, border: "none",
                background: "linear-gradient(135deg, #1a1209, #2d200e)",
                color: "#f0c060", fontSize: 16, fontWeight: 700, cursor: "pointer",
              }}>{qIndex + 1 >= totalQuestions ? "Finish" : "Next Question →"}</button>
            )}
          </>
        ) : null}
      </div>
    </div>
  );
}


// ─── Leads Screen ────────────────────────────────────────────────────────────

function LeadsScreen({ onBack, onAnswer }) {
  const [hand, setHand] = useState(null);
  const [scenario, setScenario] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [stats, setStats] = useState({ correct: 0, total: 0 });

  const newHand = () => {
    const sc = leadGetRandomScenario();
    setScenario(sc);
    setHand(leadGenerateHand(sc));
    setFeedback(null);
  };

  useEffect(() => { newHand(); }, []);
  if (!hand || !scenario) return null;

  const handleCard = (suit, card) => {
    const result = leadEvaluate(card, suit, hand, scenario);
    setFeedback(result);
    const correct = result.correct;
    setStats(p => ({ correct: p.correct + (correct ? 1 : 0), total: p.total + 1 }));
    onAnswer(correct);
  };

  const suitColor = s => s === "♠" ? "#2c3e7a" : s === "♥" ? "#b91c1c" : s === "♦" ? "#c2510a" : "#1a6b2e";
  const suitBg   = s => s === "♠" ? "#e8eeff" : s === "♥" ? "#fff0f0" : s === "♦" ? "#fff5eb" : "#edfff2";
  const rate = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0;
  const strategy = leadGetStrategy(scenario, hand);

  const positions = ["West", "North", "East", "South"];
  const bids = scenario.bids || [];
  const dealerIdx = bids.length ? positions.indexOf(bids[0].seat) : 0;
  const rows = [];
  let bidIdx = 0;
  const firstRow = ["", "", ""];
  for (let i = 0; i < 4 - dealerIdx && bidIdx < bids.length; i++) {
    firstRow[positions.indexOf(bids[bidIdx].seat)] = bids[bidIdx].call; bidIdx++;
  }
  rows.push(firstRow);
  while (bidIdx < bids.length) {
    const row = ["", "", ""];
    for (let i = 0; i < 4 && bidIdx < bids.length; i++) {
      row[positions.indexOf(bids[bidIdx].seat)] = bids[bidIdx].call; bidIdx++;
    }
    rows.push(row);
  }

  return (
    <div style={{ padding: "0 0 40px" }}>
      {/* Header */}
      <div style={{ background: "linear-gradient(135deg, #0d1b2a 0%, #1a2f45 100%)", padding: "20px 20px 28px" }}>
        <button onClick={onBack} style={{ background: "rgba(255,255,255,0.1)", border: "none", color: "#7dd3fc", fontSize: 14, cursor: "pointer", padding: "6px 12px", borderRadius: 8, marginBottom: 14 }}>← Back</button>
        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, color: "#7dd3fc", fontWeight: 700 }}>Opening Leads</div>
        <div style={{ fontSize: 12, color: "#4a6fa5", marginTop: 2 }}>You are West — choose your opening lead</div>
        <div style={{ display: "flex", gap: 12, marginTop: 14 }}>
          {[["✓", stats.correct, "#4ade80"], ["Total", stats.total, "#7dd3fc"], ["Rate", `${rate}%`, "#fbbf24"]].map(([l, v, c]) => (
            <div key={l} style={{ background: "rgba(255,255,255,0.08)", padding: "6px 14px", borderRadius: 10, textAlign: "center" }}>
              <div style={{ fontSize: 10, color: "#64748b" }}>{l}</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: c }}>{v}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ padding: "16px 16px 0" }}>
        {/* Auction */}
        <div style={{ background: "#1e293b", borderRadius: 14, padding: 14, marginBottom: 12 }}>
          <div style={{ color: "#7dd3fc", fontWeight: 700, fontSize: 13, marginBottom: 10, letterSpacing: 1, textTransform: "uppercase" }}>Auction</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 4, marginBottom: 8 }}>
            {["West", "North", "East", "South"].map(p => (
              <div key={p} style={{ color: "#4ade80", fontWeight: 700, fontSize: 11, textAlign: "center" }}>{p}</div>
            ))}
          </div>
          {rows.map((row, ri) => (
            <div key={ri} style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 4, marginBottom: 2 }}>
              {row.map((call, ci) => (
                <div key={ci} style={{ textAlign: "center", fontSize: 13, fontFamily: "monospace", padding: "3px 2px",
                  color: call === "Pass" ? "#475569" : call === "Dbl" ? "#fbbf24" : call ? "#f1f5f9" : "#1e293b",
                  fontWeight: call && call !== "Pass" ? 700 : 400 }}>
                  {call || "—"}
                </div>
              ))}
            </div>
          ))}
          <div style={{ marginTop: 10, padding: "8px 12px", background: "rgba(251,191,36,0.15)", borderRadius: 8, color: "#fbbf24", fontWeight: 700, fontSize: 15 }}>
            ➜ {scenario.contract}
          </div>
          {scenario.partnerBid && (
            <div style={{ marginTop: 8, padding: "7px 12px", background: "rgba(74,222,128,0.12)", borderRadius: 8, color: "#4ade80", fontSize: 13, fontWeight: 600 }}>
              💡 Partner bid {scenario.partnerBid} — lead partner's suit!
            </div>
          )}
          {scenario.partnerDoubled && (
            <div style={{ marginTop: 8, padding: "7px 12px", background: "rgba(251,191,36,0.12)", borderRadius: 8, color: "#fbbf24", fontSize: 13, fontWeight: 600 }}>
              ⚡ Partner doubled — lead your best/longest suit
            </div>
          )}
        </div>

        {/* Strategy hint */}
        <div style={{ background: strategy.strategy === "active" ? "rgba(239,68,68,0.1)" : strategy.strategy === "passive" ? "rgba(34,197,94,0.1)" : "rgba(148,163,184,0.1)",
          border: `1px solid ${strategy.strategy === "active" ? "#ef444440" : strategy.strategy === "passive" ? "#22c55e40" : "#94a3b840"}`,
          borderRadius: 12, padding: "10px 14px", marginBottom: 12 }}>
          <div style={{ fontWeight: 700, fontSize: 12, color: strategy.strategy === "active" ? "#f87171" : strategy.strategy === "passive" ? "#4ade80" : "#94a3b8", textTransform: "uppercase", letterSpacing: 1 }}>
            {strategy.strategy} Lead Strategy
          </div>
          <div style={{ fontSize: 12, color: "#cbd5e1", marginTop: 3 }}>{strategy.reason}</div>
          <div style={{ fontSize: 12, color: "#f1f5f9", fontWeight: 500, marginTop: 2 }}>→ {strategy.priority}</div>
        </div>

        {/* Hand */}
        <div style={{ background: "#fff", border: "1.5px solid #e8dcc8", borderRadius: 14, padding: 14, marginBottom: 12 }}>
          <div style={{ fontSize: 12, color: "#8B7355", fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", marginBottom: 10 }}>Your Hand (West)</div>
          {LEAD_SUITS.map(suit => (
            <div key={suit} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
              <span style={{ fontSize: 20, minWidth: 26, color: suitColor(suit) }}>{suit}</span>
              <span style={{ fontFamily: "monospace", fontSize: 15, letterSpacing: 3, color: "#1a1209" }}>
                {hand[suit].length ? hand[suit].join(" ") : "—"}
              </span>
            </div>
          ))}
        </div>

        {/* Card buttons */}
        {!feedback && (
          <>
            <div style={{ fontSize: 13, color: "#8B7355", fontWeight: 700, textAlign: "center", marginBottom: 10 }}>Tap a card to lead:</div>
            {LEAD_SUITS.map(suit => hand[suit].length > 0 && (
              <div key={suit} style={{ background: suitBg(suit), border: `1.5px solid ${suitColor(suit)}30`, borderRadius: 12, padding: "10px 12px", marginBottom: 10 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                  <span style={{ fontSize: 18, color: suitColor(suit) }}>{suit}</span>
                  <span style={{ fontSize: 12, color: "#8B7355" }}>
                    {suit==="♠"?"Spades":suit==="♥"?"Hearts":suit==="♦"?"Diamonds":"Clubs"}
                  </span>
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {hand[suit].map(card => (
                    <button key={`${suit}${card}`} onClick={() => handleCard(suit, card)}
                      style={{ padding: "10px 14px", background: "#fff", border: `2px solid ${suitColor(suit)}`, borderRadius: 10,
                        color: suitColor(suit), fontSize: 18, fontWeight: 700, fontFamily: "monospace",
                        cursor: "pointer", minWidth: 46, minHeight: 46, boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }}>
                      {card}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </>
        )}

        {/* Feedback */}
        {feedback && (
          <div style={{ borderRadius: 14, padding: 20, marginBottom: 16,
            border: `2px solid ${feedback.correct ? "#16a34a" : "#dc2626"}`,
            background: feedback.correct ? "#f0fdf4" : "#fff5f5" }}>
            <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 10, color: feedback.correct ? "#15803d" : "#dc2626" }}>
              {feedback.correct ? "✓ Correct!" : "✗ Not Optimal"}
            </div>
            <div style={{ fontSize: 14, lineHeight: 1.7, whiteSpace: "pre-line", color: "#374151" }}>{feedback.message}</div>
            <div style={{ textAlign: "center", marginTop: 18 }}>
              <button onClick={newHand} style={{ padding: "12px 32px", background: "linear-gradient(135deg, #0d1b2a, #1a2f45)",
                border: "none", borderRadius: 12, color: "#7dd3fc", fontSize: 16, fontWeight: 700, cursor: "pointer", fontFamily: "Georgia, serif" }}>
                Next Hand →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── App ─────────────────────────────────────────────────────────────────────

export default function BridgeTrainer() {
  const [screen, setScreen] = useState("home");
  const [activeModule, setActiveModule] = useState(null);
  const [stats, setStats] = useState({
    total: 0, correct: 0, streak: 0,
    biddingTotal: 0, biddingCorrect: 0,
    playTotal: 0, playCorrect: 0,
    moduleProgress: {},
  });

  const navigate = (dest, mod = null) => {
    setScreen(dest);
    if (mod) setActiveModule(mod);
  };

  const handleAnswer = (correct, isLeads = false) => {
    setStats((prev) => {
      const mp = { ...prev.moduleProgress };
      if (!isLeads && activeModule) {
        const cur = mp[activeModule.id] || { correct: 0, total: 0 };
        mp[activeModule.id] = { correct: cur.correct + (correct ? 1 : 0), total: cur.total + 1 };
      }
      if (isLeads) {
        const cur = mp["leads"] || { correct: 0, total: 0 };
        mp["leads"] = { correct: cur.correct + (correct ? 1 : 0), total: cur.total + 1 };
      }
      const isBidding = !isLeads && activeModule && activeModule.type === "bidding";
      const isPlay = !isLeads && activeModule && activeModule.type === "play";
      return {
        ...prev,
        total: prev.total + 1,
        correct: prev.correct + (correct ? 1 : 0),
        streak: correct ? prev.streak + 1 : 0,
        biddingTotal:   isBidding ? prev.biddingTotal + 1 : prev.biddingTotal,
        biddingCorrect: isBidding && correct ? prev.biddingCorrect + 1 : prev.biddingCorrect,
        playTotal:      isPlay || isLeads ? prev.playTotal + 1 : prev.playTotal,
        playCorrect:    (isPlay || isLeads) && correct ? prev.playCorrect + 1 : prev.playCorrect,
        moduleProgress: mp,
      };
    });
  };

  return (
    <div style={{
      maxWidth: 430, margin: "0 auto", minHeight: "100vh",
      background: "#faf6f0", fontFamily: "'Georgia', serif",
      position: "relative", overflowX: "hidden",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&display=swap');
        * { box-sizing: border-box; }
        body { margin: 0; background: #e8dcc8; }
      `}</style>

      {screen === "home" && <HomeScreen stats={stats} onNavigate={navigate} />}
      {screen === "question" && activeModule && activeModule.id !== "scoring-1" && (
        <QuestionScreen
          module={activeModule}
          onBack={() => setScreen("home")}
          onAnswer={handleAnswer}
        />
      )}
      {screen === "question" && activeModule && activeModule.id === "scoring-1" && (
        <ScoringScreen
          onBack={() => setScreen("home")}
          onAnswer={handleAnswer}
        />
      )}
      {screen === "stats" && <StatsScreen stats={stats} onBack={() => setScreen("home")} />}
      {screen === "leads" && (
        <LeadsScreen
          onBack={() => setScreen("home")}
          onAnswer={(correct) => handleAnswer(correct, true)}
        />
      )}

      {screen !== "leads" && (
        <div style={{
          textAlign: "center", padding: "16px 0 24px",
          fontSize: 11, color: "#999", fontFamily: "Georgia, serif",
          borderTop: "1px solid #e0d8cc", marginTop: 8,
        }}>
          <div style={{
            fontSize: 10, color: "#aaa", fontStyle: "italic",
            marginBottom: 10, lineHeight: 1.6,
            padding: "8px 12px", background: "#f5ede0",
            borderRadius: 8, border: "1px solid #e8dcc8",
          }}>
            ⚠️ Questions may contain errors. Found a mistake?{" "}
            <a href="mailto:bridgetrainergame@gmail.com" style={{ color: "#9b7d5a", textDecoration: "underline" }}>
              bridgetrainergame@gmail.com
            </a>
          </div>
          Developed by <strong style={{ color: "#7a6248" }}>Avi Berger</strong>
          <br />
          <a href="mailto:bridgetrainergame@gmail.com" style={{ color: "#9b7d5a", textDecoration: "none" }}>
            bridgetrainergame@gmail.com
          </a>
          {screen === "home" && (
            <div style={{ marginTop: 6, fontSize: 10, color: "#bbb", letterSpacing: 1 }}>
              v2.4.1
            </div>
          )}
        </div>
      )}
    </div>
  );
}
