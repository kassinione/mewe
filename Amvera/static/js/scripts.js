let tg = window.Telegram.WebApp;

let searchBtn = document.getElementsByClassName("search-btn")[0]
let eventBtn = document.getElementsByClassName("event-btn")[0]
let lastBtn = document.getElementsByClassName("last-btn")[0]
let sBtn = document.getElementsByClassName("s-btn")[0]

searchBtn.addEventListener("click", () => {
    document.getElementsByClassName("create-form")[0].style.display = "none";
    document.getElementsByClassName("Main")[0].style.display = "flex";
});

eventBtn.addEventListener("click", () => {
    document.getElementsByClassName("Main")[0].style.display = "none";
    document.getElementsByClassName("create-form")[0].style.display = "flex";
});

lastBtn.addEventListener("click", () => {
    document.getElementsByClassName("create-form")[0].style.display = "none";
    document.getElementsByClassName("Main")[0].style.display = "flex";
});

sBtn.addEventListener("click", () => {
    let title = document.getElementsByClassName("title-inp")[0];
    let description = document.getElementsByClassName("desc-inp")[0];
    let text = document.getElementsByClassName("text-inp")[0];

    
    let data = {
        title: title.value,
        desc: description.value,    
        text: text.value
    }

    tg.sendData(JSON.stringify(data));
});