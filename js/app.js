/* ==========================================================
   Numerical Quiz - app logic
   Screens: home (settings) -> quiz -> result
   Question data lives in questions.js (QuizData).
   ========================================================== */

(function () {
  'use strict';

  var D = window.QuizData;
  var G = D.G, TOPICS = D.TOPICS, ri = D.ri, pick = D.pick, shuffle = D.shuffle;

  var $ = function (s) { return document.querySelector(s); };

  /* ---------- helpers ---------- */
  // Show whole numbers as-is, decimals with up to 2 places
  function fmt(n) { return Number.isInteger(n) ? String(n) : String(+n.toFixed(2)); }

  // localStorage can be blocked (private mode etc.), so always wrap it
  function store(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  function load(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }

  var TOPIC_NAME = {};
  TOPICS.forEach(function (t) { TOPIC_NAME[t.id] = t.name; });

  /* ---------- home screen ---------- */
  var saved = {};
  try { saved = JSON.parse(load('mq_cfg') || '{}') || {}; } catch (e) { saved = {}; }

  function buildTopics() {
    var box = $('#topicList');
    box.innerHTML = '';
    var selected = saved.topics && saved.topics.length ? saved.topics : TOPICS.map(function (t) { return t.id; });
    TOPICS.forEach(function (t) {
      var lab = document.createElement('label');
      lab.className = 'check';
      lab.innerHTML =
        '<input type="checkbox" value="' + t.id + '"' + (selected.indexOf(t.id) > -1 ? ' checked' : '') + '>' +
        '<span class="box"></span>' +
        '<span class="txt"><b>' + t.name.replace('&', '&amp;') + '</b><small>' + t.hint + '</small></span>';
      box.appendChild(lab);
    });
  }

  function buildSeg(id, name, items, current) {
    var box = $(id);
    box.innerHTML = '';
    items.forEach(function (it) {
      var lab = document.createElement('label');
      lab.innerHTML =
        '<input type="radio" name="' + name + '" value="' + it.v + '"' + (String(current) === it.v ? ' checked' : '') + '>' +
        '<span>' + it.t + '</span>';
      box.appendChild(lab);
    });
  }

  buildTopics();
  buildSeg('#diffSeg', 'diff', D.DIFFS, saved.diff !== undefined ? saved.diff : '1');
  buildSeg('#countSeg', 'count', D.COUNTS, saved.count || '10');
  buildSeg('#timeSeg', 'time', D.TIMES, saved.time !== undefined ? saved.time : '60');

  function topicBoxes() { return Array.prototype.slice.call(document.querySelectorAll('#topicList input')); }

  function syncToggleLabel() {
    var all = topicBoxes().every(function (b) { return b.checked; });
    $('#toggleAll').textContent = all ? 'Clear all' : 'Select all';
  }

  $('#toggleAll').addEventListener('click', function () {
    var all = topicBoxes().every(function (b) { return b.checked; });
    topicBoxes().forEach(function (b) { b.checked = !all; });
    syncToggleLabel();
    $('#homeErr').hidden = true;
  });
  $('#topicList').addEventListener('change', function () {
    syncToggleLabel();
    $('#homeErr').hidden = true;
  });
  syncToggleLabel();

  function radioVal(name) {
    var r = document.querySelector('input[name="' + name + '"]:checked');
    return r ? r.value : null;
  }

  function readCfg() {
    return {
      topics: topicBoxes().filter(function (b) { return b.checked; }).map(function (b) { return b.value; }),
      diff: radioVal('diff'),
      count: +radioVal('count'),
      time: +radioVal('time')
    };
  }

  function updateBest() {
    var best = +load('mq_best') || 0;
    $('#bestNote').textContent = best ? 'Best points so far: ' + best : '';
  }
  updateBest();

  /* ---------- quiz state ---------- */
  var S = {
    cfg: null, qs: [], i: 0, points: 0, streak: 0, maxStreak: 0, correct: 0,
    answered: false, results: [], timerId: null, left: 0, startedAt: 0
  };

  function show(id) {
    ['home', 'quiz', 'result'].forEach(function (s) { $('#' + s).hidden = (s !== id); });
    window.scrollTo(0, 0);
  }

  // Build the list of questions for one quiz session
  function makeQuestions(cfg) {
    var order = [];
    while (order.length < cfg.count) { order = order.concat(shuffle(cfg.topics)); }
    order = order.slice(0, cfg.count);

    var seen = {}, out = [];
    order.forEach(function (topic) {
      var level = cfg.diff === 'mix' ? ri(0, 2) : +cfg.diff;
      var q;
      for (var k = 0; k < 15; k++) {          // try to avoid repeating the same question
        q = pick(G[topic][level])();
        if (!seen[q.q]) break;
      }
      seen[q.q] = true;
      q.topic = topic;
      q.level = level;
      out.push(q);
    });
    return out;
  }

  function startQuiz() {
    var cfg = readCfg();
    if (!cfg.topics.length) { $('#homeErr').hidden = false; return; }

    store('mq_cfg', JSON.stringify({ topics: cfg.topics, diff: cfg.diff, count: String(cfg.count), time: String(cfg.time) }));

    S = {
      cfg: cfg, qs: makeQuestions(cfg), i: 0, points: 0, streak: 0, maxStreak: 0, correct: 0,
      answered: false, results: [], timerId: null, left: 0, startedAt: Date.now()
    };
    $('#qt').textContent = cfg.count;
    $('#timerWrap').hidden = !cfg.time;
    show('quiz');
    renderQuestion();
  }

  function renderQuestion() {
    var q = S.qs[S.i];
    S.answered = false;

    $('#qn').textContent = S.i + 1;
    $('#pts').textContent = S.points;
    $('#streak').textContent = S.streak;

    var pct = Math.round(S.i / S.qs.length * 100);
    $('#fill').style.width = pct + '%';
    $('#barA11y').setAttribute('aria-valuenow', pct);

    $('#topicName').textContent = TOPIC_NAME[q.topic];
    $('#qtext').textContent = q.q;
    $('#unit').textContent = q.unit ? '(' + q.unit + ')' : '';

    var input = $('#ans');
    input.value = '';
    input.disabled = false;
    $('#ansErr').hidden = true;
    $('#fb').hidden = true;
    $('#nextRow').hidden = true;
    $('#actRow').hidden = false;
    $('#nextBtn').textContent = (S.i === S.qs.length - 1) ? 'See results' : 'Next question';
    input.focus();

    startTimer();
  }

  /* ---------- timer ---------- */
  function startTimer() {
    stopTimer();
    if (!S.cfg.time) return;
    S.left = S.cfg.time;
    paintTimer();
    S.timerId = setInterval(function () {
      S.left--;
      paintTimer();
      if (S.left <= 0) { stopTimer(); grade('time'); }
    }, 1000);
  }
  function stopTimer() {
    if (S.timerId) { clearInterval(S.timerId); S.timerId = null; }
  }
  function paintTimer() {
    $('#timer').textContent = Math.max(S.left, 0);
    $('#timerWrap').classList.toggle('low', S.left <= 10);
  }

  /* ---------- answering ---------- */
  // Accepts things like "1,080", "₹1080", "45%", "48 km/h"
  function parseNum(s) {
    var t = String(s).trim().replace(/[,₹%\s]/g, '').replace(/[a-zA-Z²³\/]+$/, '');
    if (t === '' || !/^-?\d*\.?\d+$/.test(t)) return NaN;
    return Number(t);
  }

  function onCheck() {
    if (S.answered) return;
    var v = parseNum($('#ans').value);
    if (isNaN(v)) { $('#ansErr').hidden = false; $('#ans').focus(); return; }
    grade('answer');
  }

  // kind: 'answer' | 'skip' | 'time'
  function grade(kind) {
    if (S.answered) return;
    stopTimer();
    S.answered = true;

    var q = S.qs[S.i];
    var raw = $('#ans').value.trim();
    var val = parseNum(raw);
    var ok = (kind !== 'skip') && !isNaN(val) && Math.abs(val - q.a) < 0.011;
    var status = ok ? 'ok' : (kind === 'skip' ? 'skip' : (kind === 'time' ? 'time' : 'bad'));

    // Points: 10 per correct answer + streak bonus (max +10) + speed bonus (max +5, only with timer)
    var gained = 0;
    if (ok) {
      S.correct++;
      S.streak++;
      S.maxStreak = Math.max(S.maxStreak, S.streak);
      var streakBonus = Math.min(S.streak - 1, 5) * 2;
      var timeBonus = S.cfg.time ? Math.floor(Math.max(S.left, 0) / S.cfg.time * 5) : 0;
      gained = 10 + streakBonus + timeBonus;
      S.points += gained;
    } else {
      S.streak = 0;
    }

    S.results.push({ q: q.q, a: q.a, unit: q.unit, exp: q.exp, given: raw, status: status, topic: q.topic });

    $('#pts').textContent = S.points;
    $('#streak').textContent = S.streak;
    $('#ans').disabled = true;
    $('#ansErr').hidden = true;
    $('#actRow').hidden = true;

    // Feedback box
    var head;
    if (ok) head = 'Correct! +' + gained + ' points';
    else if (status === 'skip') head = 'Skipped';
    else if (status === 'time') head = "Time's up";
    else head = 'Wrong answer';

    var markSvg = ok
      ? '<svg class="mark ok" viewBox="0 0 54 54" aria-hidden="true"><path d="M8 29 L21 42 L46 10"/></svg>'
      : '<svg class="mark bad" viewBox="0 0 54 54" aria-hidden="true"><path d="M10 10 L44 44"/><path d="M44 10 L10 44"/></svg>';

    var fb = $('#fb');
    fb.className = 'fb ' + (ok ? 'ok' : 'bad');
    fb.innerHTML = markSvg + '<div><h3></h3><p class="ca"></p><p class="exp"></p></div>';
    fb.querySelector('h3').textContent = head;
    if (ok) {
      fb.querySelector('.ca').hidden = true;
    } else {
      fb.querySelector('.ca').innerHTML = 'Correct answer: <b></b>';
      fb.querySelector('.ca b').textContent = fmt(q.a) + (q.unit ? ' ' + q.unit : '');
    }
    fb.querySelector('.exp').textContent = q.exp;
    fb.hidden = false;

    $('#nextRow').hidden = false;
    $('#nextBtn').focus();

    var pct = Math.round((S.i + 1) / S.qs.length * 100);
    $('#fill').style.width = pct + '%';
    $('#barA11y').setAttribute('aria-valuenow', pct);
  }

  function next() {
    if (!S.answered) return;
    S.i++;
    if (S.i >= S.qs.length) finish(); else renderQuestion();
  }

  /* ---------- result screen ---------- */
  function finish() {
    stopTimer();
    var n = S.qs.length;
    var acc = Math.round(S.correct / n * 100);
    var secs = Math.round((Date.now() - S.startedAt) / 1000);

    $('#scoreText').textContent = S.correct + '/' + n;

    var remark =
      acc >= 90 ? 'Outstanding! Very quick and accurate.' :
      acc >= 70 ? 'Well done! A little more practice and it will be perfect.' :
      acc >= 40 ? 'Not bad. Review the wrong questions and try again.' :
                  "Keep going. Speed comes with practice, so try again!";
    $('#remark').textContent = remark;

    $('#rAcc').textContent = acc + '%';
    $('#rPts').textContent = S.points;
    $('#rStreak').textContent = S.maxStreak;
    $('#rTime').textContent = secs >= 60 ? Math.floor(secs / 60) + 'm ' + (secs % 60) + 's' : secs + 's';

    if (S.points > (+load('mq_best') || 0)) store('mq_best', String(S.points));
    updateBest();

    // Review list
    var list = $('#review');
    list.innerHTML = '';
    S.results.forEach(function (r, idx) {
      var li = document.createElement('li');
      li.className = r.status === 'ok' ? 'ok' : 'bad';

      var given = r.status === 'skip' ? 'skipped'
                : (r.status === 'time' && !r.given) ? 'time up'
                : (r.given || '-');
      var answerText = fmt(r.a) + (r.unit ? ' ' + r.unit : '');

      li.innerHTML = '<div class="sym" aria-hidden="true"></div><div><div class="rq"></div><div class="ra"></div><div class="re"></div></div>';
      li.querySelector('.sym').textContent = r.status === 'ok' ? '✓' : '✗';
      li.querySelector('.rq').textContent = (idx + 1) + '. ' + r.q;
      li.querySelector('.ra').textContent = r.status === 'ok'
        ? 'Correct: ' + answerText
        : 'Your answer: ' + given + '. Correct answer: ' + answerText;
      li.querySelector('.re').textContent = r.exp;
      list.appendChild(li);
    });
    $('#onlyWrong').checked = false;
    list.classList.remove('onlywrong');

    show('result');
    $('#resultHead').focus();
  }

  /* ---------- events ---------- */
  $('#startBtn').addEventListener('click', startQuiz);
  $('#checkBtn').addEventListener('click', onCheck);
  $('#skipBtn').addEventListener('click', function () { grade('skip'); });
  $('#nextBtn').addEventListener('click', next);
  $('#quitBtn').addEventListener('click', function () { stopTimer(); show('home'); });
  $('#againBtn').addEventListener('click', startQuiz);
  $('#homeBtn').addEventListener('click', function () { show('home'); });
  $('#onlyWrong').addEventListener('change', function (e) { $('#review').classList.toggle('onlywrong', e.target.checked); });
  $('#ans').addEventListener('input', function () { $('#ansErr').hidden = true; });

  // Enter = check answer, or go to the next question if already answered
  $('#ans').addEventListener('keydown', function (e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (S.answered) next(); else onCheck();
    }
  });

  /* ---------- light / dark theme ---------- */
  var root = document.documentElement;

  function effectiveTheme() {
    var t = root.getAttribute('data-theme');
    if (t) return t;
    return (window.matchMedia && matchMedia('(prefers-color-scheme: dark)').matches) ? 'dark' : 'light';
  }
  function themeLabel() {
    $('#themeBtn').textContent = effectiveTheme() === 'dark' ? 'Light mode' : 'Dark mode';
  }

  var savedTheme = load('mq_theme');
  if (savedTheme === 'dark' || savedTheme === 'light') root.setAttribute('data-theme', savedTheme);
  themeLabel();

  $('#themeBtn').addEventListener('click', function () {
    var n = effectiveTheme() === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', n);
    store('mq_theme', n);
    themeLabel();
  });
})();
