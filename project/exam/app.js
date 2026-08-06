const lessons = [
  { id: 'lesson2', title: 'Lesson 2', subtitle: '단어 30개', words: [
    ['absolute','절대적인, 완전한'], ['baggage','수하물'], ['cage','우리, 새장'], ['generation','세대, 발생'], ['eastern','동쪽의'], ['fade','바래다, 희미해지다, 서서히 사라지다'], ['gap','(공간적) 틈, (시간적) 공백, (의견 등의) 차이'], ['handkerchief','손수건'], ['scene','장면, 현장, 경치'], ['crime','죄, 범죄'], ['lack','부족, 결핍; 부족하다, 결핍되다'], ['maintenance','유지, 보수'], ['nasty','더러운, 불쾌한'], ['odd','이상한, 기묘한, 홀수의'], ['pack','(짐을) 싸다, 꾸러미'], ['raincoat','비옷'], ['tap','톡톡 두드리다, 수도꼭지, 마개'], ['underground','지하의, 지하에, 지하로'], ['vague','모호한, 불확실한'], ['highly','매우'], ['abuse','남용, 학대; 남용하다, 학대하다'], ['bait','미끼'], ['calculate','계산하다'], ['target','목표, 과녁'], ['economic','경제의'], ['identify','(신원을) 확인하다, 동일시하다'], ['package','꾸러미, 소포'], ['breast','가슴'], ['trail','오솔길, 자취, 흔적'], ['sacrifice','희생; 희생하다, 희생시키다']
  ].map(([english, korean, accepted]) => ({ english, korean, accepted })) },
  { id: 'lesson3', title: 'Lesson 3', subtitle: '단어 30개', words: [
    ['academic', '학업의, 학구적인'],
    ['democratic', '민주주의의'],
    ['crisis', '위기'],
    ['deadly', '치명적인'],
    ['marine', '바다의, 해양의'],
    ['failure', '실패, 고장'],
    ['discriminate', '구별하다, 차별하다'],
    ['hardware', '철물'],
    ['tease', '놀리다'],
    ['jealous', '질투심이 많은'],
    ['government', '정부'],
    ['landscape', '풍경'],
    ['mankind', '인류, 인간'],
    ['nearby', '근처에'],
    ['official', '공식적인, 공무상의, 공무원, 관리'],
    ['beverage', '음료'],
    ['quantity', '양, 수량'],
    ['arrogant', '거만한'],
    ['safety', '안전'],
    ['tax', '세금'],
    ['weaken', '약하게 하다, 약해지다'],
    ['yell', '고함치다, 고함, 비명'],
    ['acceptable', '받아들일 만한, 허용할 수 있는'],
    ['cancel', '취소하다'],
    ['cancer', '암'],
    ['salary', '봉급, 급여'],
    ['suspect', '의심하다, 용의자'],
    ['identity', '신원, 정체성, 동질감'],
    ['vain', '헛된, 허영심이 많은'],
    ['underline', '밑줄을 긋다, 강조하다'],
  ].map(([english, korean]) => ({ english, korean })) },
  { id: 'lesson4', title: 'Lesson 4', subtitle: '단어 30개', words: [
    ['balance', '균형, 균형을 유지하다'],
    ['punish', '벌주다, 처벌하다'],
    ['death', '죽음'],
    ['edit', '편집하다'],
    ['faint', '희미한, 어지러운, 기절하다'],
    ['generate', '발생시키다'],
    ['harsh', '가혹한'],
    ['ideology', '이데올로기, 이념'],
    ['jewel', '보석'],
    ['cherish', '소중히 여기다'],
    ['latter', '후자의, 후반의, 후자'],
    ['manual', '손으로 하는, 육체 노동의, 설명서'],
    ['nearly', '거의'],
    ['omit', '생략하다, 빠뜨리다'],
    ['pale', '창백한, 엷은, 연한'],
    ['quarrel', '말다툼, 말다툼을 하다, 싸우다'],
    ['random', '무작위의, 임의로 하는'],
    ['sale', '판매, 판매액'],
    ['technical', '기술적인, 전문적인'],
    ['prey', '먹이'],
    ['valuable', '귀중한'],
    ['weave', '짜다, 엮다'],
    ['accommodate', '숙박처를 제공하다, 수용하다'],
    ['bald', '대머리의'],
    ['performance', '공연, 연주회, 수행, 성과'],
    ['celebrity', '유명 인사, 연예인'],
    ['conclusion', '결론'],
    ['kneel', '무릎을 꿇다'],
    ['capable', '~할 수 있는, 유능한'],
    ['access', '(to) 접근'],
  ].map(([english, korean]) => ({ english, korean })) },
];
const $ = selector => document.querySelector(selector);
const els = { home: $('#home-view'), vocabulary: $('#vocabulary-view'), quiz: $('#quiz-view'), result: $('#result-view'), lessonList: $('#lesson-list'), vocabularyTabs: $('#vocabulary-tabs'), wordList: $('#word-list'), start: $('#start-button'), footer: $('#footer-note'), progress: $('.progress'), meter: $('#meter-fill'), type: $('#question-type'), prompt: $('#prompt'), form: $('#answer-form'), answer: $('#answer'), feedback: $('#feedback'), score: $('#score'), copy: $('#result-copy'), review: $('#review'), restart: $('#restart') };
let selected = new Set(), questions = [], current = 0, results = [], answered = false, vocabularyLessonId = 'lesson2';
const normal = value => value.trim().toLowerCase().replace(/\s+/g, '').replace(/[.?!~]/g, '');
const shuffle = values => [...values].sort(() => Math.random() - .5);
const meaningAnswers = word => [...word.korean.split(/[,;·/]/), ...(word.accepted?.split('|') || [])]
  .flatMap(term => {
    const inside = [...term.matchAll(/\(([^)]+)\)/g)].map(match => match[1].replace(/^[=↔]\s*/, '').trim());
    const optionalPrefix = term.match(/^\(([^)]+)\)\s*([^()↔]+)/);
    return [term, term.replace(/\s*\([^)]*\)/g, ''), term.replace(/[()]/g, ''), optionalPrefix ? `${optionalPrefix[1]} ${optionalPrefix[2]}` : '', ...inside];
  }).map(normal).filter(Boolean);
