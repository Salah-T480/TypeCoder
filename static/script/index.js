const form=document.getElementById("form");

async function loadLeaderBroad() {
    try{
        const response= await fetch('/leaderboard');
        if(!response.ok){
            throw new Error("Something is wrong with JavaScript")
        }   
        else{
            //console.log(response);
            
            const data=await response.json();
            console.log(data);
            let items=Object.keys(data).map((key)=>{
                return [key,data[key]];
            })
            items.sort((first,second)=>{
                return second[1]-first[1];
            })
            console.log(items);
            return items;
        }
    }
    catch(error){
        console.error(error);
    }
}

const firstPerson=document.getElementsByClassName("firstPerson")[0];
const secondPerson=document.getElementsByClassName("secondPerson")[0];
const thirdPerson=document.getElementsByClassName("thirdPerson")[0];
console.log(12);
console.log(secondPerson.children);
async function insertLeaderBoard() {
    const leaderboard=document.getElementById('olList');
    
    try{
        const list= await loadLeaderBroad();
        console.log(list);
        for(i in list){
            //console.log(i);
            const lis=document.createElement('li');
            console.log(i);

            switch (i){
                case '0':
                    console.log("it i");
                    firstPerson.children[0].textContent=list[i][0][0];
                    firstPerson.children[0].style.backgroundColor=randomRGB();

                    firstPerson.children[1].textContent=list[i][0].slice(0,9);
                    firstPerson.children[2].textContent=list[i][1];
                    break;
                case '1':
                    secondPerson.children[0].textContent=list[i][0][0];
                    secondPerson.children[0].style.backgroundColor=randomRGB();

                    secondPerson.children[1].textContent=list[i][0].slice(0,9);
                    secondPerson.children[2].textContent=list[i][1];
                    break;
                case '2':
                    thirdPerson.children[0].textContent=list[i][0][0];
                    thirdPerson.children[0].style.backgroundColor=randomRGB();

                    thirdPerson.children[1].textContent=list[i][0].slice(0,9);
                    thirdPerson.children[2].textContent=list[i][1];
                    break;
                default:
                    console.log('k');
                    const index=(i=='9')? Number(i)+1 :'0'+String((Number(i)+1));
                    new Li(index,list[i][0],list[i][1]);
                    //console.log(list);
            }
           
        }
    }catch(e){
        console.error("hhhh");
    }
    
}

async function isExist(name) {
    const request=await fetch('/checkUser',{
        method:"POST",
        headers:{
            'Content-Type':"application/json"
        },
        body:JSON.stringify({
            userName:name
        })
 
    });
    if(!request.ok){
        throw new Error("Problem in sending data to userChecking");
    }
    else{
        const data = await request.json();
        console.log(data);
        console.log(data["status"]);
        return data["status"];
    }
}

let data;
function getNameLevel(){
    const form=document.getElementById('form');
    const name=form[0].value;
    const difficulty=form[1].value;

    
    console.log(difficulty);
    data=[name,difficulty];
    console.log(data);
    localStorage.setItem("name",name);
    localStorage.setItem("difficulty",difficulty);
    
    
}
window.addEventListener('load',()=>{
    console.log('hi');
    loadLeaderBroad();
    insertLeaderBoard();
    isExist(localStorage.getItem("name"));
    console.log("dyedw")
})

console.log(form);
form.addEventListener('submit',()=>{
    console.log("booo");
})

const cloud3=document.getElementsByClassName('cloud3')[0];


const leaderboard=document.getElementById('olList');

class Li {
    
    constructor(index,userName,userScore){
        console.log('hi bro');
        const star= document.createElement('i');
        star.classList.add("fa-solid");
        star.classList.add("fa-star");
        star.style.color='rgba(255, 212, 59, 1)';

        const span= document.createElement('span');
        span.textContent=userScore;

        const score= document.createElement('div');
        score.classList.add('score');
        score.appendChild(star);  
        score.appendChild(span);  

        const log= document.createElement('div');
        log.textContent=userName[0];
        log.classList.add('log');
        log.style.backgroundColor=randomRGB();
        
        const name= document.createElement('div');
        name.textContent=userName;
        name.classList.add('userName');

        const LogName= document.createElement('div');
        LogName.classList.add('LogName');
        LogName.append(log);
        LogName.appendChild(name);

        const rank= document.createElement('div');
        rank.classList.add('rank');
        rank.textContent=`#${index}`;

        const list=document.createElement('li');
        list.appendChild(rank);
        list.appendChild(LogName);
        list.appendChild(score);

        leaderboard.appendChild(list);

        
    }
}


function randomRGB(){
    const red=Math.floor(Math.random()*255);
    const blue=Math.floor(Math.random()*255);
    const green=Math.floor(Math.random()*255);
    return `rgb(${red},${green},${blue})`;
}