
const scrollDown = () => {
    // Scrolls to bottom of chat history div
    if ($('#autoScroll').get(0).checked) {
        scrollPaused = false
        let chatHistoryDiv = document.querySelector('#chat_history')
        chatHistoryDiv.scrollTop = chatHistoryDiv.scrollHeight
    } else {
        scrollPaused = true
        return
    }

    // if (scrollPaused) {
    //     $('#chat_history').stop();
    // } else {
    //     $('#chat_history').animate({scrollTop: $('#chat_history').get(0).scrollHeight},
    //         {duration: 500, start: function() {if (scrollPaused) {$('#chat_history').stop(); console.log("pause")}}}
    //     )
    // }
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
        $(`<p>Ask me anything specific in the chat, or choose one of the options below, and I can get the conversation rolling :)</p>`),
        1000
    );
    createOptionsWidget(
        ["Skills 🤹‍♂️", "Projects 💡", "Work Experience 💼", "Education 🎓"],
        [createSkillsWidget, createProjectsWidget, createWorkExperienceWidget, createEducationWidget]
    );
}


//===================Draggable Option Chips================================//
let isDown = false;
let startX;
let scrollLeft;

function createOptionsWidget(options, onclicks, showDragToScroll) {
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
        chip.addEventListener("click", onclicks[i])
        chip.addEventListener("click", () => {
            let optionsDiv = document.getElementById('optionsDivContainer')
            if (optionsDiv) {
                optionsDiv.remove();
            }
        })
        optionsDiv.appendChild(chip)
    }

    container.appendChild(optionsDiv)
    if (showDragToScroll) {
        $(`<p style="font-size: 10px; margin-top: -10px; margin-left: 5px">Drag to scroll</p>`).appendTo(container)
    }
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

        collapsableHeader.addEventListener("click", async () => {
            collapsableHeader.classList.toggle("activeHeader")

            if (panel.style.maxHeight) {
                panel.style.maxHeight = null
                panel.style.border = null
                panel.style.paddingBottom = null
                let title = collapsableHeader.innerHTML
                collapsableHeader.innerHTML = "+" + title.slice(1, title.length)  // when closed title has +
                // scrollPaused = false
            } else {
                panel.style.maxHeight = panel.scrollHeight + "px"
                panel.style.border = "1px solid black"
                panel.style.paddingBottom = "8px"

                // special case for work experience widget
                if (panel.parentElement.id == "experienceWidget") {
                    panel.style.paddingBottom = "11px"
                }

                let title = collapsableHeader.innerHTML
                collapsableHeader.innerHTML = "-" + title.slice(1, title.length)  // when open title has -
                // document.getElementById("chat_history").scrollTo(collapsableHeader.scrollHeight)
                // scrollPaused = true
            }
        })
    }

    return collapsablesDiv
}


