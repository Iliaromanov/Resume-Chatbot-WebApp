
//=============Even listener configurations================
// Ensure page does not refresh on form submit
let msgForm = document.getElementById("messageForm")
function stopRefresh(event) {event.preventDefault();}
msgForm.addEventListener('submit', stopRefresh)

// Allow submission of textarea input with enter key
document.getElementById(
    "userInputBox"
).addEventListener("keypress", submitTextareaOnEnter)
//=========================================================


// Send initial greeting
sendInitialGreeting();


function fetchChatbotResponse(responseDiv, msg) {
    responseDiv.appendChild(createLoadingGif())
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

    // use helper to create response container
    let responseDivElems = createBotMsgContainer();
    let responseContainer = responseDivElems[1];
    let responseMsgDiv = responseDivElems[0];
    chatHistoryDiv.appendChild(responseContainer)

    fetchChatbotResponse(responseMsgDiv, msg)
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

        let slider = document.getElementById('optionsDivContainer');
        if (data.top_category === "iliaBOT_options" || data.top_category === "bio") {
            addOptionsDiv(slider)
        } else {
            if (slider) {
                slider.remove()
            }
            if (data.top_category === "projects") {
                createProjectsWidget()
            }
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