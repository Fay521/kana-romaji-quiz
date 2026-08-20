// ===== 状态 =====
let curScript='hiragana', selRows=new Set(['a','ka','sa','ta','na','ha','ma','ya','ra','wa']);
let questions=[], curIdx=0, correct=0, wrong=0, curMistakes=[], answered=false, curKana=null;
let practiceMode=false, mastered=0;

// ===== localStorage 错题本 =====
const BK='kana_mistake_v1';
function loadBook(){try{const d=localStorage.getItem(BK);return d?JSON.parse(d):{}}catch(e){return{}}}
function saveBook(b){try{localStorage.setItem(BK,JSON.stringify(b))}catch(e){}}
function getBookList(){
  const book=loadBook();
  return Object.values(book).sort((a,b)=>b.wrongCount-a.wrongCount||b.lastTime-a.lastTime);
}
function getBookCount(){return Object.keys(loadBook()).length}

function addMistake(char,type,answers){
  const book=loadBook(),key=char+'_'+type;
  if(!book[key]) book[key]={char,type,answers,wrongCount:0,streak:0,lastTime:0};
  book[key].wrongCount++;
  book[key].streak=0;
  book[key].lastTime=Date.now();
  book[key].answers=answers;
  saveBook(book);
  updateBookBadge();
}
function recordCorrect(char,type){
  const book=loadBook(),key=char+'_'+type;
  if(book[key]){
    book[key].streak++;
    if(book[key].streak>=3){delete book[key];saveBook(book);updateBookBadge();return true;}
    saveBook(book);
  }
  return false;
}
function removeMistake(char,type){const book=loadBook();delete book[char+'_'+type];saveBook(book);updateBookBadge();}
function clearBook(){localStorage.removeItem(BK);updateBookBadge();}

function updateBookBadge(){
  const n=getBookCount();
  document.getElementById('bookCountBadge').textContent=n;
}

function timeAgo(ts){
  if(!ts)return'';
  const d=Date.now()-ts,m=Math.floor(d/60000),h=Math.floor(d/3600000),dy=Math.floor(d/86400000);
  if(m<1)return'刚刚';if(m<60)return m+'分钟前';if(h<24)return h+'小时前';if(dy<30)return dy+'天前';
  return new Date(ts).toLocaleDateString('zh-CN');
}

function streakDots(s){let o='';for(let i=0;i<3;i++)o+='<span class="streak-dot'+(i<s?' filled':'')+'"></span>';return o;}

// ===== 屏幕切换 =====
function showScreen(id){
  ['setupScreen','testScreen','resultScreen','mistakeBookScreen','chartScreen'].forEach(s=>document.getElementById(s).classList.add('hidden'));
  document.getElementById(id).classList.remove('hidden');
}
function goSetup(){showScreen('setupScreen');updateBookBadge();}

// ===== 设置界面 =====
function makeRowItem(id,name,pv){
  const item=document.createElement('div');
  item.className='row-item'+(selRows.has(id)?' selected':'');
  item.dataset.row=id;
  item.innerHTML='<div class="row-check">✓</div><div class="row-label">'+name+'<small>'+pv+'</small></div>';
  item.addEventListener('click',()=>{
    item.classList.toggle('selected');
    if(item.classList.contains('selected'))selRows.add(id);else selRows.delete(id);
  });
  return item;
}

function initSetup(){
  document.querySelectorAll('#scriptToggle button').forEach(btn=>{
    btn.addEventListener('click',()=>{
      document.querySelectorAll('#scriptToggle button').forEach(b=>b.classList.remove('active'));
      btn.classList.add('active');curScript=btn.dataset.script;
    });
  });
  // 清音
  const grid=document.getElementById('rowGrid');grid.innerHTML='';
  RI.filter(r=>SEION_ROWS.includes(r.id)).forEach(r=>grid.appendChild(makeRowItem(r.id,r.name,r.pv)));
  // 浊音・半浊音
  const dGrid=document.getElementById('dakuonRowGrid');dGrid.innerHTML='';
  RI.filter(r=>DAKUON_ROWS.concat(HANDAKUON_ROWS).includes(r.id)).forEach(r=>dGrid.appendChild(makeRowItem(r.id,r.name,r.pv)));
  // 拗音
  const yGrid=document.getElementById('youonRowGrid');yGrid.innerHTML='';
  YOUN_ROWS.forEach(r=>yGrid.appendChild(makeRowItem(r.id,r.name,r.pv)));
  updateBookBadge();
}
function selectAll(on){
  document.querySelectorAll('.row-item').forEach(item=>{
    if(on){item.classList.add('selected');selRows.add(item.dataset.row);}
    else{item.classList.remove('selected');selRows.delete(item.dataset.row);}
  });
}

