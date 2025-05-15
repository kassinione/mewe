let tg = window.Telegram.WebApp;

let newEventBtn = document.getElementsByClassName("new-event-btn")[0]
let sBtn = document.getElementsByClassName("s-btn")[0]


newEventBtn.addEventListener("click", () => {
    document.getElementsByClassName("main")[0].style.display = "none";
    document.getElementsByClassName("create-form")[0].style.display = "flex";
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