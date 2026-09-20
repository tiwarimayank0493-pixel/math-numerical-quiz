/* ==========================================================
   Numerical Quiz - question generators

   Every topic has three difficulty levels (0 = Easy, 1 = Medium, 2 = Hard).
   Each level is a list of functions. A function creates one random question
   and returns an object:
     q     : the question text
     a     : the correct numeric answer
     unit  : unit shown next to the answer box ('' if none)
     exp   : short step-by-step explanation shown after answering

   To add a new question type, add a function to the right list below.
   To add a new topic, add a new key to QuizData.G and an entry to QuizData.TOPICS.
   ========================================================== */

(function (global) {
  'use strict';

  /* ---------- small helpers ---------- */
  var ri = function (a, b) { return Math.floor(Math.random() * (b - a + 1)) + a; };   // random integer a..b
  var pick = function (arr) { return arr[Math.floor(Math.random() * arr.length)]; };  // random item
  var gcd = function (a, b) { return b ? gcd(b, a % b) : a; };

  function shuffle(a) {
    a = a.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  // Two different numbers in lo..hi that share no common factor
  function coprimePair(lo, hi) {
    var m, n;
    do { m = ri(lo, hi); n = ri(lo, hi); } while (m === n || gcd(m, n) !== 1);
    return [m, n];
  }

  /* ---------- question generators: G[topic][difficulty] = [fn, fn, ...] ---------- */
  var G = {

    /* ===== Arithmetic ===== */
    arith: [
      [ // Easy
        function () { var a = ri(100, 999), b = ri(100, 999); return { q: 'Find: ' + a + ' + ' + b, a: a + b, unit: '', exp: 'Add the two numbers: ' + a + ' + ' + b + ' = ' + (a + b) + '.' }; },
        function () { var x = ri(300, 999), y = ri(100, x - 50); return { q: 'Find: ' + x + ' − ' + y, a: x - y, unit: '', exp: 'Subtract: ' + x + ' − ' + y + ' = ' + (x - y) + '.' }; },
        function () { var a = ri(12, 29), b = ri(6, 15); return { q: 'Find: ' + a + ' × ' + b, a: a * b, unit: '', exp: a + ' × ' + b + ' = ' + (a * b) + '.' }; }
      ],
      [ // Medium
        function () {
          var a = ri(10, 50), b = ri(10, 50), c = ri(2, 9), s = (a + b) * c, d = ri(5, Math.min(60, s - 1));
          return { q: 'Find: (' + a + ' + ' + b + ') × ' + c + ' − ' + d, a: s - d, unit: '', exp: 'BODMAS: solve the bracket first: ' + a + ' + ' + b + ' = ' + (a + b) + '. Then multiply by ' + c + ': ' + s + '. Finally subtract ' + d + ': ' + (s - d) + '.' };
        },
        function () {
          var c = ri(2, 9), k = ri(5, 30), m = ri(2, 9), x = c * k;
          return { q: 'Find: ' + x + ' ÷ ' + c + ' × ' + m, a: k * m, unit: '', exp: 'Work from left to right: ' + x + ' ÷ ' + c + ' = ' + k + ', then ' + k + ' × ' + m + ' = ' + (k * m) + '.' };
        },
        function () { var a = ri(11, 35); return { q: 'Find the value of ' + a + '²', a: a * a, unit: '', exp: a + '² = ' + a + ' × ' + a + ' = ' + (a * a) + '.' }; }
      ],
      [ // Hard
        function () {
          var a = ri(12, 40), b = ri(11, 30), d = ri(2, 9), k = ri(10, 40), c = d * k;
          return { q: 'Find: ' + a + ' × ' + b + ' + ' + c + ' ÷ ' + d, a: a * b + k, unit: '', exp: 'BODMAS: do multiplication and division first. ' + a + ' × ' + b + ' = ' + (a * b) + ' and ' + c + ' ÷ ' + d + ' = ' + k + '. Now add: ' + (a * b) + ' + ' + k + ' = ' + (a * b + k) + '.' };
        },
        function () {
          var a = ri(21, 50), b = ri(11, 19);
          return { q: 'Find: ' + a + '² − ' + b + '²', a: a * a - b * b, unit: '', exp: 'a² − b² = (a + b)(a − b) = (' + a + ' + ' + b + ') × (' + a + ' − ' + b + ') = ' + (a + b) + ' × ' + (a - b) + ' = ' + (a * a - b * b) + '.' };
        },
        function () {
          var a = ri(101, 499), b = ri(11, 29), t = Math.floor(b / 10) * 10, u = b % 10;
          return { q: 'Find: ' + a + ' × ' + b, a: a * b, unit: '', exp: 'Split ' + b + ' into ' + t + ' + ' + u + '. ' + a + ' × ' + t + ' = ' + (a * t) + ' and ' + a + ' × ' + u + ' = ' + (a * u) + '. Add them: ' + (a * b) + '.' };
        }
      ]
    ],

    /* ===== Percentage ===== */
    percent: [
      [
        function () { var p = pick([5, 10, 15, 20, 25, 30, 40, 50, 60, 75]), n = 20 * ri(2, 30), r = n * p / 100; return { q: 'What is ' + p + '% of ' + n + '?', a: r, unit: '', exp: p + '% of ' + n + ' = ' + n + ' × ' + p + ' ÷ 100 = ' + r + '.' }; },
        function () { var p = pick([10, 20, 25, 50]), n = 20 * ri(3, 40), r = n * p / 100; return { q: 'Find ' + p + '% of ' + n + '.', a: r, unit: '', exp: n + ' × ' + p + ' ÷ 100 = ' + r + '.' }; }
      ],
      [
        function () { var p = 5 * ri(1, 19), b = 20 * ri(2, 25), a = p * b / 100; return { q: a + ' is what percent of ' + b + '?', a: p, unit: '%', exp: 'Percent = (' + a + ' ÷ ' + b + ') × 100 = ' + p + '%.' }; },
        function () {
          var p = pick([10, 20, 25, 50]), n = 20 * ri(3, 30), res = n * (100 + p) / 100;
          return { q: 'A number increased by ' + p + '% becomes ' + res + '. Find the number.', a: n, unit: '', exp: 'Number × (100 + ' + p + ') ÷ 100 = ' + res + ', so the number = ' + res + ' × 100 ÷ ' + (100 + p) + ' = ' + n + '.' };
        }
      ],
      [
        function () {
          var n = 100 * ri(2, 20), p = pick([10, 20, 30, 40, 50]), q = pick([10, 20, 30, 40, 50]), a1 = n * (100 + p) / 100, f = a1 * (100 - q) / 100;
          return { q: 'The price of an item is ₹' + n + '. It is increased by ' + p + '% and then decreased by ' + q + '%. Find the final price.', a: f, unit: 'rupees', exp: 'After the increase: ' + n + ' × ' + (100 + p) + '/100 = ' + a1 + '. After the decrease: ' + a1 + ' × ' + (100 - q) + '/100 = ' + f + '.' };
        },
        function () {
          var p = pick([40, 50, 60, 70, 75, 80]), t = 20 * ri(10, 60), fail = t * (100 - p) / 100;
          return { q: 'In an exam ' + p + '% of the students passed and ' + fail + ' students failed. How many students appeared in total?', a: t, unit: 'students', exp: 'Failed = ' + (100 - p) + '%. ' + (100 - p) + '% of total = ' + fail + ', so total = ' + fail + ' × 100 ÷ ' + (100 - p) + ' = ' + t + '.' };
        }
      ]
    ],

    /* ===== Profit & Loss ===== */
    profit: [
      [
        function () { var cp = ri(10, 90) * 10, pf = ri(2, 20) * 10, sp = cp + pf; return { q: 'An article is bought for ₹' + cp + ' and sold for ₹' + sp + '. Find the profit.', a: pf, unit: 'rupees', exp: 'Profit = SP − CP = ' + sp + ' − ' + cp + ' = ' + pf + '.' }; },
        function () { var cp = ri(20, 90) * 10, ls = ri(2, 15) * 10, sp = cp - ls; return { q: 'An article is bought for ₹' + cp + ' and sold for ₹' + sp + '. Find the loss.', a: ls, unit: 'rupees', exp: 'Loss = CP − SP = ' + cp + ' − ' + sp + ' = ' + ls + '.' }; }
      ],
      [
        function () { var cp = 20 * ri(5, 50), p = 5 * ri(1, 8), sp = cp * (100 + p) / 100; return { q: 'An article costing ₹' + cp + ' is sold at a profit of ' + p + '%. Find the selling price.', a: sp, unit: 'rupees', exp: 'SP = CP × (100 + ' + p + ') ÷ 100 = ' + cp + ' × ' + (100 + p) + ' ÷ 100 = ' + sp + '.' }; },
        function () {
          var m = 20 * ri(10, 60), d = pick([5, 10, 15, 20, 25, 30, 40, 50]), sp = m - m * d / 100;
          return { q: 'The marked price of a shirt is ₹' + m + '. A discount of ' + d + '% is given. Find the selling price.', a: sp, unit: 'rupees', exp: 'Discount = ' + m + ' × ' + d + ' ÷ 100 = ' + (m * d / 100) + '. SP = ' + m + ' − ' + (m * d / 100) + ' = ' + sp + '.' };
        }
      ],
      [
        function () { var cp = 20 * ri(10, 60), p = pick([10, 20, 25, 50]), sp = cp * (100 + p) / 100; return { q: 'A shopkeeper sells an item for ₹' + sp + ' and makes a profit of ' + p + '%. Find the cost price.', a: cp, unit: 'rupees', exp: 'SP = CP × (100 + ' + p + ') ÷ 100, so CP = ' + sp + ' × 100 ÷ ' + (100 + p) + ' = ' + cp + '.' }; },
        function () {
          var m = 100 * ri(5, 40), d1 = pick([10, 20, 30, 40, 50]), d2 = pick([10, 20, 30, 40, 50]), f = m * (100 - d1) * (100 - d2) / 10000;
          return { q: 'Two successive discounts of ' + d1 + '% and ' + d2 + '% are given on an item marked ₹' + m + '. Find the final price.', a: f, unit: 'rupees', exp: 'After the first discount: ' + m + ' × ' + (100 - d1) + '/100 = ' + (m * (100 - d1) / 100) + '. After the second: ' + (m * (100 - d1) / 100) + ' × ' + (100 - d2) + '/100 = ' + f + '.' };
        }
      ]
    ],

    /* ===== Simple Interest ===== */
    si: [
      [
        function () { var P = 1000 * ri(1, 20), R = ri(2, 12), T = ri(1, 5), si = P * R * T / 100; return { q: 'Find the simple interest on ₹' + P + ' at ' + R + '% per annum for ' + T + ' years.', a: si, unit: 'rupees', exp: 'SI = P × R × T ÷ 100 = ' + P + ' × ' + R + ' × ' + T + ' ÷ 100 = ' + si + '.' }; }
      ],
      [
        function () {
          var P = 1000 * ri(1, 20), R = ri(2, 12), T = ri(2, 6), si = P * R * T / 100;
          return { q: 'Find the total amount after ' + T + ' years if ₹' + P + ' is invested at ' + R + '% simple interest per annum.', a: P + si, unit: 'rupees', exp: 'SI = ' + P + ' × ' + R + ' × ' + T + ' ÷ 100 = ' + si + '. Amount = P + SI = ' + P + ' + ' + si + ' = ' + (P + si) + '.' };
        }
      ],
      [
        function () {
          var P = 500 * ri(2, 40), R = ri(3, 15), T = ri(2, 6), si = P * R * T / 100;
          return { q: 'At what rate percent per annum will ₹' + P + ' earn a simple interest of ₹' + si + ' in ' + T + ' years?', a: R, unit: '%', exp: 'R = SI × 100 ÷ (P × T) = ' + si + ' × 100 ÷ (' + P + ' × ' + T + ') = ' + R + '%.' };
        },
        function () {
          var P = 500 * ri(2, 40), R = ri(3, 15), T = ri(2, 8), si = P * R * T / 100;
          return { q: 'In how many years will ₹' + P + ' become ₹' + (P + si) + ' at ' + R + '% simple interest per annum?', a: T, unit: 'years', exp: 'SI = ' + (P + si) + ' − ' + P + ' = ' + si + '. T = SI × 100 ÷ (P × R) = ' + si + ' × 100 ÷ (' + P + ' × ' + R + ') = ' + T + ' years.' };
        }
      ]
    ],

    /* ===== Speed, Distance, Time ===== */
    speed: [
      [
        function () { var s = 5 * ri(6, 20), t = ri(2, 8); return { q: 'A car travels at ' + s + ' km/h for ' + t + ' hours. What distance does it cover?', a: s * t, unit: 'km', exp: 'Distance = Speed × Time = ' + s + ' × ' + t + ' = ' + (s * t) + ' km.' }; }
      ],
      [
        function () { var s = ri(30, 90), t = ri(2, 9), d = s * t; return { q: 'A bus covers ' + d + ' km in ' + t + ' hours. Find its speed in km/h.', a: s, unit: 'km/h', exp: 'Speed = Distance ÷ Time = ' + d + ' ÷ ' + t + ' = ' + s + ' km/h.' }; },
        function () { var s = 5 * ri(6, 18), t = ri(2, 9), d = s * t; return { q: 'How many hours will a train take to cover ' + d + ' km at ' + s + ' km/h?', a: t, unit: 'hours', exp: 'Time = Distance ÷ Speed = ' + d + ' ÷ ' + s + ' = ' + t + ' hours.' }; }
      ],
      [
        function () {
          var v = pick([36, 54, 72, 90, 108]), ms = v * 5 / 18, t = ri(5, 20), L = ms * t;
          return { q: 'A train ' + L + ' m long crosses a pole in ' + t + ' seconds. Find its speed in km/h.', a: v, unit: 'km/h', exp: 'Speed = ' + L + ' ÷ ' + t + ' = ' + ms + ' m/s. To convert m/s to km/h multiply by 18/5: ' + ms + ' × 18/5 = ' + v + ' km/h.' };
        },
        function () {
          var pr = pick([[40, 60], [30, 60], [60, 90], [20, 30], [30, 45], [50, 75], [10, 15]]), s1 = pr[0], s2 = pr[1], avg = 2 * s1 * s2 / (s1 + s2);
          return { q: 'A man goes from A to B at ' + s1 + ' km/h and returns at ' + s2 + ' km/h. Find his average speed for the whole journey in km/h.', a: avg, unit: 'km/h', exp: 'For equal distances, average speed = 2ab ÷ (a + b) = 2 × ' + s1 + ' × ' + s2 + ' ÷ (' + s1 + ' + ' + s2 + ') = ' + avg + ' km/h.' };
        }
      ]
    ],

    /* ===== Mensuration ===== */
    mensuration: [
      [
        function () { var l = ri(8, 30), b = ri(5, 20); return { q: 'A rectangle is ' + l + ' cm long and ' + b + ' cm wide. Find its area.', a: l * b, unit: 'cm²', exp: 'Area = length × width = ' + l + ' × ' + b + ' = ' + (l * b) + ' cm².' }; },
        function () { var l = ri(8, 30), b = ri(5, 20); return { q: 'A rectangle is ' + l + ' cm long and ' + b + ' cm wide. Find its perimeter.', a: 2 * (l + b), unit: 'cm', exp: 'Perimeter = 2 × (l + b) = 2 × (' + l + ' + ' + b + ') = ' + (2 * (l + b)) + ' cm.' }; },
        function () { var s = ri(5, 25); return { q: 'Find the area of a square of side ' + s + ' cm.', a: s * s, unit: 'cm²', exp: 'Area = side² = ' + s + ' × ' + s + ' = ' + (s * s) + ' cm².' }; }
      ],
      [
        function () { var k = ri(1, 4), r = 7 * k; return { q: 'Find the circumference of a circle of radius ' + r + ' cm. (Take π = 22/7)', a: 44 * k, unit: 'cm', exp: 'C = 2πr = 2 × 22/7 × ' + r + ' = ' + (44 * k) + ' cm.' }; },
        function () { var k = ri(1, 4), r = 7 * k; return { q: 'Find the area of a circle of radius ' + r + ' cm. (Take π = 22/7)', a: 154 * k * k, unit: 'cm²', exp: 'Area = πr² = 22/7 × ' + r + ' × ' + r + ' = ' + (154 * k * k) + ' cm².' }; },
        function () { var b = 2 * ri(3, 15), h = ri(4, 20); return { q: 'Find the area of a triangle with base ' + b + ' cm and height ' + h + ' cm.', a: b * h / 2, unit: 'cm²', exp: 'Area = ½ × base × height = ½ × ' + b + ' × ' + h + ' = ' + (b * h / 2) + ' cm².' }; }
      ],
      [
        function () { var r = pick([7, 14]), h = ri(5, 20), v = 22 * r * r * h / 7; return { q: 'Find the volume of a cylinder of radius ' + r + ' cm and height ' + h + ' cm. (Take π = 22/7)', a: v, unit: 'cm³', exp: 'V = πr²h = 22/7 × ' + r + ' × ' + r + ' × ' + h + ' = ' + v + ' cm³.' }; },
        function () {
          var l = ri(5, 15), b = ri(4, 12), h = ri(3, 10), s = 2 * (l * b + b * h + h * l);
          return { q: 'Find the total surface area of a cuboid of length ' + l + ' cm, breadth ' + b + ' cm and height ' + h + ' cm.', a: s, unit: 'cm²', exp: 'TSA = 2(lb + bh + hl) = 2(' + (l * b) + ' + ' + (b * h) + ' + ' + (h * l) + ') = ' + s + ' cm².' };
        },
        function () { var a = ri(3, 12), v = a * a * a; return { q: 'The volume of a cube is ' + v + ' cm³. Find its total surface area.', a: 6 * a * a, unit: 'cm²', exp: 'Side = cube root of ' + v + ' = ' + a + ' cm. TSA = 6a² = 6 × ' + (a * a) + ' = ' + (6 * a * a) + ' cm².' }; }
      ]
    ],

    /* ===== Algebra ===== */
    algebra: [
      [
        function () { var x = ri(5, 60), a = ri(3, 40); return { q: 'Solve for x: x + ' + a + ' = ' + (x + a), a: x, unit: '', exp: 'x = ' + (x + a) + ' − ' + a + ' = ' + x + '.' }; },
        function () { var x = ri(15, 80), a = ri(3, 14); return { q: 'Solve for x: x − ' + a + ' = ' + (x - a), a: x, unit: '', exp: 'x = ' + (x - a) + ' + ' + a + ' = ' + x + '.' }; },
        function () { var x = ri(3, 20), a = ri(2, 12); return { q: 'Solve for x: ' + a + 'x = ' + (a * x), a: x, unit: '', exp: 'x = ' + (a * x) + ' ÷ ' + a + ' = ' + x + '.' }; }
      ],
      [
        function () { var x = ri(2, 15), a = ri(2, 9), b = ri(1, 30); return { q: 'Solve for x: ' + a + 'x + ' + b + ' = ' + (a * x + b), a: x, unit: '', exp: a + 'x = ' + (a * x + b) + ' − ' + b + ' = ' + (a * x) + ', so x = ' + (a * x) + ' ÷ ' + a + ' = ' + x + '.' }; },
        function () { var x = ri(3, 15), a = ri(2, 9), b = ri(1, 20); return { q: 'Solve for x: ' + a + 'x − ' + b + ' = ' + (a * x - b), a: x, unit: '', exp: a + 'x = ' + (a * x - b) + ' + ' + b + ' = ' + (a * x) + ', so x = ' + x + '.' }; }
      ],
      [
        function () {
          var x = ri(2, 15), a = ri(4, 12), c = ri(1, a - 1), b = ri(1, 30), d = b + (a - c) * x;
          return { q: 'Solve for x: ' + a + 'x + ' + b + ' = ' + c + 'x + ' + d, a: x, unit: '', exp: 'Move the x terms to one side: ' + a + 'x − ' + c + 'x = ' + d + ' − ' + b + ', so ' + (a - c) + 'x = ' + (d - b) + ' and x = ' + x + '.' };
        },
        function () {
          var big = ri(30, 90), small = ri(5, big - 5), S = big + small, D = big - small;
          return { q: 'The sum of two numbers is ' + S + ' and their difference is ' + D + '. Find the larger number.', a: big, unit: '', exp: 'Larger number = (Sum + Difference) ÷ 2 = (' + S + ' + ' + D + ') ÷ 2 = ' + big + '.' };
        }
      ]
    ],

    /* ===== Average & Ratio ===== */
    avgratio: [
      [
        function () {
          var m, n1, n2, n3, n4, n5;
          do {
            m = ri(15, 60);
            n1 = m + ri(-12, 12); n2 = m + ri(-12, 12); n3 = m + ri(-12, 12); n4 = m + ri(-12, 12);
            n5 = 5 * m - (n1 + n2 + n3 + n4);
          } while (n5 < 1 || n5 > 110);
          return { q: 'Find the average of ' + n1 + ', ' + n2 + ', ' + n3 + ', ' + n4 + ' and ' + n5 + '.', a: m, unit: '', exp: 'Sum = ' + (5 * m) + '. Average = Sum ÷ 5 = ' + m + '.' };
        }
      ],
      [
        function () {
          var n = ri(4, 9), m1 = ri(15, 50), m2 = m1 + ri(1, 5), x = (n + 1) * m2 - n * m1;
          return { q: 'The average of ' + n + ' numbers is ' + m1 + '. When one more number is added, the average becomes ' + m2 + '. Find the number added.', a: x, unit: '', exp: 'New total = ' + (n + 1) + ' × ' + m2 + ' = ' + ((n + 1) * m2) + '. Old total = ' + n + ' × ' + m1 + ' = ' + (n * m1) + '. Added number = ' + ((n + 1) * m2) + ' − ' + (n * m1) + ' = ' + x + '.' };
        }
      ],
      [
        function () {
          var pr = coprimePair(2, 9), a = pr[0], b = pr[1], k = ri(5, 60) * 10, T = (a + b) * k, big = Math.max(a, b);
          return { q: '₹' + T + ' is divided between A and B in the ratio ' + a + ' : ' + b + '. Find the larger share.', a: big * k, unit: 'rupees', exp: 'Total parts = ' + a + ' + ' + b + ' = ' + (a + b) + '. One part = ' + T + ' ÷ ' + (a + b) + ' = ' + k + '. Larger share = ' + big + ' × ' + k + ' = ' + (big * k) + '.' };
        }
      ]
    ],

    /* ===== LCM & HCF ===== */
    lcmhcf: [
      [
        function () {
          var g = ri(2, 12), pr = coprimePair(2, 9), x = g * pr[0], y = g * pr[1];
          return { q: 'Find the HCF of ' + x + ' and ' + y + '.', a: g, unit: '', exp: x + ' = ' + g + ' × ' + pr[0] + ' and ' + y + ' = ' + g + ' × ' + pr[1] + '. The greatest common factor is ' + g + '.' };
        }
      ],
      [
        function () {
          var g = ri(2, 9), pr = coprimePair(2, 9), x = g * pr[0], y = g * pr[1], l = g * pr[0] * pr[1];
          return { q: 'Find the LCM of ' + x + ' and ' + y + '.', a: l, unit: '', exp: 'HCF = ' + g + '. LCM = (' + x + ' × ' + y + ') ÷ HCF = ' + (x * y) + ' ÷ ' + g + ' = ' + l + '.' };
        }
      ],
      [
        function () {
          var g = ri(3, 12), pr = coprimePair(2, 9), x = g * pr[0], y = g * pr[1], l = g * pr[0] * pr[1];
          return { q: 'The HCF of two numbers is ' + g + ' and their LCM is ' + l + '. If one number is ' + x + ', find the other number.', a: y, unit: '', exp: 'HCF × LCM = product of the two numbers. Other number = (' + g + ' × ' + l + ') ÷ ' + x + ' = ' + y + '.' };
        }
      ]
    ]
  };

  /* ---------- topic list shown on the home screen ---------- */
  var TOPICS = [
    { id: 'arith',       name: 'Arithmetic',            hint: 'add, multiply, BODMAS' },
    { id: 'percent',     name: 'Percentage',            hint: 'finding %, increase and decrease' },
    { id: 'profit',      name: 'Profit & Loss',         hint: 'CP, SP, discount' },
    { id: 'si',          name: 'Simple Interest',       hint: 'interest, amount, rate' },
    { id: 'speed',       name: 'Speed, Distance, Time', hint: 'speed, distance, time' },
    { id: 'mensuration', name: 'Mensuration',           hint: 'area, perimeter, volume' },
    { id: 'algebra',     name: 'Algebra',               hint: 'finding the value of x' },
    { id: 'avgratio',    name: 'Average & Ratio',       hint: 'averages and ratios' },
    { id: 'lcmhcf',      name: 'LCM & HCF',             hint: 'LCM and HCF problems' }
  ];

  var DIFFS  = [{ v: '0', t: 'Easy' }, { v: '1', t: 'Medium' }, { v: '2', t: 'Hard' }, { v: 'mix', t: 'Mixed' }];
  var COUNTS = [{ v: '5', t: '5' }, { v: '10', t: '10' }, { v: '15', t: '15' }, { v: '20', t: '20' }];
  var TIMES  = [{ v: '0', t: 'No timer' }, { v: '30', t: '30 sec' }, { v: '60', t: '60 sec' }, { v: '90', t: '90 sec' }];

  global.QuizData = {
    G: G, TOPICS: TOPICS, DIFFS: DIFFS, COUNTS: COUNTS, TIMES: TIMES,
    ri: ri, pick: pick, shuffle: shuffle
  };
})(typeof window !== 'undefined' ? window : globalThis);