// ===== 测试逻辑 =====
function startTest(){
  if(selRows.size===0){alert('请至少选择一行！');return;}
  questions=[];
  KD.filter(k=>selRows.has(k.r)).forEach(k=>{
    if(curScript==='hiragana'||curScript==='both') questions.push({char:k.h,type:'hiragana',answers:k.a});
    if(curScript==='katakana'||curScript==='both') questions.push({char:k.k,type:'katakana',answers:k.a});
  });
  // 拗音
  const leadToRow={};YOUN_ROWS.forEach(r=>leadToRow[r.lead]=r.id);
  YOUON.forEach(y=>{
    const rowId=leadToRow[y.h[0]];
    if(!selRows.has(rowId))return;
    if(curScript==='hiragana'||curScript==='both') questions.push({char:y.h,type:'hiragana',answers:y.a});
    if(curScript==='katakana'||curScript==='both') questions.push({char:y.k,type:'katakana',answers:y.a});
  });
  shuffle(questions);
  curIdx=0;correct=0;wrong=0;curMistakes=[];answered=false;practiceMode=false;mastered=0;
  document.getElementById('masteredWrap').classList.add('hidden');
  document.getElementById('correctCount').textContent=0;
  document.getElementById('wrongCount').textContent=0;
  showScreen('testScreen');showQ();
}

function startMistakePractice(){
  const list=getBookList();
  if(list.length===0){alert('错题本是空的！');return;}
  questions=list.map(m=>({char:m.char,type:m.type,answers:m.answers}));
  shuffle(questions);
  curIdx=0;correct=0;wrong=0;curMistakes=[];answered=false;practiceMode=true;mastered=0;
  document.getElementById('masteredWrap').classList.remove('hidden');
  document.getElementById('masteredCount').textContent=0;
  document.getElementById('correctCount').textContent=0;
  document.getElementById('wrongCount').textContent=0;
  showScreen('testScreen');showQ();
}

function shuffle(a){for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}}

function showQ(){
  if(curIdx>=questions.length){showResults();return;}
  answered=false;curKana=questions[curIdx];
  document.getElementById('kanaDisplay').textContent=curKana.char;
  const badge=document.getElementById('kanaTypeBadge');
  if(practiceMode){
    badge.textContent='错题练习';badge.className='kana-type-badge badge-practice';
  }else{
    badge.textContent=curKana.type==='hiragana'?'ひらがな':'カタカナ';
    badge.className='kana-type-badge '+(curKana.type==='hiragana'?'badge-hira':'badge-kata');
  }
  const input=document.getElementById('romajiInput');
  input.value='';input.className='';input.disabled=false;input.focus();
  document.getElementById('feedback').textContent='';
  document.getElementById('feedback').className='feedback';
  document.getElementById('nextBtn').classList.add('hidden');
  updateProg();
}

function checkAnswer(){
  if(answered)return;
  const input=document.getElementById('romajiInput');
  const ans=input.value.trim().toLowerCase();
  if(!ans)return;
  answered=true;input.disabled=true;
  const ok=curKana.answers.includes(ans);
  const fb=document.getElementById('feedback');

  if(ok){
    correct++;input.className='correct';
    if(practiceMode){
      const wasMastered=recordCorrect(curKana.char,curKana.type);
      if(wasMastered){
        mastered++;
        document.getElementById('masteredCount').textContent=mastered;
        fb.textContent='⭕ 正确！🎉 已掌握，已移出错题本！';fb.className='feedback correct';
      }else{
        fb.textContent='⭕ 正确！继续加油！';fb.className='feedback correct';
      }
    }else{
      fb.textContent='⭕ 正确！';fb.className='feedback correct';
    }
  }else{
    wrong++;input.className='wrong';
    fb.textContent='❌ 错误… 正确答案: '+curKana.answers[0];fb.className='feedback wrong';
    addMistake(curKana.char,curKana.type,curKana.answers);
    if(practiceMode){
      questions.push({char:curKana.char,type:curKana.type,answers:curKana.answers});
    }
    curMistakes.push({char:curKana.char,type:curKana.type,userAnswer:ans,correctAnswer:curKana.answers[0],allAnswers:curKana.answers});
  }
  document.getElementById('correctCount').textContent=correct;
  document.getElementById('wrongCount').textContent=wrong;
  document.getElementById('nextBtn').classList.remove('hidden');
  document.getElementById('nextBtn').focus();
}

