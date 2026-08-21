// ===============================
// Projects Animation
// ===============================


const cards = document.querySelectorAll(".project-card");


window.addEventListener("scroll",()=>{

cards.forEach(card=>{


let position = card.getBoundingClientRect().top;

let screen = window.innerHeight;


if(position < screen - 100){

card.style.opacity="1";
card.style.transform="translateY(0)";

}


});


});