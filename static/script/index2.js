const Dark_light_btn=document.getElementsByClassName('Dark_light_btn')[0];
const Dark_light_btn_label=document.getElementById('Dark_light_btn_label');
const theme_icon=document.getElementById('theme_icon');
const html=document.documentElement

//  page's theme

function applyTheme(isDark){
    Dark_light_btn_label.textContent=isDark? 'light':'dark';
    theme_icon.className= isDark? 'fa-solid fa-sun':'fa-solid fa-moon';
    html.setAttribute('data-theme',isDark? 'dark':'light');
    localStorage.setItem('theme',isDark? 'dark':'light');
}

const savedTheme=localStorage.getItem('theme');
if(savedTheme) applyTheme(savedTheme==='dark');

Dark_light_btn.addEventListener('click',()=>{
    applyTheme(html.getAttribute('data-theme')!=='dark');
})


//  typing animation
const typed=document.getElementsByClassName('typed_span')[0];
const words = ['typing speed', 'coding skills', 'accuracy', 'muscle memory'];
let wordIndex=0,letterIndex=0,isDeleting=false,delay=0;
function typeLoop(){
    if(isDeleting){
        typed.textContent=words[wordIndex].slice(0,--letterIndex);
    }
    else{
        typed.textContent=words[wordIndex].slice(0,++letterIndex);
    }
    delay=isDeleting? 50 :90;
    if(!isDeleting && words[wordIndex].length==letterIndex){
        isDeleting=true;
        delay=1800;
    }
    else if(isDeleting && letterIndex==0){
        isDeleting=false;
        wordIndex=(wordIndex+1)%words.length;
        delay=400;
    }
    setTimeout(typeLoop,delay);
}
typeLoop();

// alert 

// show alert
const alertContainer=document.getElementsByClassName('alertContainer')[0];
let timer;
function show(){
    alertContainer.classList.add('pop');
    timer=setTimeout(close,6000);
}
//close alert
function close(){
    alertContainer.classList.remove('pop');
    clearTimeout(timer);
}

//cancel alert
const cancel=document.getElementById('cancel');
cancel.addEventListener('click',()=>{
    alertContainer.classList.remove('pop');
})

// leaderbaord

// loadleaderbord

async function leaderbaord() {
    try{
        const response= await fetch('/leaderboard');
        if (!response.ok) throw new Error("error in fetching data");
        const data = await response.json();
        const seen =new Map();
        for (const [user,score] of Object.entries(data)){
            if(!seen.has(user) || score> seen.get(user)){
                seen.set(user,score);
            }
        }
        return [...seen.entries()].sort((a,b)=>b[1]-a[1]);
    }catch(e){
        console.error('leaderboard error: ',e);
        return [];
    }
}
// get random color
function randomColor(){
    const palette=[
        '#6366f1','#8b5cf6','#ec4899','#f43f5e',
        '#f97316','#eab308','#22c55e','#06b6d4','#3b82f6'
    ];
    return palette[Math.floor(Math.random()*palette.length)];
}
// set podium
function setPodium(num,name,score){
    console.log(num,name,score);
    const lg=document.getElementById(`lg${num}`);
    const na=document.getElementById(`na${num}`);
    const sc=document.getElementById(`sc${num}`);
    if(!name ) return;
    lg.textContent=name[0].toUpperCase();
    lg.style.backgroundColor=randomColor();
    na.textContent=(name.length > 10 ? name.slice(0,9)+'...' : name);
    sc.textContent=score.toLocaleString();
        console.log('kj');

}

// dispaly leaderboard

async function renderLeaderboard(){

    const list = await leaderbaord();
    console.log('kj');

    

    const leaderboard_section2=document.getElementsByClassName('leaderboard_section2')[0];


    console.log('kj');
    setPodium(1,list[0]?.[0],list[0]?.[1]);
    setPodium(2,list[1]?.[0],list[1]?.[1]);
    setPodium(3,list[2]?.[0],list[2]?.[1]);

    list.slice(3).forEach(([name,score],i)=>{
        const row=document.createElement('div');
        row.className= 'row';

        const info=document.createElement('div');
        info.className= 'info';

        const rank=document.createElement('div');
        rank.className= 'rank';

        const leaderboard_section2_logo=document.createElement('div');
        leaderboard_section2_logo.style.backgroundColor=randomColor();
        leaderboard_section2_logo.className= 'leaderboard_section2_logo';
        
        const leaderboard_section2_userName=document.createElement('div');
        leaderboard_section2_userName.className= 'leaderboard_section2_userName';

        const leaderboard_section2_score=document.createElement('div');
        leaderboard_section2_score.className= 'leaderboard_section2_score';

        const span=document.createElement('span');


        rank.textContent=`#${i+4}`;
        leaderboard_section2_logo.textContent=name[0].toUpperCase();
        leaderboard_section2_userName.textContent= name.length<10 ? name : name.slice(0,9);
        span.innerHTML=`⭐ ${score.toLocaleString()}`;

        info.append(rank,leaderboard_section2_logo,leaderboard_section2_userName);
        leaderboard_section2_score.append(span);
        row.append(info,leaderboard_section2_score);

        leaderboard_section2.append(row);
        console.log(leaderboard_section2);
    });
    
}
// form submition

const form=document.getElementById('form');
const Username=document.getElementById('Username');
const submit=document.getElementsByClassName('Submit_section')[0];
const btn_txt=submit.querySelector('#btn_txt');
const btn_load=submit.querySelector('#btn_load');
const nameError=document.getElementsByClassName('nameError')[0];

function setLoading(on){
    submit.disabled=on;
    btn_load.hidden=!on;
    btn_txt.hidden=on;
}

async function checkUser(name){
    
    const request= await fetch('/checkUser',{
        method:'POST',
        headers:{'Content-type':'application/json'},
        body: JSON.stringify({'UserName':name})
    })
    if(!request.ok) throw new Error('failed to check!');
    const data= await request.json();
    return data.status;
    
}

form.addEventListener('submit',async (e)=>{
    e.preventDefault();
    
    const name=Username.value.trim();
    if(!name){
        nameError.textContent='Please enter a name...';
        return;
    }

    setLoading(true);

    try{
        const exist = await checkUser(name);
        if(exist){
            nameError.textContent='Please enter an other name...';
            show();
            setLoading(false);
            Username.focus();
            return; 
        }
        else{
            form.submit();
        }
    }catch(e){
        setLoading(false);
        console.error('submition error',e);
        nameError.textContent="network-error , please try again.";
    }
});

//clear error and input

Username.addEventListener('input',()=>{
    nameError.textContent='';
});


//init
async function save_score(){
    const r = await fetch('/save-score',{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({
        'username':'bro',
        'score':432,
        'accuracy':0,
        'wpm':0
        })
    });
}

window.addEventListener('load',()=>{
    renderLeaderboard();
});