function nextQuestion(){curIdx++;showQ();}
function skipQuestion(){
  if(!answered){
    wrong++;curMistakes.push({char:curKana.char,type:curKana.type,userAnswer:'（跳过）',correctAnswer:curKana.answers[0],allAnswers:curKana.answers});
    if(practiceMode) questions.push({char:curKana.char,type:curKana.type,answers:curKana.answers});
    document.getElementById('wrongCount').textContent=wrong;
  }
  curIdx++;showQ();
}
function updateProg(){
  const t=questions.length;
  document.getElementById('progressFill').style.width=(t>0?curIdx/t*100:0)+'%';
  document.getElementById('progressText').textContent=(curIdx+1)+' / '+t;
}
function endTest(){if(confirm('确定要结束测试吗？'))showResults();}

// ===== 结果 =====
function showResults(){
  showScreen('resultScreen');
  const total=correct+wrong;
  const pct=total>0?Math.round(correct/total*100):0;
  document.getElementById('resultTitle').textContent=practiceMode?'错题练习结果':'测试结果';
  document.getElementById('resultScore').textContent=pct+'%';
  document.getElementById('resultScore').style.color=pct>=80?'var(--success)':pct>=50?'#f39c12':'var(--danger)';

  let label;
  if(practiceMode){
    label=pct===100?'🎉 全部正确！':pct>=80?'😊 做得很好！':pct>=50?'📈 继续加油！':'💪 别灰心，再来一次！';
    if(mastered>0) label+=' 已掌握 '+mastered+' 个！';
  }else{
    label=pct===100?'🎉 完美！太棒了！':pct>=80?'😊 做得很好！继续加油！':pct>=50?'📈 还不错，再接再厉！':'💪 多多练习，你一定行！';
  }
  document.getElementById('resultLabel').textContent=label;
  document.getElementById('resCorrect').textContent=correct;
  document.getElementById('resWrong').textContent=wrong;
  document.getElementById('resTotal').textContent=total;

  const sec=document.getElementById('mistakesSection'),list=document.getElementById('mistakeList');
  list.innerHTML='';
  if(curMistakes.length>0){
    sec.classList.remove('hidden');
    curMistakes.forEach(m=>{
      const d=document.createElement('div');d.className='mistake-item';
      d.innerHTML='<div class="mk-char">'+m.char+'</div><div class="mk-info"><div>你的回答: <strong>'+m.userAnswer+'</strong></div><div>正确答案: <strong>'+m.correctAnswer+'</strong>'+(m.allAnswers.length>1?' <small>('+m.allAnswers.join(' / ')+')</small>':'')+'</div><div><small>'+(m.type==='hiragana'?'ひらがな':'カタカナ')+'</small></div></div>';
      list.appendChild(d);
    });
  }else{sec.classList.add('hidden');}

  const pb=document.getElementById('resPracticeBtn');
  if(getBookCount()>0){pb.classList.remove('hidden');pb.textContent='📚 练习错题 ('+getBookCount()+')';}
  else pb.classList.add('hidden');
}

function restartSame(){
  shuffle(questions);curIdx=0;correct=0;wrong=0;curMistakes=[];answered=false;mastered=0;
  if(practiceMode){document.getElementById('masteredCount').textContent=0;}
  document.getElementById('correctCount').textContent=0;document.getElementById('wrongCount').textContent=0;
  showScreen('testScreen');showQ();
}

