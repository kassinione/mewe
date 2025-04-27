<<<<<<< HEAD
let tg = window.Telegram.WebApp;

        let fBtn = document.getElementsByClassName("f-btn")[0]
        let sBtn = document.getElementsByClassName("s-btn")[0]

        fBtn.addEventListener("click", () => {
            document.getElementsByClassName("Main")[0].style.display = "none";
            document.getElementsByClassName("test-form")[0].style.display = "block";
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
=======
>>>>>>> 502c4cc23536aab0ccad7613aa904b9fd8d56807
