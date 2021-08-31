// Global vars
let showOptionChips = true;

// Ensure page does not refresh on form submit
let msgForm = document.getElementById("messageForm")
function stopRefresh(event) {event.preventDefault();}
msgForm.addEventListener('submit', stopRefresh)

// Allow submission of textarea input with enter key
document.getElementById(
    "userInputBox"
).addEventListener("keypress", submitTextareaOnEnter)

function scrollDown() {
    let chatHistoryDiv = document.getElementById("chat_history")
    chatHistoryDiv.scrollTop = chatHistoryDiv.scrollHeight
}

function submitTextareaOnEnter(event){
    if(event.which === 13) {
        event.target.form.dispatchEvent(new Event("submit", {cancelable: true}));
        event.preventDefault(); // Prevents the addition of a new line in the textfield
        event.target.value = ""; // clear textarea
    }
}

function fetchChatbotResponse(chatDiv, responseDiv, msg) {
    let loadingGif = document.createElement("img")
    loadingGif.src = "/static/images/grey_circles-loading.gif"
    console.log(loadingGif.src)
    loadingGif.alt = "Loading..."
    loadingGif.className = "loadingGif"
    responseDiv.appendChild(loadingGif)

    scrollDown()

    return fetch(`/get_response`, {
        method: "POST",
        body: JSON.stringify({
            msg: msg
        }),
        headers: {'Content-Type': 'application/json; charset=UTF-8'}
    })
}

function showChatbotResponse() {
    /* Sends POST request to Flask route that passes msg to the DNN model and returns prediction results
       then updates chat history div
    */
    let msg = document.getElementById("userInputBox").value
    let chatHistoryDiv = document.getElementById("chat_history")
    console.log(msg)

    if (!msg) {
        return;
    }

    let sentMsgDiv = document.createElement("div")

    let youMsg = document.createElement("p")
    youMsg.innerHTML = msg
    sentMsgDiv.appendChild(youMsg)
    sentMsgDiv.className = "user_sent_msg"

    chatHistoryDiv.appendChild(sentMsgDiv)
    scrollDown()

    // Prepare response div and pass it to the fetch function
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

    fetchChatbotResponse(chatHistoryDiv, responseMsgDiv, msg)
      .then((response) => {
        console.log(response)

        let loadingGif = responseMsgDiv.getElementsByClassName("loadingGif")[0]
        loadingGif.remove()

        return response.json()
    }).then((data) => {
        let probs = data.top_three_predictions
        let probsStr = JSON.stringify(probs)
            .split(',').join(' ')
            .replaceAll('"', '')
            .replaceAll(':', ': ')

        // Render the probabilities dropdown in nav
        /* Instead of doing all this dropdown shit just make the chatbot window width bigger on smaller screens with brians thing*/
        let predictionsElem = document.getElementById("prediction")
        predictionsElem.innerHTML = probsStr

        let botMsg = document.createElement("p")
        botMsg.innerHTML = data.chatbot_response
        responseMsgDiv.appendChild(botMsg)

        responseContainer.appendChild(responseMsgDiv)

        let slider = document.getElementById('optionsDiv');
        if (data.top_category === "iliaBOT_options") {
            addOptionsDiv(slider)
        } else if (slider) {
            slider.remove()
        }

        scrollDown()

    }).catch((e) => {
        let whoopsTag = document.createElement("p")
        whoopsTag.innerHTML = "Whoops something went wrong. Please try again."
        responseMsgDiv.appendChild(whoopsTag)
        scrollDown()

        console.log(e)
    })/**/

    document.getElementById("userInputBox").value = ''; // empty the input box
}