// ===== 错题本界面 =====
function openMistakeBook(){
  showScreen('mistakeBookScreen');
  renderBookList();
}
function renderBookList(){
  const list=getBookList();
  const container=document.getElementById('bookList');
  const stats=document.getElementById('bookStats');
  const btn=document.getElementById('bookPracticeBtn');

  stats.innerHTML='共 <span>'+list.length+'</span> 道错题';

  if(list.length===0){
    container.innerHTML='<div class="book-empty"><div class="empty-icon">🎉</div>错题本是空的，太棒了！</div>';
    btn.style.display='none';return;
  }
  btn.style.display='';

  container.innerHTML='';
  list.forEach(m=>{
    const d=document.createElement('div');d.className='book-item';
    const typeTag=m.type==='hiragana'?'<span class="tag tag-hira">ひらがな</span>':'<span class="tag tag-kata">カタカナ</span>';
    d.innerHTML=
      '<div class="bi-char">'+m.char+'</div>'+
      '<div class="bi-info">'+
        '<div class="bi-romaji">'+m.answers.join(' / ')+'</div>'+
        '<div class="bi-meta">'+
          typeTag+
          '<span>错误 '+m.wrongCount+' 次</span>'+
          '<span>掌握进度 <span class="streak-dots">'+streakDots(m.streak)+'</span></span>'+
          '<span>'+timeAgo(m.lastTime)+'</span>'+
        '</div>'+
      '</div>'+
      '<button class="bi-remove" title="移除">✕</button>';
    d.querySelector('.bi-remove').addEventListener('click',(e)=>{
      e.stopPropagation();
      if(confirm('确定移除 '+m.char+' ('+m.answers[0]+') ？')){
        removeMistake(m.char,m.type);renderBookList();
      }
    });
    container.appendChild(d);
  });
}
function clearAllMistakes(){
  if(confirm('确定要清空整个错题本吗？此操作不可撤销！')){clearBook();renderBookList();}
}

// ===== 五十音一览 =====
// 平/片假名 -> KD 条目查找（用于取罗马字与另一种写法）
const kdLookup={};
KD.forEach(k=>{kdLookup[k.h]=k;kdLookup[k.k]=k;});

// 清音五十音表（行 × 5 段 a i u e o，null 为空位；わ行末列放「ん」）
const SEION_GRID=[
  ['あ','い','う','え','お'],
  ['か','き','く','け','こ'],
  ['さ','し','す','せ','そ'],
  ['た','ち','つ','て','と'],
  ['な','に','ぬ','ね','の'],
  ['は','ひ','ふ','へ','ほ'],
  ['ま','み','む','め','も'],
  ['や',null,'ゆ',null,'よ'],
  ['ら','り','る','れ','ろ'],
  ['わ',null,null,null,'を','ん']
];

function openChart(){
  showScreen('chartScreen');
  renderChart();
}

// 单元格：平假名 + 片假名 + 罗马字（h 可为 null，如外来语音）
function cellEl(h,k,romajiArr){
  const b=document.createElement('button');
  b.className='chart-cell';
  const kana=(h?'<span class="hi">'+h+'</span>':'')+'<span class="ka">'+k+'</span>';
  b.innerHTML='<span class="k">'+kana+'</span><span class="romaji">'+romajiArr[0]+'</span>';
  b.addEventListener('click',()=>openStrokeModal({h:h||null,k:k||null,romaji:romajiArr}));
  return b;
}

// 渲染一个「行」：头部（平假名） + 若干字格
function rowEl(headChar,cells){
  const row=document.createElement('div');
  row.className='chart-row';
  const head=document.createElement('div');
  head.className='chart-row-head';
  head.textContent=headChar;
  row.appendChild(head);
  const cellBox=document.createElement('div');
  cellBox.className='chart-row-cells'+(cells.length>5?' cols-6':'');
  cells.forEach(c=>{
    if(c===null){
      const empty=document.createElement('div');empty.className='chart-cell empty';cellBox.appendChild(empty);
    }else{
      const e=kdLookup[c];
      cellBox.appendChild(cellEl(e.h,e.k,e.a));
    }
  });
  row.appendChild(cellBox);
  return row;
}

function renderChart(){
  renderSeion();
  renderDakuonHandakuon();
  renderYouon();
  renderGai();
}

