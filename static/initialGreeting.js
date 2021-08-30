/*
The initial greeting msg is created and sent here and the draggable option chips for main intents is created here
*/
// Script for sending initial messages more naturally
//   instead of them rendering with the page right away
sendMsg (
    "Hi there👋! I'm Ilia's Resume Chatbot, thanks for taking the time to chat with me!",
    2000
).then((nothing) => {
    sendMsg (
        "Ask me anything specific, or choose one of the options below and I can get the conversation rolling :)",
        1500
    )
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