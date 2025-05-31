let newEventBtn = document.getElementsByClassName("new-event-btn")[0]

newEventBtn.addEventListener("click", () => {
    document.getElementsByClassName("main")[0].style.display = "none";
    document.getElementsByClassName("create-form")[0].style.display = "flex";
});
