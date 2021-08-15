// Ensure page does not refresh on form submit
let msgForm = document.getElementById("message_form")
function stopRefresh(event) {event.preventDefault();}
msgForm.addEventListener('submit', stopRefresh)

function scrollDown() {
    let chatHistoryDiv = document.getElementById("chat_history")
    chatHistoryDiv.scrollTop = chatHistoryDiv.scrollHeight
}

function getChatbotResponse() {
    /* Sends POST request to Flask route that passes msg to the DNN model and returns prediction results
       then updates chat history div
    */
    let msg = document.getElementById("message").value
    let chatHistoryDiv = document.getElementById("chat_history")
    console.log(msg)

    if (!msg) {
        return;
    }

    let sentMsgDiv = document.createElement("div")
    let innerTag = document.createElement("p")
    let innerTag1 = document.createElement("p")
    innerTag1.innerHTML = "You"
    let innerTag2 = document.createElement("p")
    innerTag2.innerHTML = msg
    sentMsgDiv.appendChild(innerTag1)
    sentMsgDiv.appendChild(innerTag2)
    sentMsgDiv.className = "user_sent_msg"

    chatHistoryDiv.appendChild(sentMsgDiv)
    scrollDown()

    fetch(`/get_response?msg=${msg}`, {
        method: "POST",
        headers: {'Content-Type': 'application/x-www-form-urlencoded'}
    }).then((response) => {
        console.log(response)
        return response.json()
    }).then((data) => {
        let probs = data.top_three_predictions
        console.log(probs)

        let responseMsgDiv = document.createElement("div")
        let innerTag1 = document.createElement("p")
        innerTag1.innerHTML = "Chatbot"
        let innerTag2 = document.createElement("p")
        innerTag2.innerHTML = JSON.stringify(probs)
        responseMsgDiv.appendChild(innerTag1)
        responseMsgDiv.appendChild(innerTag2)
        responseMsgDiv.className = "chatbot_response"

        chatHistoryDiv.appendChild(responseMsgDiv)
        scrollDown()
    })

    document.getElementById("message").value = ''; // empty the input box
}