// Ensure page does not refresh on form submit
let msgForm = document.getElementById("message_form")
function stopRefresh(event) {event.preventDefault();}
msgForm.addEventListener('submit', stopRefresh)

function scrollDown() {
    let chatHistoryDiv = document.getElementById("chat_history")
    chatHistoryDiv.scrollTop = chatHistoryDiv.scrollHeight
}

function fetchChatbotResponse(responseDiv, msg) {
    let loadingGif = document.createElement("img")
    loadingGif.src = "/static/images/grey_circles-loading.gif"
    console.log(loadingGif.src)
    loadingGif.alt = "Loading..."
    loadingGif.className = "loadingGif"
    responseDiv.appendChild(loadingGif)

    scrollDown()

    return fetch(`/get_response?msg=${msg}`, {
        method: "POST",
        headers: {'Content-Type': 'application/x-www-form-urlencoded'}
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
    /*
    let youTag = document.createElement("p")
    youTag.innerHTML = "You"
    sentMsgDiv.appendChild(youTag)*/

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

    fetchChatbotResponse(responseMsgDiv, msg).then((response) => {
        console.log(response)

        let loadingGif = responseMsgDiv.getElementsByClassName("loadingGif")[0]
        loadingGif.remove()

        return response.json()
    }).then((data) => {
        let probs = data.top_three_predictions
        console.log(probs)

        /*
        let botTag = document.createElement("p")
        botTag.innerHTML = "Chatbot"
        responseMsgDiv.appendChild(botTag)
         */
        let botMsg = document.createElement("p")
        botMsg.innerHTML = JSON.stringify(probs)
            .split(',').join(' ')
            .replaceAll('"', '')
            .replaceAll(':', ': ')
        responseMsgDiv.appendChild(botMsg)

        console.log(responseMsgDiv.scrollHeight)

        responseContainer.appendChild(responseMsgDiv)

        scrollDown()
    }).catch((e) => {
        console.log(e)
    })/**/

    document.getElementById("userInputBox").value = ''; // empty the input box
}