function renderSeion(){
  const box=document.getElementById('seionChart');box.innerHTML='';
  SEION_GRID.forEach(r=>{
    box.appendChild(rowEl(r[0],r));
  });
}

function renderDakuonHandakuon(){
  const box=document.getElementById('dakuonChart');box.innerHTML='';
  DAKUON_ROWS.concat(HANDAKUON_ROWS).forEach(rowId=>{
    const items=KD.filter(k=>k.r===rowId);
    const cells=items.map(k=>k.h);
    box.appendChild(rowEl(items[0].h,cells));
  });
}

function renderYouon(){
  const box=document.getElementById('youonChart');box.innerHTML='';
  const groups={};
  YOUON.forEach(y=>{
    const key=y.h[0]; // 平假名首字作为行标识
    if(!groups[key])groups[key]=[];
    groups[key].push(y);
  });
  Object.values(groups).forEach(g=>{
    const row=document.createElement('div');
    row.className='chart-row';
    const head=document.createElement('div');
    head.className='chart-row-head';
    head.textContent=g[0].h[0];
    row.appendChild(head);
    const cellBox=document.createElement('div');
    cellBox.className='chart-row-cells cols-3';
    g.forEach(y=>{
      cellBox.appendChild(cellEl(y.h,y.k,y.a));
    });
    row.appendChild(cellBox);
    box.appendChild(row);
  });
}

function renderGai(){
  const sec=document.getElementById('gaiSection');
  sec.classList.remove('hidden');
  const box=document.getElementById('gaiChart');box.innerHTML='';
  GAI.forEach(g=>{
    box.appendChild(cellEl(null,g.k,g.a));
  });
}

function toggleCollapse(btnId,bodyId){
  const btn=document.getElementById(btnId);
  const body=document.getElementById(bodyId);
  const open=body.classList.toggle('open');
  btn.classList.toggle('open',open);
  const arrow=btn.querySelector('.arrow');
  if(arrow)arrow.textContent=open?'▲':'▼';
}

// ===== 笔画弹窗 =====
let strokeGroups=[];     // [{svg, paths:[{p}], nums:[text]}]
let showStrokeNums=true; // 是否显示笔顺编号（默认显示）
const STROKE_SPEED=10;   // 每单位长度的播放毫秒数（越大越慢）

function openStrokeModal(sound){
  const pair=(sound.h?sound.h:'')+(sound.h&&sound.k?' / ':'')+(sound.k?sound.k:'');
  document.getElementById('modalChar').textContent=pair;
  document.getElementById('modalMeta').innerHTML=(sound.h?'<span class="tag tag-hira">平假名</span>':'')+(sound.k?'<span class="tag tag-kata">片假名</span>':'');
  document.getElementById('modalRomaji').textContent=sound.romaji.join(' / ');
  document.getElementById('strokeModal').classList.remove('hidden');
  renderDual(sound);
}

function closeStrokeModal(){
  document.getElementById('strokeModal').classList.add('hidden');
  document.getElementById('dualStage').innerHTML='';
  strokeGroups=[];
}

function renderDual(sound){
  const stage=document.getElementById('dualStage');
  stage.innerHTML='';
  strokeGroups=[];
  const panels=[];
  if(sound.h)panels.push({char:sound.h,label:'平假名'});
  if(sound.k)panels.push({char:sound.k,label:'片假名'});
  if(panels.length===1)stage.classList.add('single');else stage.classList.remove('single');
  let hasStroke=false;
  panels.forEach(p=>{
    const panel=document.createElement('div');
    panel.className='dual-panel';
    const label=document.createElement('div');
    label.className='dual-label';
    label.textContent=p.label;
    panel.appendChild(label);
    const content=document.createElement('div');
    content.className='dual-content';
    panel.appendChild(content);
    if(Array.from(p.char).length>1){renderComboInto(content,p.char);}
    else{renderStrokeInto(content,p.char);hasStroke=true;}
    stage.appendChild(panel);
  });
  const numWrap=document.getElementById('numToggleWrap');
  const replay=document.getElementById('replayBtn');
  if(hasStroke){
    numWrap.classList.remove('hidden');
    replay.classList.remove('hidden');
    const total=strokeGroups.reduce((s,g)=>s+g.paths.length,0);
    document.getElementById('modalStrokeCount').textContent='共 '+total+' 画';
    playStroke();
  }else{
    numWrap.classList.add('hidden');
    replay.classList.add('hidden');
    document.getElementById('modalStrokeCount').textContent='组合字';
  }
}