const escapeHtml = value => value.replace(/[&<>'"]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#039;', '"': '&quot;' })[char]);

function switchView(name) { Object.entries({ home: els.home, vocabulary: els.vocabulary, quiz: els.quiz, result: els.result }).forEach(([key, view]) => view.hidden = key !== name); document.querySelectorAll('.nav-button').forEach(button => button.classList.toggle('active', button.dataset.view === name)); }
function renderLessons() { els.lessonList.innerHTML = lessons.map(lesson => `<label class="lesson ${lesson.words.length ? '' : 'unavailable'}"><input type="checkbox" value="${lesson.id}" ${lesson.words.length ? '' : 'disabled'} /><span><b>${lesson.title}</b><small>${lesson.subtitle}</small></span><i>✓</i></label>`).join(''); }
function renderVocabulary() { const lesson = lessons.find(item => item.id === vocabularyLessonId); els.vocabularyTabs.innerHTML = lessons.map(item => `<button class="vocabulary-tab ${item.id === vocabularyLessonId ? 'active' : ''}" data-vocabulary-lesson="${item.id}">${item.title}<small>${item.words.length}</small></button>`).join(''); els.wordList.innerHTML = lesson.words.map(word => `<div class="word-row"><b>${word.english}</b><span>${word.korean}</span></div>`).join(''); }
function updateSelection() { selected = new Set([...document.querySelectorAll('.lesson input:checked')].map(input => input.value)); const count = lessons.filter(lesson => selected.has(lesson.id)).flatMap(lesson => lesson.words).length; els.start.disabled = !count; els.footer.textContent = count ? `선택한 단어 · ${count}개` : 'Lesson을 선택해 주세요'; }
function start() { const chosen = lessons.filter(lesson => selected.has(lesson.id)).flatMap(lesson => lesson.words); questions = shuffle(chosen).map(word => ({ ...word, askEnglish: Math.random() < .5 })); current = 0; results = []; switchView('quiz'); showQuestion(); }
function showQuestion() { const q = questions[current]; $('.topline').querySelector('nav').innerHTML = `<span class="progress">${String(current + 1).padStart(2, '0')} <i></i> ${String(questions.length).padStart(2, '0')}</span>`; els.meter.style.width = `${((current + 1) / questions.length) * 100}%`; els.type.textContent = q.askEnglish ? '영어 단어를 보고 뜻을 입력하세요' : '뜻을 보고 영어 단어를 입력하세요'; els.prompt.textContent = q.askEnglish ? q.english : q.korean; answered = false; els.answer.value = ''; els.answer.disabled = false; els.answer.className = ''; els.answer.placeholder = q.askEnglish ? '뜻을 입력하세요' : '영어 단어를 입력하세요'; els.feedback.textContent = ''; els.feedback.className = 'feedback'; els.form.querySelector('button').innerHTML = '정답 확인 <span>↵</span>'; els.answer.focus(); }
els.form.addEventListener('submit', event => { event.preventDefault(); if (answered) { current += 1; current < questions.length ? showQuestion() : showResults(); return; } const q = questions[current], input = normal(els.answer.value); if (!input) return; const expected = q.askEnglish ? q.korean : q.english; const correct = q.askEnglish ? meaningAnswers(q).includes(input) : input === normal(q.english); results.push({ ...q, correct, expected, answer: els.answer.value.trim() }); answered = true; els.answer.disabled = true; els.answer.className = correct ? 'correct' : 'wrong'; els.feedback.className = `feedback ${correct ? 'good' : 'bad'}`; els.feedback.textContent = correct ? '정답이에요!' : `정답: ${expected}`; const button = els.form.querySelector('button'); button.innerHTML = current === questions.length - 1 ? '결과 보기 <span>→</span>' : '다음 문제 <span>→</span>'; button.focus(); });
function showResults() { const correct = results.filter(item => item.correct).length; switchView('result'); els.score.textContent = correct; $('.score span').textContent = `/ ${questions.length}`; els.copy.textContent = `총 ${questions.length}개 중 ${correct}개를 맞혔어요.`; els.review.innerHTML = results.map(item => `<div class="review-item"><span><b>${item.english}</b> · ${item.korean}<small>입력한 답: ${escapeHtml(item.answer)}</small></span><span class="mark ${item.correct ? '' : 'fail'}">${item.correct ? '정답' : '오답'}</span></div>`).join(''); }
function goHome() { $('.topline nav').innerHTML = '<button class="nav-button active" data-view="home">레슨</button><button class="nav-button" data-view="vocabulary">단어장</button>'; switchView('home'); }
document.addEventListener('change', event => { if (event.target.matches('.lesson input')) updateSelection(); });
document.addEventListener('click', event => { const vocabularyTab = event.target.closest('[data-vocabulary-lesson]'); if (vocabularyTab) { vocabularyLessonId = vocabularyTab.dataset.vocabularyLesson; renderVocabulary(); return; } const button = event.target.closest('[data-view]'); if (button) { switchView(button.dataset.view); if (button.dataset.view === 'vocabulary') renderVocabulary(); } });
$('#home-button').addEventListener('click', goHome); els.start.addEventListener('click', start); els.restart.addEventListener('click', goHome); renderLessons(); updateSelection();