//===================Specific Collapsable Widgets Generation======================//
const createProjectsWidget = async () => {
    // creates and appends projects widget to chat_history div

    let existingProjectsDiv = document.getElementById("projectsWidget")
    if (existingProjectsDiv) { // if it already exists, just move it to the bottom
        document.getElementById("projectsMsgBefore").parentElement.parentElement.remove()
        await sendMsg(
            $(`<p id="projectsMsgBefore">
                Here's another look at Ilia's projects💡
                </p>`),
            0
        )
        document.getElementById("chat_history").appendChild(existingProjectsDiv)
        document.getElementById("projectsMsgAfter").remove()
    } else {
        await sendMsg(
            $(`<p id="projectsMsgBefore">
                Ilia loves to take on new projects to expand his skill set. Here are some brief overviews of his 
                notable projects💡 
                </p>`),
            200
        )

        let chatbot = $(`
            <p style="font-size: 17.5px">
            Designed and built the web app you are using right now, as well as the Keras neural network model for the
            chatbot used in the backend of this app and an NLP pipeline REST API that acts as a microservice for this 
            website to preprocess the raw text data inputted in the chat below.
            </p>
            <div class="skillsSection" style="margin-bottom: 5px">
                <b style="text-align: center">Tech Used:</b> 
                <div class="skillsChipsContainer">
                    <div class="skillChip">Python</div><div class="skillChip">Flask</div><div class="skillChip">FastAPI</div>
                    <div class="skillChip">JavaScript</div><div class="skillChip">jQuery</div><div class="skillChip">Keras</div>
                    <div class="skillChip">Pandas</div><div class="skillChip">Numpy</div><div class="skillChip">NLTK</div>
                    <div class="skillChip">HTML5</div><div class="skillChip">CSS</div><div class="skillChip">Git</div>
                </div>
            </div>
            <p style="margin: 1px; text-align: center">Check out the code for this web app 
            <a href="https://github.com/Iliaromanov/Resume-Chatbot-WebApp" target="_blank">here</a>!</p>
            <p style="margin: 1px; text-align: center">Check out the code for the model development process and CLI version of the chatbot
            <a href="https://github.com/Iliaromanov/Resume-Chatbot-Model" target="_blank">here</a>!</p>
            <p style="margin: 1px; text-align: center">Check out the code for the NLP-pipeline-API
            <a href="https://github.com/Iliaromanov/nlp-pipeline-API" target="_blank">here</a>!</p>
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
                    <div class="skillChip">Mediapipe</div><div class="skillChip">NumPy</div>
                    <div class="skillChip">Google web speech-to-text API</div><div class="skillChip">Git</div>
                </div>
            </div>
            <p style="text-align: center">
                Check out the code and super cool demo for this project 
                <a href="https://github.com/Iliaromanov/AI-Based-Desktop-Controller" target="_blank">here</a>!
            </p>
        `)

        let stockTrade = $(`
            <p style="font-size: 17.5px">
                Built a web app that allows users to simulate buying and selling stocks, providing users with personal accounts 
                including stock portfolios and transaction histories.
            </p>
            <div class="skillsSection" style="margin-bottom: 5px">
                <b style="text-align: center">Tech Used:</b> 
                <div class="skillsChipsContainer">
                    <div class="skillChip">Python</div><div class="skillChip">Flask</div>
                    <div class="skillChip">PostgreSQL</div><div class="skillChip">IEX Cloud API</div>
                    <div class="skillChip">HTML</div><div class="skillChip">CSS</div><div class="skillChip">Git</div>
                </div>
            </div>
            <p style="margin: 1px; text-align: center">Check out the $tock Trade website <a href="https://ilia-stock-trade.herokuapp.com/" target="_blank">here</a>!</p>
            <p style="margin: 1px; text-align: center">Check out the code for this project <a href="https://github.com/Iliaromanov/Stock-Trade" target="_blank">here</a>!</p>
        `)

        let doorDetection = $(`
            <p style="font-size: 17.5px">
                Worked on a 3-person team for nwHacks 2021 to build a neural network model based program for detecting whether a 
                door is open or closed given ultrasonic sensor data obtained by a microcontroller such as an ESP32.
            </p>
            <div class="skillsSection">
                <b style="text-align: center">Tech Used:</b> 
                <div class="skillsChipsContainer">
                    <div class="skillChip">Python</div><div class="skillChip">Tensorflow</div>
                    <div class="skillChip">Pandas</div><div class="skillChip">NumPy</div><div class="skillChip">Seaborn</div>
                    <div class="skillChip">C/C++</div><div class="skillChip">Git</div>
                </div>
            </div>
            <p style="text-align: center">Check out the code for this project <a href="https://github.com/Iliaromanov/Door-Detection" target="_blank">here</a>!</p>
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
            <p style="text-align: center">Check out the code for this project <a href="https://github.com/Iliaromanov/Solitaire" target="_blank">here</a>!</p>
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
    await sendMsg(
        $(`<p id="projectsMsgAfter">
        For more details on a specific project,
        choose one of the options below, or just send its name in the chat</p>`),
        200
    )
    createOptionsWidget(
        [
                "Desktop Controller ⌨",
                "IliaBOT 🤖",
                "$tock Trade 📈",
                "Door Detection 🚪",
                // "+  Solitaire 🃏"
            ],
        [createDesktopControllerWidget, createIliaBotWidget, createStockTradeWidget, createDoorDetectionWidget],
        true
    )
}

const createSkillsWidget = async () => {
    // creates and appends skills widget to chat_history div
    let existingSkillsDiv = document.getElementById("skillsWidget")
    if (existingSkillsDiv) { // if it already exists, just move it to the bottom
        document.getElementById("skillsMsgBefore").parentElement.parentElement.remove()
        await sendMsg(
            $(`<p id="skillsMsgBefore">
                    Here's another look at some of Ilia's skills 👨‍💻 
               </p>`),
            0
        )
        document.getElementById("chat_history").appendChild(existingSkillsDiv)
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
                <div class="skillChip">Python</div><div class="skillChip">C++</div><div class="skillChip">Go</div><div class="skillChip">JavaScript</div>
                <div class="skillChip">Java</div><div class="skillChip">HTML/CSS</div>
            </div>
        `)

        let libsAndFrameworks = $(`
            <div class="skillsChipsContainer" style="padding: 8px">
                <div class="skillChip">Flask</div><div class="skillChip">FastAPI</div>
                <div class="skillChip">React</div>
                <div class="skillChip">jQuery</div><div class="skillChip">Tensorflow</div>
                <div class="skillChip">Keras</div><div class="skillChip">Pandas</div>
                <div class="skillChip">NumPy</div><div class="skillChip">Matplotlib</div><div class="skillChip">OpenCV</div>
                <div class="skillChip">Mediapipe</div><div class="skillChip">NLTK</div><div class="skillChip">SpaCy</div>
            </div>
        `)

        let toolsAndOtherTech = $(`
            <div class="skillsChipsContainer" style="padding: 8px">
                <div class="skillChip">Git</div><div class="skillChip">AWS</div>
                <div class="skillChip">Docker</div><div class="skillChip">SQL</div>
                <div class="skillChip">Postman</div>
            </div>
        `)

        let skillssWidget = createCollapsablesContainer(
            [
                "+  Programming Languages",
                "+  Libraries and Frameworks",
                "+  Other Tools and Technologies",
            ],
            [langs, libsAndFrameworks, toolsAndOtherTech]
        )
        skillssWidget.id = "skillsWidget"

        // append to chat_history
        document.getElementById("chat_history").appendChild(skillssWidget)
    }

    await sendMsg(
        $(`
             <p id="skillsMsgAfter">To see where Ilia has applied these skills, you can take a look at
             </p>
        `),
        0
    )
    createOptionsWidget(
        ["Projects 💡", "Work Experience 💼"],
        [createProjectsWidget, createWorkExperienceWidget]
    );
}


