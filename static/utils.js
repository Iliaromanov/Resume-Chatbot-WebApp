
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

    loadingGif.remove()
    msg.appendTo(responseMsgDiv)  // append jquery msg body to responseMsgDiv
}


const sendInitialGreeting = async () => {
    // Sends initial greeting message and shows user main options
    await sendMsg(
        $(`<p>Hi there👋! I'm Ilia's Resume Chatbot, IliaBOT, thanks for taking the time to chat with me!</p>`),
        1500
    );
    await sendMsg(
        $(`<p>Ask me anything specific, or choose one of the options below and I can get the conversation rolling :)</p>`),
        1000
    );
    createOptionsWidget(
        ["Skills 🤹‍♀️", "Work Experience 💼", "Projects 💡", "Education 🎓"],
        [createSkillsWidget, createWorkExperienceWidget, createProjectsWidget, createEducationWidget]
    );
}


//===================Draggable Option Chips================================//
let isDown = false;
let startX;
let scrollLeft;

function createOptionsWidget(options, onclicks) {
    // takes in an array of options and corresponding onclicks and creates option bubbles

    let existingOptionsSlider = document.getElementById('optionsDivContainer')
    if (existingOptionsSlider) {
        existingOptionsSlider.remove();
    }

    // Create main container (for chips and maybe "Drag to Scroll"
    let container = document.createElement("div")
    container.id = "optionsDivContainer"

    // Create div for chips
    let optionsDiv = document.createElement("div")
    optionsDiv.id = "optionsDiv"

    // Add option chips to optionsDiv
    for (let i = 0; i < options.length; i++) {
        let chip = document.createElement("div")
        chip.className = "optionChip"
        chip.innerHTML = options[i]
        chip.onclick = onclicks[i]
        optionsDiv.appendChild(chip)
    }
    container.appendChild(optionsDiv)
    document.getElementById('chat_history').appendChild(container)

    optionsDiv.addEventListener('mousedown', (e) => {
      isDown = true;
      optionsDiv.classList.add('active');
      startX = e.pageX - optionsDiv.offsetLeft;
      scrollLeft = optionsDiv.scrollLeft;
    });
    optionsDiv.addEventListener('mouseleave', () => {
      isDown = false;
      optionsDiv.classList.remove('active');
    });
    optionsDiv.addEventListener('mouseup', () => {
      isDown = false;
      optionsDiv.classList.remove('active');
    });
    optionsDiv.addEventListener('mousemove', (e) => {
      if(!isDown) return;
      e.preventDefault();
      const x = e.pageX - optionsDiv.offsetLeft;
      const walk = (x - startX) * 3; //scroll-fast
      optionsDiv.scrollLeft = scrollLeft - walk;
    });
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
        Designed and built the web app you are using right now, as well as the Keras neural network model for the
        chatbot used in the backend of this app and an NLP pipeline REST API that acts as a microservice for this website.
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

const createSkillsWidget = async () => {
    // creates and appends skills widget to chat_history div
    let existingSkillsDiv = document.getElementById("skillsWidget")
    if (existingSkillsDiv) { // if it already exists, just move it to the bottom
        document.getElementById("chat_history").appendChild(existingSkillsDiv)
        document.getElementById("skillsMsgBefore").parentElement.parentElement.remove()
        document.getElementById("skillsMsgAfter").parentElement.parentElement.remove()
    } else {
        await sendMsg(
            $(`<p id="skillsMsgBefore">
                    Ilia is a strong believer in lifelong learning and is constantly looking to expand his skill set.
                    Here are some of his current technical skills 👨‍💻
               </p>`),
            400
        )
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

    await sendMsg(
        $(`
             <p id="skillsMsgAfter">To see where Ilia has applied these skills, you can take a look at:
             </p>
        `),
        0
    )
    createOptionsWidget(
        ["Projects 💡", "Work Experience 💼"],
        [createProjectsWidget, createWorkExperienceWidget]
    );
}


const createEducationWidget = () => {
    let existingEducationDiv = document.getElementById("educationWidget")
    if (existingEducationDiv) { // if it already exists, just move it to the bottom
        document.getElementById("educationMsgBefore").parentElement.parentElement.remove()

        sendMsg(
            $(`<p id="educationMsgBefore">Here's some info on Ilia's education 🎓 </p>`),
            0
        )
        document.getElementById("chat_history").appendChild(existingEducationDiv)
    } else {
        sendMsg(
            $(`<p id="educationMsgBefore">Here's some info on Ilia's education 🎓 </p>`),
            500
        )

        let uw = $(`
            <p style="font-size: 17.5px"><b>Bachelor of Computer Science (BCS) Sep 2020 - Apr 2025</b></p>
            <b>Achievements:</b>
            <ul style="margin-top: -0.1px">
                <li>Cumulative GPA: 94.1%</li>
                <li>Term Distinction: Fall 2020, Winter 2021</li>
                <li>Presidents Scholarship of Distinction recipient</li>
            </ul>
            <b>Notable Courses:</b>
            <ul style="margin-top: -0.1px">
                <li>Object-Oriented Software Development (C++, Unix)</li>
                <li>Elementary Algorithm Design and Data Abstraction (C)</li>
                <li>Probability (R)</li>
                <li>Computer Organization and Design (RISC Assembly Language)</li>
            </ul>
            
        `)

        let online = $(`
            <b>Kaggle:</b>
            <ul style="margin-top: -0.1px">
                <li>Deep Learning (Python, Tensorflow, Keras)</li>
                <li>Natural Language Processing (Python, SpaCy)</li>
                <li>Computer Vision (Python, Tensorflow, Keras)</li>
                <li>Intro to Machine Learning (Python, Scikit-Learn, Pandas, NumPy)</li>
                <li>Intro to SQL (Python, SQL, Google BigQuery)</li>
            </ul>
            
            <b>DeepLearning.ai:</b>
            <ul style="margin-top: -0.1px">
                <li>Neural Networks and Deep Learning Theory (Python, NumPy)</li>
            </ul>
            
            <b>freeCodeCamp:</b>
            <ul style="margin-top: -0.1px">
                <li>Advanced Computer Vision (Python, OpenCV, Mediapipe)</li>
            </ul>
        `)

        let educationWidget = createCollapsablesContainer(
            [
                "+  University of Waterloo",
                "+  Online Courseware"
            ],
            [uw, online]
        )
        educationWidget.id = "educationWidget"

        // append to chat_history
        document.getElementById("chat_history").appendChild(educationWidget)
    }
}

const createWorkExperienceWidget = () => {
    //
}