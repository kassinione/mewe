let callCreateFormBtn = document.getElementsByClassName("new-event-btn")[0]

callCreateFormBtn.addEventListener("click", () => {
    document.getElementsByClassName("main")[0].style.display = "none";
    document.getElementsByClassName("create-form")[0].style.display = "flex";
});

let closeCreateFormBtn = document.getElementsByClassName("close-btn")[0]

closeCreateFormBtn.addEventListener("click", () => {
    document.getElementsByClassName("create-form")[0].style.display = "none";
    document.getElementsByClassName("main")[0].style.display = "flex";
});