const createEducationWidget = async () => {
    let existingEducationDiv = document.getElementById("educationWidget")
    if (existingEducationDiv) { // if it already exists, just move it to the bottom
        document.getElementById("educationMsgBefore").parentElement.parentElement.remove()

        await sendMsg(
            $(`<p id="educationMsgBefore">Here's some info on Ilia's education 🎓 </p>`),
            0
        )
        document.getElementById("chat_history").appendChild(existingEducationDiv)
    } else {
        await sendMsg(
            $(`<p id="educationMsgBefore">Here's some info on Ilia's education 🎓 </p>`),
            500
        )

        let uw = $(`
            <p style="font-size: 17.5px"><b>Bachelor of Computer Science (BCS) Sep 2020 - Apr 2025</b></p>
            <b>Achievements:</b>
            <ul style="margin-top: -0.1px">
                <li>Cumulative GPA: 91%</li>
                <li>Term Distinction: Fall 2020, Winter 2021, Spring 2022, Winter 2023</li>
                <li>Presidents Scholarship of Distinction recipient</li>
                <li>International Experience Award recipient</li>
            </ul>
            <b>Notable Courses:</b>
            <ul style="margin-top: -0.1px">
                <li>Algorithms (C++)</li>
                <li>Data Structures (C++)</li>
                <li>Machine Learning (Python, Scikit-Learn, Numpy, Pandas)</li>
                <li>Computer Networks (Java, Docker)</li>
                <li>Databases (SQL)</li>
                <li>Object-Oriented Software Development (C++, Unix)</li>
                <li>Functional Programming (Racket)</li>
                <li>Statistics (R)</li>
                <li>Computer Organization and Design (ARMv8, C)</li>
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
                "+  Online Certifications"
            ],
            [uw, online]
        )
        educationWidget.id = "educationWidget"

        // append to chat_history
        document.getElementById("chat_history").appendChild(educationWidget)
    }
}

const createWorkExperienceWidget = async () => {
    let existingExperienceDiv = document.getElementById("experienceWidget")
    if (existingExperienceDiv) { // if it already exists, just move it to the bottom
        document.getElementById("experienceMsgBefore").parentElement.parentElement.remove()

        await sendMsg(
            $(`<p id="experienceMsgBefore">Here's Ilia's work experience 💼 again </p>`),
            0
        )
        document.getElementById("chat_history").appendChild(existingExperienceDiv)
    } else {
        await sendMsg(
            $(`<p id="experienceMsgBefore">Ilia's work experience💼 </p>`),
            500
        )

        let opta = $(`
            <b style="font-size: 13.5px"><b style="font-size: 15.5px">Software Developer Co-op</b><br>
            <a href="https://optaintel.ca/" target="_blank" style="text-decoration: none; color: black"> 
            (Opta Information Intelligence</a> May-Aug 2021)</b>
            <ul style="margin-top: -0.1px; margin-bottom: 10px; font-size: 15.5px; list-style-position: outside; padding-left: 1em;">
                <li>Built a <b>Convolutional Neural Network</b> model using Keras to classify report pages with <b>>90% prediction
                accuracy</b>.</li>
                <li>Designed a <b>full-stack web app</b> around the Keras CNN model using JavaScript/jQuery for a 
                dynamic frontend, Python, Flask, Tensorflow, and Pandas for the backend which preprocesses image data and 
                applies the Keras CNN model.</li>
                <li style="margin-bottom: 10px">Wrote Python script using the SpaCy NLP library and threading to parse <b>>1.5 billion rows</b> of unusable 
                raw text data from a SQL Server database into usable categorical data with <b>94% parsing accuracy</b>.</li>
<!--                <li style="margin-bottom: 10px">Worked as member of an <b>agile scrum</b> team to build and document several-->
<!--                 <b>APIs and microservices</b> utilizing Python, Flask, JavaScript, jQuery, with-->
<!--                 MongoDB and Docker.</li>-->
            </ul>
        `)

        let esentire = $(`
            <b style="font-size: 13.5px"><b style="font-size: 15.5px">Backend Developer Co-op</b><br>
            <a href="https://www.esentire.com/" target="_blank" style="text-decoration: none; color: black"> 
            (eSentire Inc.</a> Jan-Apr 2022)</b>
            <ul style="margin-top: -0.1px; margin-bottom: 10px; font-size: 15.5px; list-style-position: outside; padding-left: 1em;">
                <li> Implemented concurrent self-invocations in <b>Python based AWS Lambda</b>, raising computation speed by <b>400%</b>.</li>
                <li> Migrated two large scale <b>Python Flask REST APIs</b> to use <b>API Gateway</b> triggered <b>AWS Lambdas</b>, including database components
                using <b>DynamoDB</b>, <b>Terraform</b> code, and <b>Docker</b> files for deployment.</li>
                <li> Ensured <b>95% unit test coverage</b> across several <b>Python backend APIs and SDKs</b> using <b>PyTest</b>.</li>
                <li style="margin-bottom: 10px">Wrote report on integrating <b>OAuth 2.0</b> with existing internal API for user authentication..</li>
            </ul>
        `)

        let sidefx = $(`
            <b style="font-size: 13.5px"><b style="font-size: 15.5px">CG Pipeline Developer Co-op</b><br>
            <a href="https://www.sidefx.com/" target="_blank" style="text-decoration: none; color: black"> 
            (SideFX Inc.</a> Sep-Dec 2022)</b>
            <ul style="margin-top: -0.1px; margin-bottom: 10px; font-size: 15.5px; list-style-position: outside; padding-left: 1em;">
                <li> Built tool for automated virtual environment creation using <b>Python</b> to improve machine learning workflows.</li>
                <li> Added grouping functionality to task distribution tool using <b>C++</b> and thread safe data structures from <b>TBB</b> template library.</li>
                <li> Restored <b>PyTorch</b> GAN model and associated data pipeline to simulate 3D terrain erosion with <b>90% accuracy</b>.</li>
                <li style="margin-bottom: 10px"> Implemented features for desktop app GUI, writing interconnected <b>Python</b> and <b>C++</b> modules using <b>Qt</b>.</li>
            </ul>
        `)

        let capitalone = $(`
            <b style="font-size: 13.5px"><b style="font-size: 15.5px">Software Engineer Intern</b><br>
            <a href="https://www.sidefx.com/" target="_blank" style="text-decoration: none; color: black"> 
            (SideFX Inc.</a> Sep-Dec 2022)</b>
            <ul style="margin-top: -0.1px; margin-bottom: 10px; font-size: 15.5px; list-style-position: outside; padding-left: 1em;">
                <li> Built tool for automated virtual environment creation using <b>Python</b> to improve machine learning workflows.</li>
                <li> Added grouping functionality to task distribution tool using <b>C++</b> and thread safe data structures from <b>TBB</b> template library.</li>
                <li> Restored <b>PyTorch</b> GAN model and associated data pipeline to simulate 3D terrain erosion with <b>90% accuracy</b>.</li>
                <li style="margin-bottom: 10px"> Implemented features for desktop app GUI, writing interconnected <b>Python</b> and <b>C++</b> modules using <b>Qt</b>.</li>
            </ul>
        `)

        let experienceWidget = createCollapsablesContainer(
            [
                "+  Software Engineer Intern (Capital One)",
                "+  Pipeline Developer Co-op (SideFX)",
                "+  Backend Developer Co-op (eSentire)",
                "+  Software Developer Co-op (Opta Intel)",
            ],
            [capitalone, sidefx, esentire, opta]
        )
        experienceWidget.id = "experienceWidget"

        // append to chat_history
        document.getElementById("chat_history").appendChild(experienceWidget)
    }

    // await sendMsg(
    //     $(`<p>Here are the main options again.
    //         If you would like to see something else, just send me a quick chat below :)</p>`)
    // )
    //
    // createOptionsWidget(
    // ["Skills 🤹‍♂️", "Work Experience 💼", "Projects 💡", "Education 🎓"],
    // [createSkillsWidget, createWorkExperienceWidget, createProjectsWidget, createEducationWidget]
    // );
}