// 组合字（拗音/外来语音）：分格显示，无笔画
function renderComboInto(container,char){
  const grid=document.createElement('div');
  grid.className='combo-grid';
  Array.from(char).forEach((c,i)=>{
    const cell=document.createElement('div');
    cell.className='combo-cell'+(i===0?' big':' small');
    cell.textContent=c;
    grid.appendChild(cell);
  });
  container.appendChild(grid);
}

// 单字：田字格 + 笔顺动画
function renderStrokeInto(container,char){
  const NS='http://www.w3.org/2000/svg';
  const svg=document.createElementNS(NS,'svg');
  svg.setAttribute('class','stroke-svg');
  svg.setAttribute('viewBox','0 0 109 109');
  // 田字格（虚线）：外框 + 横竖中线
  const grid=document.createElementNS(NS,'g');
  grid.setAttribute('class','tian-grid');
  const rect=document.createElementNS(NS,'rect');
  rect.setAttribute('x','3');rect.setAttribute('y','3');rect.setAttribute('width','103');rect.setAttribute('height','103');
  grid.appendChild(rect);
  const v=document.createElementNS(NS,'line');
  v.setAttribute('x1','54.5');v.setAttribute('y1','3');v.setAttribute('x2','54.5');v.setAttribute('y2','106');
  grid.appendChild(v);
  const h=document.createElementNS(NS,'line');
  h.setAttribute('x1','3');h.setAttribute('y1','54.5');h.setAttribute('x2','106');h.setAttribute('y2','54.5');
  grid.appendChild(h);
  svg.appendChild(grid);
  // 笔画
  const data=KANA_STROKES[char]||[];
  const paths=[];const nums=[];
  data.forEach(d=>{
    const p=document.createElementNS(NS,'path');
    p.setAttribute('d',d);
    p.setAttribute('class','kvg-path');
    svg.appendChild(p);
    paths.push({p});
  });
  // 笔顺编号
  paths.forEach(({p},i)=>{
    const s=p.getPointAtLength(0);
    const t=document.createElementNS(NS,'text');
    t.setAttribute('class','stroke-num');
    t.setAttribute('x',s.x+4);
    t.setAttribute('y',s.y-3);
    t.textContent=i+1;
    if(!showStrokeNums)t.style.display='none';
    svg.appendChild(t);
    nums.push(t);
  });
  container.appendChild(svg);
  strokeGroups.push({svg,paths,nums});
}

function toggleStrokeNums(checked){
  showStrokeNums=checked;
  strokeGroups.forEach(g=>g.nums.forEach(t=>{t.style.display=checked?'':'none';}));
}

function replayStroke(){playStroke();}

// 匀速播放：左右两栏并行，各栏内按长度分配时长
function playStroke(){
  strokeGroups.forEach(g=>{
    g.paths.forEach(({p})=>{
      const len=p.getTotalLength();
      p.style.transition='none';
      p.style.strokeDasharray=len;
      p.style.strokeDashoffset=len;
    });
    void g.svg.offsetWidth; // 强制回流，让重置生效
    let delay=0;
    g.paths.forEach(({p})=>{
      const len=p.getTotalLength();
      const dur=Math.min(2200,Math.max(450,Math.round(len*STROKE_SPEED)));
      p.style.transition='stroke-dashoffset '+dur+'ms linear';
      setTimeout(()=>{p.style.strokeDashoffset='0';},delay);
      delay+=dur+120;
    });
  });
}

// ===== 键盘 =====
document.getElementById('romajiInput').addEventListener('keydown',function(e){
  if(e.key==='Enter'){e.preventDefault();answered?nextQuestion():checkAnswer();}
});

// 点击遮罩空白处关闭笔顺弹窗
document.getElementById('strokeModal').addEventListener('click',function(e){
  if(e.target===this)closeStrokeModal();
});
document.addEventListener('keydown',function(e){
  if(e.key==='Escape')closeStrokeModal();
});

// ===== 启动 =====
initSetup();
