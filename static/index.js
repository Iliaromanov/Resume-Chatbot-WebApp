//=============Even listener configurations================
// Ensure page does not refresh on form submit
let msgForm = document.getElementById("messageForm")
function stopRefresh(event) {event.preventDefault();}
msgForm.addEventListener('submit', stopRefresh)

// Allow submission of textarea input with enter key
document.getElementById(
    "userInputBox"
).addEventListener("keypress", submitTextareaOnEnter)


let keepChatScrollDown = setInterval(scrollDown, 1);  // scroll down in chat div every millisecond
let scrollPaused = false;  // when paused the scroll won't scroll down
// Disable chat scrolldown when user scrolls up
$("#chat_history").bind("mousewheel", (event) => {
    if (event.originalEvent.wheelDelta > 0) {
        document.querySelector("#autoScroll").checked = false
    } else {
        let chatHistoryDiv = document.querySelector("#chat_history")
        if (chatHistoryDiv.scrollTop === chatHistoryDiv.scrollHeight) {
            document.querySelector("#autoScroll").checked = true
        }
    }
})
//=========================================================

// Properties for storing chatbot response info for feedback
let props = {
    previousUserMsg: null,
    previousChatBotResponse: null,
    currentUserMsg: null,
    currentChatBotResponse: null,
    responseProbs: null
}


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

    if (!msg) return;

    props.userMsg = msg;

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

    toggleFeedbackButtons(false, false);

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

        if (data.top_category === "iliaBOT_options" || data.top_category === "bio") { // deal with options slider
            createOptionsWidget(
                ["Skills 🤹‍♂️", "Work Experience 💼", "Projects 💡", "Education 🎓"],
                [createSkillsWidget, createWorkExperienceWidget, createProjectsWidget, createEducationWidget]
            );
        }

        switch (data.top_category) {
            case "skills":
                responseContainer.remove() // this container was only used to display loading gif while fetching
                createSkillsWidget();
                break;
            case "experience":
                responseContainer.remove()
                createWorkExperienceWidget()
                break;
            case "projects":
                responseContainer.remove()
                createProjectsWidget();
                break;
            case "education":
                responseContainer.remove()
                createEducationWidget();
                break;
            case "Desktop-Controller":
                responseContainer.remove()
                createDesktopControllerWidget()
                break;
            case "about_chatbot":
                responseContainer.remove()
                createIliaBotWidget()
                break;
            case "Stock-Trade":
                responseContainer.remove()
                createStockTradeWidget()
                break;
            case "Door-Detection":
                responseContainer.remove()
                createDoorDetectionWidget()
                break;
            case "show_resume":
                responseContainer.remove()
                createResumeWidget()
                break;
        }

        toggleFeedbackButtons(false, true);

    }).catch((e) => {
        let whoopsTag = document.createElement("p")
        whoopsTag.innerHTML = "Whoops something went wrong :( Please try again."
        responseMsgDiv.appendChild(whoopsTag)

        console.log(e)
    })/**/

    document.getElementById("userInputBox").value = ''; // empty the input box
}