const createResumeWidget = async () => {
   let existingResumeDiv = document.getElementById("resumeWidget")
    if (existingResumeDiv) { // if it already exists, just move it to the bottom
        document.getElementById("resumeMsgBefore").parentElement.parentElement.remove()

        await sendMsg(
            $(`<p id="resumeMsgBefore">Here's Ilia's resume again</p>`),
            0
        )
        document.getElementById("chat_history").appendChild(existingResumeDiv)
    } else {
        await sendMsg(
            $(`<p id="resumeMsgBefore">Here's Ilia's resume</p>`),
            200
        )

        $(`
            <div id="resumeWidget">
                <div id="resumeHeaderDiv">
                    <img src="static/images/pdfIcon.png" width="55px" height="65px">
                    <p style="text-align: center; font-size: 18px; margin-left: 25px">resume.pdf</p>
                </div>
                <div id="resumeLinksDiv">
                    <a href=" static/images/resume.pdf" download="">Download</a>
                    <a href="static/images/resume.pdf" target="_blank" style="margin-left: 20px">View in New Tab</a>
                </div>
            </div>
        `).appendTo('#chat_history')

        // console.log("resume widget created")
    }
}


const createDesktopControllerWidget = async () => {
    let existingDesktopControllerDiv = document.getElementById("desktopControllerWidget")
    if (existingDesktopControllerDiv) { // if it already exists, just move it to the bottom
        document.getElementById("controllerMsgBefore").parentElement.parentElement.remove()

        await sendMsg(
            $(`<p id="controllerMsgBefore">Here's another look Ilia's AI Based Desktop Controller project</p>`),
            0
        )
        document.getElementById("chat_history").appendChild(existingDesktopControllerDiv)
        document.getElementById("controllerMsgAfter").parentElement.parentElement.remove()
    } else {
        await sendMsg(
            $(`<p id="controllerMsgBefore">Here's the details on Ilia's AI Based Desktop Controller project</p>`),
            300
        )

        let body = $(`
            <ul style="margin-top: -0.1px; margin-bottom: 10px; font-size: 15.5px; list-style-position: outside; padding-left: 1em;">
                <li>
                Created a computer vision based alternative to a physical mouse and keyboard allowing hand gesture 
                based control of mouse, hand gesture based master volume slider, and speech to text typing functionality.
                </li>
                <li>
                Utilized OpenCV, Mediapipe, and NumPy to generate and process real-time position vector data of 
                user’s hands and execute Python scripts to perform gesture triggered actions.
                </li>
                <li>
                Implemented a multi-process architecture using Python's concurrent.futures module to allow users to 
                seamlessly perform several actions in parallel.
                </li>
            </ul>
        `)

        let desktopControllerWidget = createCollapsablesContainer(
            [
                "+  AI Based Desktop Controller ⌨"
            ],
            [body]
        )
        desktopControllerWidget.id = "desktopControllerWidget"

        // append to chat_history
        document.getElementById("chat_history").appendChild(desktopControllerWidget)
    }

    await projectMsgAfter("controllerMsgAfter")
}


