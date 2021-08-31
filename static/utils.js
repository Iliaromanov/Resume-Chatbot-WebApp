
const scrollDown = () => {
    // Scrolls to bottom of chat history div
    let chatHistoryDiv = document.getElementById("chat_history")
    chatHistoryDiv.scrollTop = chatHistoryDiv.scrollHeight
}

const submitTextareaOnEnter = (event) => {
    // Allows users to submit textarea input using enter key
    if (event.which === 13) {
        event.target.form.dispatchEvent(new Event("submit", {cancelable: true}));
        event.preventDefault(); // Prevents the addition of a new line in the textfield
        event.target.value = ""; // clear textarea
    }
}

const createBotMsgContainer = () => {
    // Creates a bot msg container and returns the text response
    //   container div and the entire msg container itself
    let responseContainer = document.createElement("div")
    responseContainer.className = "responseContainer"

    // Add chatbot icon
    let chatbotImg = document.createElement("img")
    chatbotImg.className = "chatbotImg"
    chatbotImg.src = "https://cdn.dribbble.com/users/37530/screenshots/2937858/drib_blink_bot.gif"
    responseContainer.appendChild(chatbotImg)

    // Add text response div
    let responseMsgDiv = document.createElement("div")
    responseMsgDiv.className = "chatbot_response"
    responseContainer.appendChild(responseMsgDiv)

    return [responseMsgDiv, responseContainer]
}


const createLoadingGif = () => {
    // Creates and returns an img element containing loading gif
    let loadingGif = document.createElement("img")
    loadingGif.src = "/static/images/grey_circles-loading.gif"
    loadingGif.alt = "Loading..."
    loadingGif.className = "loadingGif"

    return loadingGif
}


const sleep = (ms) =>  {
  return new Promise(resolve => setTimeout(resolve, ms));
}


const sendMsg = async (msg, typingTime) => {
    // sends a msg with an artificial delay of typingTime ms
    let chatHistoryDiv = document.getElementById("chat_history")

    // use helper to create response container
    let responseDivElems = createBotMsgContainer();
    let responseContainer = responseDivElems[1];
    let responseMsgDiv = responseDivElems[0];
    chatHistoryDiv.appendChild(responseContainer);

    // use helper to create loading animation
    let loadingGif = createLoadingGif();
    responseMsgDiv.appendChild(loadingGif)

    // Let artificial loading animation run to make it look more natural
    await sleep(typingTime)

    // Render msg
    let botMsg = document.createElement("p")
    botMsg.innerHTML = msg
    loadingGif.remove()
    responseMsgDiv.appendChild(botMsg)
}


const sendInitialGreeting = async () => {
    // Sends initial greeting message and shows user main options
    await sendMsg(
        "Hi there👋! I'm Ilia's Resume Chatbot, IliaBOT, thanks for taking the time to chat with me!",
        2000
    );
    await sendMsg(
        "Ask me anything specific, or choose one of the options below and I can get the conversation rolling :)",
        1500
    );
    addOptionsDiv(null)
}


//===================Draggable Option Chips================================//
let isDown = false;
let startX;
let scrollLeft;

function addOptionsDiv(slider) {
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


