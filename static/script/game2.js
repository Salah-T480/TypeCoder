// player data
const player_name=document.body.dataset.player || 'Anonymous';
const difficulty=document.body.dataset.difficulty || 'easy';

//diff_config
const diff_config={
    easy    :{spawnMs: 2200,    speed: 1.0 , scoreBase: 10, label: 'Easy'},
    medium  :{spawnMs: 1700,    speed: 1.6 , scoreBase: 20, label: 'Medium'},
    hard    :{spawnMs: 1300,    speed: 2.4 , scoreBase: 30, label: 'Hard'},
    asian   :{spawnMs: 900,     speed: 3.5 , scoreBase: 50, label: 'Asian'},
};
const config = diff_config[difficulty] || diff_config.easy;

// dom reference

const heartsEl=document.getElementById('life_heart');
const livesBarFill=document.getElementById('lives-bar-fill');
const gameArea=document.getElementById('gameArea');
const wordInput=document.getElementById('wordInput');
const statScore=document.getElementById('statScore');
const statWpm=document.getElementById('statWpm');
const statAccuracy=document.getElementById('statAccuracy');
const statStreak=document.getElementById('statStreak');
const comboPopup=document.getElementById('comboPopup');
const goScore=document.getElementById('goScore');
const goWpm=document.getElementById('goWpm');
const goAccuracy=document.getElementById('goAccuracy');
const goStreak=document.getElementById('goStreak');
const screenGame=document.getElementById('screenGame');
const screenGameover=document.getElementById('screenGameover');
const playAgain=document.getElementById('playAgain');
const header_diff=document.getElementById('header_diff');
const home= document.getElementById('home');
// Game State
const Max_Lives =5;
let lives       =Max_Lives;
let isRunning   =true;
let spawnTimer      = null;
let wpmTimer        = null;
let totalSpawned    =0;
let activeWords = [];
let totalTyped=0;
let totalCharsTyped=0;
let currentStreak=0;
let bestStreak=0;
let score=0;
let gameStartTime=null;

// spawn words
function scheduleNextWord(){
    if(!isRunning) return;
    const jitter = (Math.random()-0.5)*config.spawnMs*0.3;
    spawnTimer=setTimeout(()=>{
        spawnWord();
        //isRunning=false;
        scheduleNextWord();
    },config.spawnMs+ jitter);
}
async function spawnWord(){
    if(!isRunning) return;
    try{
        const rq= await fetch(`/get-word/${difficulty}`);
        if(!rq.ok) throw new Error('error in fetching words');
        const data = await rq.json();
        createFallingWord(data.word.trim());
    }catch(e){
        console.error('spawnWord: ',e);
    }
}
function createFallingWord(text){
    totalSpawned++;

    const el=document.createElement('div');
    el.className=`falling-word diff-${difficulty}`;
    el.textContent=text;

    const timeBar=document.createElement('div');
    timeBar.className='word-timer-bar';

    el.appendChild(timeBar);

    gameArea.appendChild(el);

    const aW=gameArea.offsetWidth;
    const wW=el.offsetWidth;
    const minX=10; 
    const maxX=Math.max(minX+1,aW-wW-10);

    el.style.left=Math.floor(Math.random()*(maxX-minX)+minX)+'px';
    el.style.top=0+'px';

    const wordObj = { element: el, text, timeBar, animId: null, posY: 0, warnedOnce: false };
    activeWords.push(wordObj);
    wordObj.animId=requestAnimationFrame(()=> animateWord(wordObj))
}

// animate falling word
function animateWord(wordObj){
    if(!wordObj.element) return;

    wordObj.posY+=config.speed;
    wordObj.element.style.top=wordObj.posY+'px';

    //timer bar
    const gameAreaHeight=gameArea.offsetHeight;
    const elHeight=wordObj.element.offsetHeight;
    const pct = Math.max(0,1-wordObj.posY/(gameAreaHeight-elHeight));

    wordObj.timeBar.style.width=pct*100+'%';

    if(pct<0.25){
        wordObj.timeBar.className='word-timer-bar danger';
        if(!wordObj.warnedOnce){
            wordObj.warnedOnce=true;
            sfxWarning();
        }
    }
    else if(pct<0.55){
        wordObj.timeBar.className='word-timer-bar warn';
    }else{
        wordObj.timeBar.className='word-timer-bar';
    }
    if(wordObj.posY+elHeight>=gameAreaHeight){
        wordMissed(wordObj);
        return;
    }
    wordObj.animId = requestAnimationFrame(() => animateWord(wordObj));
}
// word missed
function wordMissed(wordObj){
    cancelAnimationFrame(wordObj.animId);
    removeFromActive(wordObj);

    // streak ?
    //

    //flash gameArea
    gameArea.classList.remove('flash-miss');
    void gameArea.offsetWidth;
    gameArea.classList.add('flash-miss') ;
    
    //sound
    //
    wordObj.element.classList.add('missing');
    setTimeout(()=>{
        wordObj.element?.remove();
    },320);
    lostLife();
}
// input
wordInput.addEventListener('keydown',(e)=>{
    //sound
    //

    if(e.key=='Escape'){
        wordInput.value='';
        return;
    }
    //Sound
    //

});

wordInput.addEventListener('input',(e)=>{
    const typed= wordInput.value.trim();
    if(!typed) return;
    //match
    const sorted= [...activeWords].sort((a,b)=>b.posY-a.posY);
    const match =sorted.find(e=>e.text===typed);
    if(match) wordCorrect(match,typed);

});