const createIliaBotWidget = async () => {
    let existingIliaBotDiv = document.getElementById("IliaBotWidget")
    if (existingIliaBotDiv) { // if it already exists, just move it to the bottom
        document.getElementById("IliaBotMsgBefore").parentElement.parentElement.remove()

        await sendMsg(
            $(`<p id="IliaBotMsgBefore">
                Here's the details on ME! 
                Please tell Ilia I'm his coolest project, so he can build me some cool new features 👁👄👁
               </p>`),
            0
        )
        document.getElementById("chat_history").appendChild(existingIliaBotDiv)
        document.getElementById("IliaBotMsgAfter").parentElement.parentElement.remove()
    } else {
        await sendMsg(
            $(`<p id="IliaBotMsgBefore">Here's the details on this Resume Chatbot project 🤖</p>`),
            300
        )

        let body = $(`
            <ul style="margin-top: -0.1px; margin-bottom: 10px; font-size: 15.5px; list-style-position: outside; padding-left: 1em;">
                <li>
                Developed a neural network model and full-stack web app for this AI chatbot to provide insights about myself and my resume.
                </li>
                <li>
                Designed and experimented with several natural language processing (NLP) pipelines using the NLTK and SpaCy
                Python NLP libraries to create the most effective way of standardizing and preprocessing raw text data inputted by users.
                </li>
                <li>
                Built a RESTful API microservice using Python FastAPI for applying the NLP pipelines to provided raw text data.
                </li>
                <li>
                Experimented with training several machine learning algorithms such as scikit-learn's SVM and KNN models
                and varying custom architectures of Keras Sequential neural network models to determine the most effective way
                of predicting intents behind preprocessed user input data.
                </li>
                <li>
                Created this web app implementing a JavaScript/jQuery frontend with custom CSS styling, and a 
                Python/Flask backend for calling the NLP-pipeline-API microservice and applying the neural network model 
                to the preprocessed data.
                </li>
            </ul>
        `)

        let iliaBotWidget = createCollapsablesContainer(
            [
                "+  IliaBOT - Resume Chatbot 🧠"
            ],
            [body]
        )
        iliaBotWidget.id = "IliaBotWidget"

        // append to chat_history
        document.getElementById("chat_history").appendChild(iliaBotWidget)
    }

    await projectMsgAfter("IliaBotMsgAfter")
}

