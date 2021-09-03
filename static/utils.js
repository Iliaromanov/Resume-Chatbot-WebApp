
const scrollDown = () => {
    // Scrolls to bottom of chat history div
    if (paused) return;

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
    loadingGif.src = "/static/images/new_loading.gif"
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
        1500
    );
    await sendMsg(
        "Ask me anything specific, or choose one of the options below and I can get the conversation rolling :)",
        1000
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
        $(`
            <div id="optionsDivContainer">
                <div id='optionsDiv'>
                    <div class="optionChip" onclick="createSkillsWidget()">Skills 🤹‍♀️</div>
                    <div class="optionChip">Work Experience 💼</div>
                    <div class="optionChip" onclick="createProjectsWidget()">Projects 💡</div>
                    <div class="optionChip">Education 🎓</div>
<!--                    <div class="optionChip">About IliaBOT 🤔</div>-->
                </div>
<!--                <p style="font-size: 10px; margin-top: -10px; margin-left: 5px">-->
<!--                    Drag to scroll-->
<!--                </p>-->
            </div>
        `).appendTo( '#chat_history' )

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


//===================Collapsable Widget Generation================================//
const createCollapsablesContainer = (titleArr, bodyArr) => {
    // Takes in an array of titles and corresponding array of body jQuery html elements
    // and creates a container with collapsable widgets

    let collapsablesDiv = document.createElement("div")
    collapsablesDiv.className = "collapsablesDiv"

    for (let i = 0; i < titleArr.length; i++) {
        let collapsableHeader = document.createElement("button")
        collapsableHeader.className = "collapsableHeader"
        collapsableHeader.innerHTML = titleArr[i]
        collapsablesDiv.appendChild(collapsableHeader)

        let panel = document.createElement("div")
        panel.className = "panel"
        bodyArr[i].appendTo(panel)
        collapsablesDiv.appendChild(panel)

        collapsableHeader.addEventListener("click", () => {
            collapsableHeader.classList.toggle("activeHeader")

            if (panel.style.maxHeight) {
                panel.style.maxHeight = null
                panel.style.border = null
                let title = collapsableHeader.innerHTML
                collapsableHeader.innerHTML = "+" + title.slice(1, title.length)
            } else {
                panel.style.maxHeight = panel.scrollHeight + "px"
                panel.style.border = "1px solid black"
                let title = collapsableHeader.innerHTML
                collapsableHeader.innerHTML = "-" + title.slice(1, title.length)
            }
        })
    }

    return collapsablesDiv
}


//===================Specific Collapsable Widgets Generation======================//
const createProjectsWidget = () => {
    // creates and appends projects widget to chat_history div

    let existingProjectsDiv = document.getElementById("projectsWidget")
    if (existingProjectsDiv) { // if it already exists, just move it to the bottom
        document.getElementById("chat_history").appendChild(existingProjectsDiv)
        return;
    }

    let chatbot = $(`
        <p style="font-size: 17.5px">
        Designed and built the web app you are using right now, as well as the keras neural network model for the
        chatbot used in the backend of this app and an NLP pipeline API that acts as a microservice for this website.
        </p>
        <div class="skillsSection">
            <b style="text-align: center">Tech Used:</b> 
            <div class="skillsChipsContainer">
                <div class="skillChip">Python</div><div class="skillChip">Flask</div><div class="skillChip">FastAPI</div>
                <div class="skillChip">JavaScript</div><div class="skillChip">jQuery</div><div class="skillChip">Keras</div>
                <div class="skillChip">Pandas</div><div class="skillChip">Numpy</div><div class="skillChip">NLTK</div>
                <div class="skillChip">HTML5</div><div class="skillChip">CSS</div><div class="skillChip">Git</div>
            </div>
        </div>
        <p style="margin-bottom: -3px; text-align: center">Check out the code for this web app 
        <a href="https://github.com/Iliaromanov/Resume-Chatbot-WebApp">here</a>!</p>
        <p style="margin-bottom: -3px; text-align: center">Check out the code for the model development process and CLI version of the chatbot
        <a href="https://github.com/Iliaromanov/Resume-Chatbot-Model">here</a>!</p>
        <p style="text-align: center">Check out the code for the NLP-pipeline-API
        <a href="https://github.com/Iliaromanov/nlp-pipeline-API">here</a>!</p>
    `)

    let desktopController = $(`
        <p style="font-size: 17.5px">
            Created a computer vision based alternative to a physical mouse and keyboard allowing intuitive hand gesture
            based control of mouse motion and mouse buttons, a hand gesture based master volume slider for convinience, 
            and speech to text typing functionality also triggered by hand gesture.
        </p>
        <div class="skillsSection">
            <b style="text-align: center">Tech Used:</b> 
            <div class="skillsChipsContainer">
                <div class="skillChip">Python</div><div class="skillChip">OpenCV</div>
                <div class="skillChip">Mediapipe</div><div class="skillChip">Numpy</div>
                <div class="skillChip">Google web speech-to-text API</div><div class="skillChip">Git</div>
            </div>
        </div>
        <p style="text-align: center">
            Check out the demo and code for this project 
            <a href="https://github.com/Iliaromanov/AI-Based-Desktop-Controller">here</a>!
        </p>
    `)

    let stockTrade = $(`
        <p style="font-size: 17.5px">
            Built a web app that allows users to track real-time stock prices, providing users with personal accounts 
            including stock portfolios and transaction histories.
        </p>
        <div class="skillsSection">
            <b style="text-align: center">Tech Used:</b> 
            <div class="skillsChipsContainer">
                <div class="skillChip">Python</div><div class="skillChip">Flask</div>
                <div class="skillChip">PostgreSQL</div><div class="skillChip">IEX Cloud API</div>
                <div class="skillChip">HTML</div><div class="skillChip">CSS</div><div class="skillChip">Git</div>
            </div>
        </div>
        <p style="margin-bottom: -3px; text-align: center">Check out the $tock Trade website <a href="https://ilia-stock-trade.herokuapp.com/">here</a>!</p>
        <p style="text-align: center">Check out the code for this project <a href="https://github.com/Iliaromanov/Stock-Trade">here</a>!</p>
    `)

    let doorDetection = $(`
        <p style="font-size: 17.5px">
            Worked on a small team for nwHacks 2021 to build a neural network model based program for detecting whether a 
            door is open or closed given ultrasonic sensor data obtained by a microcontroller such as an ESP32.
        </p>
        <div class="skillsSection">
            <b style="text-align: center">Tech Used:</b> 
            <div class="skillsChipsContainer">
                <div class="skillChip">Python</div><div class="skillChip">Tensorflow</div>
                <div class="skillChip">Pandas</div><div class="skillChip">Numpy</div><div class="skillChip">Seaborn</div>
                <div class="skillChip">C/C++</div><div class="skillChip">Git</div>
            </div>
        </div>
        <p style="text-align: center">Check out the code for this project <a href="https://github.com/Iliaromanov/Door-Detection">here</a>!</p>
    `)

    let solitaire = $(`
        <p style="font-size: 17.5px">
            Recreated the solitaire card game using Object-Oriented Programming in Python.
        </p>
        <div class="skillsSection">
            <b style="text-align: center">Tech Used:</b> 
            <div class="skillsChipsContainer">
                <div class="skillChip">Python</div><div class="skillChip">Arcade</div><div class="skillChip">Git</div>
            </div>
        </div>
        <p style="text-align: center">Check out the code for this project <a href="https://github.com/Iliaromanov/Solitaire">here</a>!</p>
    `)

    let projectsWidget = createCollapsablesContainer(
        [
            "+  AI Based Desktop Controller ⌨",
            "+  IliaBOT - Resume Chatbot 🤖",
            "+  $tock Trade 📈",
            "+  Door Detection 🚪",
            // "+  Solitaire 🃏"
        ],
        [desktopController, chatbot, stockTrade, doorDetection]
    )
    projectsWidget.id = "projectsWidget"

    // append to chat_history
    document.getElementById("chat_history").appendChild(projectsWidget)
}

const createSkillsWidget = () => {
    // creates and appends skills widget to chat_history div

    let existingSkillsDiv = document.getElementById("skillsWidget")
    if (existingSkillsDiv) { // if it already exists, just move it to the bottom
        document.getElementById("chat_history").appendChild(existingSkillsDiv)
        return;
    }

    let langs = $(`
        <div class="skillsChipsContainer" style="padding: 8px">
            <div class="skillChip">Python</div><div class="skillChip">JavaScript</div><div class="skillChip">SQL</div>
            <div class="skillChip">HTML/CSS</div><div class="skillChip">Go</div><div class="skillChip">C/C++</div>
            <div class="skillChip">R</div>
        </div>
    `)

    let libsAndFrameworks = $(`
        <div class="skillsChipsContainer" style="padding: 8px">
            <div class="skillChip">Flask</div><div class="skillChip">Django</div><div class="skillChip">FastAPI</div>
            <div class="skillChip">jQuery</div><div class="skillChip">Tensorflow</div>
            <div class="skillChip">Keras</div><div class="skillChip">Pandas</div>
            <div class="skillChip">Numpy</div><div class="skillChip">OpenCV</div>
            <div class="skillChip">Mediapipe</div><div class="skillChip">NLTK</div><div class="skillChip">SpcaCy</div>
        </div>
    `)

    let databases = $(`
        <div class="skillsChipsContainer" style="padding: 8px">
            <div class="skillChip">PostgreSQL</div><div class="skillChip">MongoDB</div>
            <div class="skillChip">Microsoft SQL Server</div><div class="skillChip">Oracle Database</div>
            <div class="skillChip">Apache Hive</div>
        </div>
    `)

    let toolsAndOtherTech = $(`
        <div class="skillsChipsContainer" style="padding: 8px">
            <div class="skillChip">Git</div><div class="skillChip">Docker</div><div class="skillChip">Postman</div>
            <div class="skillChip">Jupyter Notebook</div>
        </div>
    `)

    let skillssWidget = createCollapsablesContainer(
        [
            "+  Programming Languages",
            "+  Libraries and Frameworks",
            "+  Databases",
            "+  Other Tools and Technologies",
        ],
        [langs, libsAndFrameworks, databases, toolsAndOtherTech]
    )
    skillssWidget.id = "skillsWidget"

    // append to chat_history
    document.getElementById("chat_history").appendChild(skillssWidget)
}

