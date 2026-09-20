# Numerical Quiz

A simple website for practising math numerical problems. Every quiz uses freshly generated random questions, so you never get the same paper twice.

## How to run

1. Unzip the folder.
2. Double-click `index.html` to open it in any modern browser (Chrome, Edge, Firefox, Safari).

No installation, server or internet connection is required. Only the fonts (Kalam and Hind) are loaded from Google Fonts; offline, the page falls back to system fonts.

## Features

- 9 topics: Arithmetic, Percentage, Profit & Loss, Simple Interest, Speed-Distance-Time, Mensuration, Algebra, Average & Ratio, LCM & HCF
- 3 levels (Easy, Medium, Hard) plus a Mixed mode
- 5, 10, 15 or 20 questions per quiz
- Optional timer per question (30, 60 or 90 seconds)
- Points: 10 per correct answer, plus a streak bonus and a speed bonus
- Step-by-step explanation after every question
- Result screen with accuracy, points, best streak, total time and a full review
- Light and dark mode
- Settings and best score are saved in the browser (localStorage)
- Works on phones, tablets and desktops

## Project structure

```
math-numerical-quiz/
├── index.html        Page structure (home, quiz and result screens)
├── css/
│   └── style.css     All styling, including light and dark themes
├── js/
│   ├── questions.js  Question generators, topics, levels and options
│   └── app.js        Quiz logic: timer, scoring, screens, review, theme
└── README.md
```

## Adding your own questions

Open `js/questions.js`. Each topic in `G` has three arrays, one for each level (Easy, Medium, Hard). Add a function to any array. It must return an object like this:

```js
function () {
  var a = ri(10, 99), b = ri(10, 99);
  return {
    q: 'Find: ' + a + ' + ' + b,          // question text
    a: a + b,                             // correct answer (a number)
    unit: '',                             // unit shown next to the answer box
    exp: a + ' + ' + b + ' = ' + (a + b)  // explanation shown after answering
  };
}
```

Helpers you can use: `ri(min, max)` for a random integer and `pick([..])` for a random item from a list.

To add a whole new topic, add a new key to `G` (with three difficulty arrays) and a matching entry in the `TOPICS` list in the same file.

## Tips

- Answers are checked with a small tolerance, so `48`, `48.0` and `48 km/h` are all accepted. Commas and the ₹ or % signs are ignored.
- Press Enter to check your answer, and press Enter again to go to the next question.