const createStockTradeWidget = async () => {
    let existingStockTradeDiv = document.getElementById("stockTradeWidget")
    if (existingStockTradeDiv) { // if it already exists, just move it to the bottom
        document.getElementById("stockTradeMsgBefore").parentElement.parentElement.remove()

        await sendMsg(
            $(`<p id="stockTradeMsgBefore">
                Here's the details on $tock Trade 📈 
                </p>`),
            0
        )
        document.getElementById("chat_history").appendChild(existingStockTradeDiv)
        document.getElementById("stockTradeMsgAfter").parentElement.parentElement.remove()
    } else {
        await sendMsg(
            $(`<p id="stockTradeMsgBefore">Here's the details on $tock Trade 📈 </p>`),
            300
        )

        let body = $(`
            <ul style="margin-top: -0.1px; margin-bottom: 10px; font-size: 15.5px; list-style-position: outside; padding-left: 1em;">
                <li>
                Deployed full stack web app that allows users to track real-time stock data, providing them with personal
                accounts including stock portfolios and transaction histories using data from the IEX stock exchange API.
                </li>
                <li>
                Built a fully functional user authentication system using Flask sessions and a PostgreSQL database.
                </li>
                <li>
                Designed an intuitive interface using HTML5 and CSS to work together with the Python Flask backend 
                for quickly delivering stock and personal profile information to users.
                </li>
            </ul>
        `)

        let stockTradeWidget = createCollapsablesContainer(
            [
                "+  $tock Trade 📈"
            ],
            [body]
        )
        stockTradeWidget.id = "stockTradeWidget"

        // append to chat_history
        document.getElementById("chat_history").appendChild(stockTradeWidget)
    }

    await projectMsgAfter("stockTradeMsgAfter")
}