function wordCorrect(wordObj,typed){
    cancelAnimationFrame(wordObj.animId);
    removeFromActive(wordObj);

    totalTyped++;
    totalCharsTyped+=typed.length;
    currentStreak++;
    if (currentStreak>bestStreak) bestStreak=currentStreak;

    const multiplier=Math.min(currentStreak,5);
    score+=config.scoreBase*multiplier;

    statScore.textContent=score.toLocaleString();
    updateStreakDisplay();
    updateAccuracy();

    //visual
    wordObj.element.classList.add('destroying');
    setTimeout(()=>{
        wordObj.element?.remove();
    },260)

    const wrap= wordInput.closest('.input_field');
    wrap.classList.remove('correct');
    void wrap.offsetWidth;
    wrap.classList.add('correct');
    
    wordInput.value='';

    //Audio
    //


    // shwo cimbo
    if (currentStreak >= 3) showCombo(currentStreak, multiplier);

}
// Combo
function showCombo(streak,multi){
    comboPopup.textContent= streak>=5
        ? `🔥 ×${multi} MAX COMBO!`
        :`×${multi} combo`;
    comboPopup.classList.remove('show');
    void comboPopup.offsetWidth;
    comboPopup.classList.add('show');

}


// update : Streak / Accuracy / WPM
function updateStreakDisplay(){
    const mult =Math.min(currentStreak,5);
    statStreak.textContent=`×${mult || 1}`;
    statStreak.classList.toggle('hot',currentStreak>=3);
}
function updateAccuracy(){
    const pct= totalSpawned>0
                ? Math.floor((totalTyped/totalSpawned)*100)
                :100;
    statAccuracy.textContent=pct+'%';
}

function startWpmTimer(){
    wpmTimer=setInterval(()=>{
        if(!isRunning) return;
        const minutes = (Date.now()-gameStartTime)/60000;
        statWpm.textContent=minutes>0
            ? Math.floor(totalCharsTyped/5/minutes)
            :0;
    },1000);
}

//helper 
function removeFromActive(wordObj){
    const index = activeWords.indexOf(wordObj);
    if(index!==-1) activeWords.splice(index,1); 
}

// game over
function triggerGameOver(){
    isRunning=false;
    clearTimeout(spawnTimer);
    clearInterval(wpmTimer);

    // kill all word
    activeWords.forEach((w)=>{
        cancelAnimationFrame(w.animId);
        w.element?.remove();
    });
    activeWords=[];

    //Audio
    //

    //final stats
    const minutes = (Date.now()-gameStartTime) / 60000;
    const finalAcc=totalSpawned>0
        ? Math.floor((totalTyped/totalSpawned)*100)
        :0;
    const finalWpm= minutes > 0 ? Math.round(totalCharsTyped / 5 / minutes) : 0;

    goScore.textContent=score.toLocaleString();
    goAccuracy.textContent=finalAcc+'%';
    goWpm.textContent=finalWpm;
    goStreak.textContent=bestStreak;

    screenGame.style.display='none';
    screenGameover.classList.add('active');

    saveScore(score, finalAcc, finalWpm);


}

// save Score
async function saveScore(finalScore,accuracy,wpm){

    try{
        const req= await fetch('/save-score',{
            method:'POST',
            headers:{'Content-Type':'application/json'},
            body:JSON.stringify({
                username:player_name,
                score:finalScore,
                accuracy:accuracy,
                wpm:wpm
            })
        });
        if(!req.ok) throw new Error('error in saving score');
        console.log('Score saved ');
    }catch(e){
        console.error('saveSocre error: ',e);
    }
}

// play again
playAgain.addEventListener('click',async ()=>{
    // delete name
    try{
        const rq= await fetch(`/delete/${encodeURIComponent(player_name)}`);
    }catch(e){ console.error(e);}

    //create new form
    const form =document.createElement('form');
    form.method='POST';
    form.action='/game';
    form.style.display='none';

    const nameField =document.createElement('input');
    nameField.name='Username';
    nameField.value=player_name;

    const diff_field =document.createElement('input');
    diff_field.name='difficulty';
    diff_field.value=difficulty;

    form.append(nameField,diff_field);
    document.body.appendChild(form);
    form.submit();
})

//home
home.addEventListener('click',()=>{
    console.log('dwed');
    window.location.href='/';
})
function sfxWarning(){

}

// Lives
function lostLife(){
    lives--;
    updateHeartsDisplay();
    if(lives<=0) triggerGameOver();
}
function updateHeartsDisplay(){
    heartsEl.querySelectorAll('i').forEach((h,i)=>{
        h.classList.toggle('lost',i>=lives);
    });
    const pct= (lives/Max_Lives)*100;
    livesBarFill.className = 'lives-bar-fill';
    livesBarFill.style.width = pct+'%';
    
    if(lives<=1) livesBarFill.classList.add('danger');
    else if (lives<=3) livesBarFill.classList.add('warn');
}// it's work



//init
function init(){
    header_diff.textContent=config.label;
    header_diff.className =`difficulty ${difficulty}`;
    updateHeartsDisplay();
    //sound
    //

    isRunning=true;
    gameStartTime=Date.now();

    scheduleNextWord();
    startWpmTimer();

}

//start
init();