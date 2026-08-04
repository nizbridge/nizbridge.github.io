const words = [
  { english: 'absolute', korean: '절대적인, 완전한' },
  { english: 'baggage', korean: '수하물' },
  { english: 'cage', korean: '우리, 새장' },
  { english: 'generation', korean: '세대, 발생' },
  { english: 'eastern', korean: '동쪽의' },
  { english: 'fade', korean: '바래다, 희미해지다, 서서히 사라지다' },
  { english: 'gap', korean: '틈, 공백, 차이' },
  { english: 'handkerchief', korean: '손수건' },
  { english: 'scene', korean: '장면, 현장, 경치' },
  { english: 'crime', korean: '죄, 범죄' },
  { english: 'lack', korean: '부족, 결핍; 부족하다, 결핍되다' },
  { english: 'maintenance', korean: '유지, 보수' },
  { english: 'nasty', korean: '더러운, 불쾌한' },
  { english: 'odd', korean: '이상한, 기묘한, 홀수의' },
  { english: 'pack', korean: '짐을 싸다, 꾸러미' },
  { english: 'raincoat', korean: '비옷' },
  { english: 'tap', korean: '톡톡 두드리다, 수도꼭지, 마개' },
  { english: 'underground', korean: '지하의, 지하에, 지하로' },
  { english: 'vague', korean: '모호한, 불확실한' },
  { english: 'highly', korean: '매우' },
  { english: 'abuse', korean: '남용, 학대; 남용하다, 학대하다' },
  { english: 'bait', korean: '미끼' },
  { english: 'calculate', korean: '계산하다' },
  { english: 'target', korean: '목표, 과녁' },
  { english: 'economic', korean: '경제의' },
  { english: 'identify', korean: '신원을 확인하다, 동일시하다' },
  { english: 'package', korean: '꾸러미, 소포' },
  { english: 'breast', korean: '가슴' },
  { english: 'trail', korean: '오솔길, 자취, 흔적' },
  { english: 'sacrifice', korean: '희생; 희생하다, 희생시키다' },
];

const els = {
  quiz: document.querySelector('#quiz-view'), result: document.querySelector('#result-view'),
  progress: document.querySelector('#progress'), meter: document.querySelector('#meter-fill'),
  type: document.querySelector('#question-type'), prompt: document.querySelector('#prompt'),
  form: document.querySelector('#answer-form'), answer: document.querySelector('#answer'),
  feedback: document.querySelector('#feedback'), score: document.querySelector('#score'),
  copy: document.querySelector('#result-copy'), review: document.querySelector('#review'),
  restart: document.querySelector('#restart'), footer: document.querySelector('.footer-note'),
};

let questions = [], current = 0, results = [], answered = false;
const shuffle = (items) => [...items].sort(() => Math.random() - .5);
const normal = (value) => value.trim().toLowerCase().replace(/[.?!]/g, '');
const meaningAnswers = (meaning) => meaning.split(/[,;·/]/).map(normal).filter(Boolean);
const escapeHtml = (value) => value.replace(/[&<>'"]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#039;', '"': '&quot;' })[char]);

function start() {
  questions = shuffle(words).map(word => ({ ...word, askEnglish: Math.random() < .5 }));
  current = 0; results = []; answered = false;
  els.footer.textContent = `오늘의 단어 · ${words.length}개`;
  els.result.hidden = true; els.quiz.hidden = false;
  showQuestion();
}

function showQuestion() {
  const q = questions[current], isEnglish = q.askEnglish;
  els.progress.innerHTML = `${String(current + 1).padStart(2, '0')} <i></i> ${String(questions.length).padStart(2, '0')}`;
  els.meter.style.width = `${((current + 1) / questions.length) * 100}%`;
  els.type.textContent = isEnglish ? '영어 단어를 보고 뜻을 입력하세요' : '뜻을 보고 영어 단어를 입력하세요';
  els.prompt.textContent = isEnglish ? q.english : q.korean;
  answered = false;
  els.answer.value = ''; els.answer.className = ''; els.answer.disabled = false;
  els.feedback.textContent = ''; els.feedback.className = 'feedback';
  els.form.querySelector('button').innerHTML = '정답 확인 <span>↵</span>';
  els.answer.placeholder = isEnglish ? '뜻을 입력하세요' : '영어 단어를 입력하세요';
  els.answer.focus();
}

els.form.addEventListener('submit', (event) => {
  event.preventDefault();
  if (answered) {
    current += 1;
    current < questions.length ? showQuestion() : showResults();
    return;
  }
  const q = questions[current], input = normal(els.answer.value);
  if (!input) { els.answer.focus(); return; }
  const expected = q.askEnglish ? q.korean : q.english;
  const correct = q.askEnglish ? meaningAnswers(q.korean).includes(input) : input === normal(q.english);
  results.push({ ...q, correct, expected, answer: els.answer.value.trim() });
  answered = true;
  els.answer.disabled = true;
  els.answer.className = correct ? 'correct' : 'wrong';
  els.feedback.className = `feedback ${correct ? 'good' : 'bad'}`;
  els.feedback.textContent = correct ? '정답이에요!' : `정답: ${expected}`;
  const submitButton = els.form.querySelector('button');
  submitButton.innerHTML = current === questions.length - 1 ? '결과 보기 <span>→</span>' : '다음 문제 <span>→</span>';
  submitButton.focus();
});

function showResults() {
  const correct = results.filter(item => item.correct).length;
  els.quiz.hidden = true; els.result.hidden = false; els.score.textContent = correct;
  document.querySelector('.score span').textContent = `/ ${questions.length}`;
  els.copy.textContent = correct === questions.length ? '완벽해요. 모든 단어를 맞혔습니다!' : `총 ${questions.length}개 중 ${correct}개를 맞혔어요.`;
  els.review.innerHTML = results.map(item => `<div class="review-item"><span><b>${item.english}</b> · ${item.korean}<small>입력한 답: ${escapeHtml(item.answer)}</small></span><span class="mark ${item.correct ? '' : 'fail'}">${item.correct ? '정답' : '오답'}</span></div>`).join('');
}

els.restart.addEventListener('click', start);
start();
