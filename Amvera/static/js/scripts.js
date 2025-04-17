let tg = window.Telegram.WebApp;

        let fBtn = document.getElementsByClassName("f-btn")[0]
        let sBtn = document.getElementsByClassName("s-btn")[0]

        fBtn.addEventListener("click", () => {
            document.getElementsByClassName("Main")[0].style.display = "none";
            document.getElementsByClassName("test-form")[0].style.display = "block";
        });

        sBtn.addEventListener("click", () => {
            tg.close();
        });