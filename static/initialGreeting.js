/*
The initial greeting msg is created and sent here and the draggable option chips for main intents is created here
*/
// Script for sending initial messages more naturally
//   instead of them rendering with the page right away
sendMsg (
    "Hi there👋! I'm Ilia's Resume Chatbot, IliaBOT, thanks for taking the time to chat with me!",
    2000
).then(() => {
    sendMsg (
        "Ask me anything specific, or choose one of the options below and I can get the conversation rolling :)",
        1500
).then(() => {
    addOptionsDiv(null);
})
})

async function sendMsg(msg, typingTime) {
    let chatHistoryDiv = document.getElementById("chat_history")

    let responseContainer = document.createElement("div")
    responseContainer.className = "responseContainer"
    let chatbotImg = document.createElement("img")
    chatbotImg.className = "chatbotImg"
    chatbotImg.src = "https://cdn.dribbble.com/users/37530/screenshots/2937858/drib_blink_bot.gif"
    responseContainer.appendChild(chatbotImg)

    let responseMsgDiv = document.createElement("div")
    responseMsgDiv.className = "chatbot_response"
    responseContainer.appendChild(responseMsgDiv)
    chatHistoryDiv.appendChild(responseContainer)

    let loadingGif = document.createElement("img")
    loadingGif.src = "/static/images/grey_circles-loading.gif"
    console.log(loadingGif.src)
    loadingGif.alt = "Loading..."
    loadingGif.className = "loadingGif"
    responseMsgDiv.appendChild(loadingGif)

    await sleep(typingTime)  // Let it load for a bit so it looks more natural

    let botMsg = document.createElement("p")
    botMsg.innerHTML = msg
    loadingGif.remove()
    responseMsgDiv.appendChild(botMsg)
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

//===================Draggable Option Chips================================//
let isDown = false;
let startX;
let scrollLeft;

function addOptionsDiv(slider) {
    // Make it draggable

    if (slider) {
        document.getElementById('chat_history').appendChild(slider)
    } else {
        $(
            `<div id='optionsDiv'>
                <div class="optionChip">Skills 🤹‍♀️</div>
                <div class="optionChip">Work Experience 💼</div>
                <div class="optionChip">Projects 💡</div>
                <div class="optionChip">Education 🎓</div>
                <div class="optionChip">About IliaBOT 🤔</div>
            </div>`
        ).appendTo( '#chat_history' )

        slider = document.getElementById('optionsDiv');

        slider.addEventListener('mousedown', (e) => {
          isDown = true;
          slider.classList.add('active');
          startX = e.pageX - slider.offsetLeft;
          scrollLeft = slider.scrollLeft;
        });
        slider.addEventListener('mouseleave', () => {
          isDown = false;
          slider.classList.remove('active');
        });
        slider.addEventListener('mouseup', () => {
          isDown = false;
          slider.classList.remove('active');
        });
        slider.addEventListener('mousemove', (e) => {
          if(!isDown) return;
          e.preventDefault();
          const x = e.pageX - slider.offsetLeft;
          const walk = (x - startX) * 3; //scroll-fast
          slider.scrollLeft = scrollLeft - walk;
        });
    }
}
