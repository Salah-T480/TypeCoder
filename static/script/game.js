

let Top=0;//-38

const values=document.getElementsByClassName("values");
const gameOver=document.getElementsByClassName("gameOver")[0];
const game=document.getElementsByClassName("game")[0];
const gameArea=document.getElementsByClassName("gameArea")[0];
const input=document.getElementById("input");
const lives=document.getElementsByClassName("lives");
const modeAbdellah=document.getElementsByClassName('modeAbdellah')[0];

modeAbdellah.classList.add(`${localStorage.getItem("difficulty")}`);
console.log(modeAbdellah);
const levels={  'easy':10,
                'medium':20,
                'hard':30,
                'asian':40,
            }

let liveArray=[];
let fallingWordsArray=[];

for(let i=0;i<5;i++){
    liveArray.push(lives[0].children[i]);
}

let CorrectWord=0;

isRunning=true;
async function saveScore(param){
   try{
    const request=await fetch('/save-score',
        {   cache: "no-cache",
            method: "POST",
            headers: {
                    'Content-Type': 'application/json',
                },
            body:JSON.stringify({
                    userName:localStorage.getItem('name'),
                    score:param
                }
    )}
    );
    const data=await request.json();
    console.log(data);
    if(!request.ok){
        throw new Error(" Problem with saving!!!");
    }
    
   }catch(e){

   } 
}

function getLeft(width){
    var min,max;
    min=10;
    max=Number(gameArea.offsetWidth)-Number(width)-10;
    return Math.floor(Math.random()*(max-min)+min);
}

class FallingWord{
    static TotalCount=0;
    constructor(textContent){
        FallingWord.TotalCount+=1;
        this.element=document.createElement('span');
        this.element.textContent=textContent;
        this.element.classList.add('SpanFallingWord');
        this.Top=0;
        this.isActive=true;
        gameArea.appendChild(this.element);
        this.element.style.left=getLeft(this.element.offsetWidth)+'px';
    }
   
    moveDown(){
        if(!this.isActive) return;
        this.Top+=2;
        this.element.style.top=this.Top+'px';
        if(gameArea.offsetHeight  <=( this.element.offsetTop +10)){
            if(liveArray.length==1){
                game.style.display="none";
                gameOver.style.display="block";
                isRunning=false;
                gameAudio.pause();
                gameOverAudio.play();
                let i=0;
                fallingWordsArray.forEach((word)=>{
                    word.element.remove();
                    fallingWordsArray.splice(i,1);
                    word.isActive=false;
                    i+=1;
                })
                
                return;
            }
            console.log("you lost a heart");

            hurt.play();

            console.log(liveArray);
            let lostLive=liveArray.pop();
            lostLive.remove();
            this.element.remove();
            let i=0;
            fallingWordsArray.forEach((word)=>{
                if(word.element.textContent===this.element.textContent){
                    
                    console.log(word.element.textContent);
                    console.log(fallingWordsArray[i].element.textContent);
                    fallingWordsArray.splice(i,1);
                    this.isActive=false;
                    return ;
                }
                i+=1;
            })
            console.log(fallingWordsArray);
        }
        else{
            requestAnimationFrame(()=>this.moveDown());
        }    
    }    
}

input.addEventListener("input",(e)=>{
    let i=0;
    fallingWordsArray.forEach((word)=>{
        
        if (word.element.textContent.trim()===(input.value.trim())){
            
            word.element.remove();
            fallingWordsArray.splice(i,1);
            word.isActive=false;
            input.value="";
            CorrectWord+=1;
            values[0].textContent=CorrectWord*levels[localStorage.getItem("difficulty")];
            
        }
        i+=1;
    })
});

async function getWord(){
    if(isRunning){
        try{
            const response=await fetch(`/get-word/${localStorage.difficulty}`);
            if(!response.ok){
                throw new Error("error in the internal Server sorry");
            }
            else{
                const data= await response.json();
                
                let word= new FallingWord(data.word);
                fallingWordsArray.push(word);
                
                word.moveDown();
                console.log("hi");
                console.log(((CorrectWord)/FallingWord.TotalCount)*100);
                values[1].textContent=Math.floor(((CorrectWord)/FallingWord.TotalCount)*100)+'%';
                
            }
        }
        catch(e){
            console.log(e);
        }
    }
    else{
        saveScore(values[0].textContent);
        clearTimeout(T);
    }
    
}

async function PlayAgain(){
    const request=await fetch(`/delete/${localStorage.getItem("name")}`);
    
    window.location.reload();
}

console.log(1)
let T=setInterval(getWord,1500);


input.addEventListener("keypress",(e)=>{
    if(e.key=='Enter' || e.code=='Space'){
        input.value='';
    }
})




const gameAudio=document.getElementById("gameAudio");
gameAudio.volume = 1;
const gameOverAudio=new Audio("/static/audio/game_over.mp3");


const hurt=new Audio('/static/audio/hurt1.mp3');

hurt.volume=1;