const createDoorDetectionWidget = async () => {
    let existingDoorDetectionDiv = document.getElementById("doorDetectionWidget")
    if (existingDoorDetectionDiv) { // if it already exists, just move it to the bottom
        document.getElementById("doorDetectionMsgBefore").parentElement.parentElement.remove()

        await sendMsg(
            $(`<p id="doorDetectionMsgBefore">
                Here's some more info on Door Detection 🚪 
                </p>`),
            0
        )
        document.getElementById("chat_history").appendChild(existingDoorDetectionDiv)
        document.getElementById("doorDetectionMsgAfter").parentElement.parentElement.remove()
    } else {
        await sendMsg(
            $(`<p id="doorDetectionMsgBefore">Here's some more info on Door Detection 🚪 </p>`),
            300
        )

        let body = $(`
            <ul style="margin-top: -0.1px; margin-bottom: 10px; font-size: 15.5px; list-style-position: outside; padding-left: 1em;">
                <li>
                Wrote Python script using Pandas and NumPy to help teammates understand how our custom collected dataset should be formatted.
                </li>
                <li>
                Given ultrasonic sensor data collected by a teammate, preprocessed and visualized the dataset to be used
                for training a neural network model that can predict whether a door is open or closed with 92% accuracy.
                </li>
                <li>
                Familiarized teammates with git to maximize productivity, organization, and efficiency of workflow.
                </li>
            </ul>
        `)

        let doorDetectionWidget = createCollapsablesContainer(
            [
                "+  Door Detection 🚪"
            ],
            [body]
        )
        doorDetectionWidget.id = "doorDetectionWidget"

        // append to chat_history
        document.getElementById("chat_history").appendChild(doorDetectionWidget)
    }

    await projectMsgAfter("doorDetectionMsgAfter")
}


const projectMsgAfter = async (msgId) => {
    // Sends a msg and gives options after displaying a details widget for specific project

    await sendMsg(
        $(`<p id=${msgId}>
        Would you like to take a look at some of Ilia's other projects, or see the main options again?</p>`),
        200
    )
    createOptionsWidget(
        ["Projects💡", "Show Main Options📃"],
        [
            createProjectsWidget,
            async function () {
                await sendMsg(
                    $(`<p>Here are the main options again. 
                        If you would like to see something else, just send me a quick chat below :)</p>`)
                )

                createOptionsWidget(
                ["Skills 🤹‍♂️", "Work Experience 💼", "Projects 💡", "Education 🎓"],
                [createSkillsWidget, createWorkExperienceWidget, createProjectsWidget, createEducationWidget]
                );
            }
        ]
    )
}


//===================Feedback Buttons Widget======================//
const toggleFeedbackButtons = async (showThanks, rollout) => {
    let buttonsDiv = document.getElementById("feedbackButtons");
    let right = document.getElementById("correct");
    let wrong = document.getElementById("incorrect");

    if (rollout) { // this means display is set to "none" so the buttons are hidden
        // Get rid of display: none
        right.style.display = null;
        wrong.style.display = null;

        // Rollout
        buttonsDiv.style.maxWidth = "85px";
    } else { // otherwise the buttons are currently being displayed and must be put away
        if (showThanks) {
            right.style.display = "none";
            wrong.style.display = "none";

            let thanksMsg = document.createElement("p");
            thanksMsg.style.marginTop = "0";
            thanksMsg.style.marginLeft = "10px";
            thanksMsg.style.marginRight = "6px";
            thanksMsg.style.zIndex = "2";
            thanksMsg.style.color = "green";
            thanksMsg.innerHTML = "Thanks!";

            buttonsDiv.appendChild(thanksMsg)

            await sleep(1500)  // display the Thanks msg for 3sec
            thanksMsg.remove()
        }

        // Rollback
        buttonsDiv.style.maxWidth = "0";
    }
}

const storeFeedback = async () => {
    await fetch('/store_feedback', {
        method: "POST",
        body: JSON.stringify(feedbackInfo),
        headers: {'Content-Type': 'application/json; charset=UTF-8'}

    })
}

const callToAction = async () => {

    await sendMsg(
        $(`
            <p>Hey, sorry to interrupt. I hope you're finding this chatbot helpful.
            I just wanted to jump in and mention that Ilia loves hearing feedback about his work and is also looking for
             co-op/internship opportunities for the Winter 2022 term.
             If you have some free time available, Ilia would be happy to set up a quick chat.</p>
        `),
        200
    )

    await sendMsg(
        $(`<p>
            Fill out this form and press send to let Ilia know you would be interested in chatting with him.
            Thank you so much! I'll let you get back chatting with IliaBOT now :)
           </p>
        `),
        200
    )

    // Send a form that asks for Name, Quick Msg, contact info
    // use some gmail api to send this info to myself and then get a job at google in san francisco
}