const video = document.getElementById("video");
const canvas = document.getElementById("canvas");

const recognitionScreen =
    document.getElementById("recognitionScreen");

const registrationScreen =
    document.getElementById("registrationScreen");

const recognitionButton =
    document.getElementById("recognitionButton");

const registrationButton =
    document.getElementById("registrationButton");

const registrationVideo =
    document.getElementById("registrationVideo");

const registrationCanvas =
    document.getElementById("registrationCanvas");

const personName =
    document.getElementById("personName");

const registrationStartButton =
    document.getElementById(
        "registrationStartButton"
    );

const registrationStopButton =
    document.getElementById(
        "registrationStopButton"
    );

const registerButton =
    document.getElementById(
        "registerButton"
    );

const registrationStatus =
    document.getElementById(
        "registrationStatus"
    );

const peopleCount =
    document.getElementById(
        "peopleCount"
    );

const peopleList =
    document.getElementById(
        "peopleList"
    );

let detectionInterval = null;

let lastEmbedding = null;

let faceDetected = false;

let registrationDetectionInterval = null;

let registrationEmbedding = null;

let registrationFaceDetected = false;


/* =====================================================
   INICIALIZAÇÃO
===================================================== */

async function initialize() {

    if (!Camera.isSupported()) {

        UI.setStatus(
            "Câmera não suportada neste navegador"
        );

        UI.startButton.disabled = true;

        registrationStartButton.disabled = true;

        return;
    }

    UI.setStatus(
        "Inicializando..."
    );

    try {

        await Face.loadModels();

        UI.setStatus(
            "Modelos carregados"
        );

        renderPeople();

    } catch (error) {

        console.error(
            "Erro ao carregar modelos:",
            error
        );

        UI.setStatus(
            "Erro ao carregar modelos"
        );
    }
}


/* =====================================================
   NAVEGAÇÃO
===================================================== */

function showRecognitionScreen() {

    stopRegistrationCamera();

    recognitionScreen.classList.remove(
        "hidden"
    );

    registrationScreen.classList.add(
        "hidden"
    );

    recognitionButton.classList.add(
        "active"
    );

    registrationButton.classList.remove(
        "active"
    );

    registrationEmbedding = null;

    registrationFaceDetected = false;
}


function showRegistrationScreen() {

    stopRecognitionCamera();

    recognitionScreen.classList.add(
        "hidden"
    );

    registrationScreen.classList.remove(
        "hidden"
    );

    recognitionButton.classList.remove(
        "active"
    );

    registrationButton.classList.add(
        "active"
    );

    renderPeople();

    resetRegistration();

    registrationStatus.textContent =
        "Informe o nome e inicie a câmera.";
}


/* =====================================================
   RECONHECIMENTO
===================================================== */

async function startCamera() {

    try {

        UI.setStatus(
            "Inicializando..."
        );

        await Camera.start(video);

        setupCanvas();

        UI.setCameraRunning(true);

        UI.setStatus(
            "Câmera ativada"
        );

        resetFaceState();

        startDetection();

    } catch (error) {

        console.error(
            "Erro ao iniciar câmera:",
            error
        );

        handleCameraError(
            error,
            UI.setStatus
        );
    }
}


function setupCanvas() {

    canvas.width =
        video.videoWidth;

    canvas.height =
        video.videoHeight;
}


function startDetection() {

    stopDetection();

    detectionInterval =
        setInterval(
            processFace,
            150
        );
}


function stopDetection() {

    if (detectionInterval) {

        clearInterval(
            detectionInterval
        );

        detectionInterval = null;
    }
}


async function processFace() {

    if (
        !video.videoWidth ||
        !video.videoHeight
    ) {

        return;
    }

    try {

        const detection =
            await Face.detect(video);

        Face.draw(
            canvas,
            detection
        );

        if (!detection) {

            handleNoFace();

            return;
        }

        handleFaceDetected(
            detection
        );

    } catch (error) {

        console.error(
            "Erro no processamento facial:",
            error
        );
    }
}


function handleNoFace() {

    if (faceDetected) {

        console.log(
            "Rosto saiu da câmera."
        );
    }

    faceDetected = false;

    lastEmbedding = null;

    UI.setStatus(
        "Nenhum rosto detectado"
    );
}


function handleFaceDetected(
    detection
) {

    const confidence =
        Face.getConfidence(
            detection
        );

    const confidencePercent =
        Math.round(
            confidence * 100
        );

    const embedding =
        Face.getEmbedding(
            detection
        );

    lastEmbedding =
        embedding;

    const result =
        Recognition.findPerson(
            embedding
        );

    if (result) {

        UI.setStatus(
            `Olá, ${result.person.nome}!`
        );

        console.log(
            "Pessoa reconhecida:",
            result.person.nome
        );

        console.log(
            "Distância:",
            result.distance
        );

    } else {

        UI.setStatus(
            "Rosto desconhecido"
        );

        console.log(
            "Rosto desconhecido"
        );
    }

    console.log(
        "Confiança da detecção:",
        `${confidencePercent}%`
    );

    console.log(
        "Embedding:",
        embedding
    );
}


function resetFaceState() {

    faceDetected = false;

    lastEmbedding = null;
}


function stopRecognitionCamera() {

    stopDetection();

    Camera.stop(video);

    Face.clear(canvas);

    resetFaceState();

    UI.setCameraRunning(false);
}


function stopCamera() {

    stopRecognitionCamera();

    UI.setStatus(
        "Câmera parada"
    );
}


/* =====================================================
   CADASTRO
===================================================== */

async function startRegistrationCamera() {

    try {

        registrationStatus.textContent =
            "Inicializando câmera...";

        await Camera.start(
            registrationVideo
        );

        setupRegistrationCanvas();

        registrationStartButton.disabled =
            true;

        registrationStopButton.disabled =
            false;

        registrationEmbedding = null;

        registrationFaceDetected = false;

        updateRegisterButton();

        startRegistrationDetection();

        registrationStatus.textContent =
            "Posicione o rosto diante da câmera.";

    } catch (error) {

        console.error(
            "Erro ao iniciar câmera de cadastro:",
            error
        );

        handleCameraError(
            error,
            message => {
                registrationStatus.textContent =
                    message;
            }
        );
    }
}


function setupRegistrationCanvas() {

    registrationCanvas.width =
        registrationVideo.videoWidth;

    registrationCanvas.height =
        registrationVideo.videoHeight;
}


function startRegistrationDetection() {

    stopRegistrationDetection();

    registrationDetectionInterval =
        setInterval(
            processRegistrationFace,
            150
        );
}


function stopRegistrationDetection() {

    if (
        registrationDetectionInterval
    ) {

        clearInterval(
            registrationDetectionInterval
        );

        registrationDetectionInterval =
            null;
    }
}


async function processRegistrationFace() {

    if (
        !registrationVideo.videoWidth ||
        !registrationVideo.videoHeight
    ) {

        return;
    }

    try {

        const detection =
            await Face.detect(
                registrationVideo
            );

        Face.draw(
            registrationCanvas,
            detection
        );

        if (!detection) {

            handleRegistrationNoFace();

            return;
        }

        handleRegistrationFace(
            detection
        );

    } catch (error) {

        console.error(
            "Erro no processamento facial:",
            error
        );
    }
}


function handleRegistrationNoFace() {

    registrationFaceDetected =
        false;

    registrationEmbedding =
        null;

    updateRegisterButton();

    registrationStatus.textContent =
        "Nenhum rosto detectado.";
}


function handleRegistrationFace(
    detection
) {

    const confidence =
        Face.getConfidence(
            detection
        );

    const confidencePercent =
        Math.round(
            confidence * 100
        );

    if (!registrationFaceDetected) {

        registrationEmbedding =
            Face.getEmbedding(
                detection
            );

        registrationFaceDetected =
            true;

        console.log(
            "Embedding para cadastro:",
            registrationEmbedding
        );
    }

    registrationStatus.textContent =
        `Rosto detectado - ${confidencePercent}%. Pronto para cadastrar.`;

    updateRegisterButton();
}


function updateRegisterButton() {

    const name =
        personName.value.trim();

    registerButton.disabled =
        !name ||
        !registrationEmbedding;
}


function registerPerson() {

    const name =
        personName.value.trim();

    if (!name) {

        registrationStatus.textContent =
            "Informe o nome da pessoa.";

        personName.focus();

        return;
    }

    if (!registrationEmbedding) {

        registrationStatus.textContent =
            "Nenhum rosto detectado.";

        return;
    }

    try {

        const person =
            Person.save(
                name,
                registrationEmbedding
            );

        console.log(
            "Pessoa cadastrada:",
            person
        );

        registrationStatus.textContent =
            `Pessoa "${person.nome}" cadastrada com sucesso.`;

        renderPeople();

        personName.value = "";

        registrationEmbedding = null;

        registrationFaceDetected =
            false;

        updateRegisterButton();

    } catch (error) {

        console.error(
            "Erro ao cadastrar pessoa:",
            error
        );

        registrationStatus.textContent =
            error.message;
    }
}


function stopRegistrationCamera() {

    stopRegistrationDetection();

    Camera.stop(
        registrationVideo
    );

    Face.clear(
        registrationCanvas
    );

    registrationStartButton.disabled =
        false;

    registrationStopButton.disabled =
        true;

    registrationEmbedding =
        null;

    registrationFaceDetected =
        false;

    updateRegisterButton();
}


function resetRegistration() {

    stopRegistrationCamera();

    personName.value = "";

    registrationStatus.textContent =
        "Informe o nome e inicie a câmera.";
}


/* =====================================================
   LISTA DE PESSOAS
===================================================== */

function renderPeople() {

    const people =
        Person.list();

    peopleCount.textContent =
        people.length;

    if (people.length === 0) {

        peopleList.innerHTML = `
            <div class="empty-state">
                Nenhuma pessoa cadastrada.
            </div>
        `;

        return;
    }

    peopleList.innerHTML =
        people
            .map(person => {

                const date =
                    formatDate(
                        person.criadoEm
                    );

                return `
                    <div class="person-item">

                        <div class="person-info">

                            <strong>
                                ${escapeHtml(
                                    person.nome
                                )}
                            </strong>

                            <span>
                                Cadastrado em ${date}
                            </span>

                        </div>

                        <button
                            class="button danger"
                            data-person-id="${person.id}"
                        >
                            Remover
                        </button>

                    </div>
                `;
            })
            .join("");

    const removeButtons =
        peopleList.querySelectorAll(
            "[data-person-id]"
        );

    removeButtons.forEach(
        button => {

            button.addEventListener(
                "click",
                () => {

                    removePerson(
                        button.dataset.personId
                    );
                }
            );
        }
    );
}


function removePerson(id) {

    const people =
        Person.list();

    const person =
        people.find(
            item => item.id === id
        );

    if (!person) {
        return;
    }

    const confirmed =
        confirm(
            `Deseja remover "${person.nome}"?`
        );

    if (!confirmed) {
        return;
    }

    Person.remove(id);

    renderPeople();

    registrationStatus.textContent =
        `Pessoa "${person.nome}" removida.`;
}


function formatDate(dateString) {

    if (!dateString) {
        return "-";
    }

    return new Date(
        dateString
    ).toLocaleString(
        "pt-BR"
    );
}


function escapeHtml(value) {

    return value
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}


/* =====================================================
   UTILITÁRIOS
===================================================== */

function handleCameraError(
    error,
    setStatus
) {

    if (
        error.name ===
        "NotAllowedError"
    ) {

        setStatus(
            "Permissão da câmera negada"
        );

    } else if (
        error.name ===
        "NotFoundError"
    ) {

        setStatus(
            "Câmera não encontrada"
        );

    } else {

        setStatus(
            "Erro ao iniciar câmera"
        );
    }
}


/* =====================================================
   EVENTOS
===================================================== */

UI.startButton.addEventListener(
    "click",
    startCamera
);


UI.stopButton.addEventListener(
    "click",
    stopCamera
);


recognitionButton.addEventListener(
    "click",
    showRecognitionScreen
);


registrationButton.addEventListener(
    "click",
    showRegistrationScreen
);


registrationStartButton.addEventListener(
    "click",
    startRegistrationCamera
);


registrationStopButton.addEventListener(
    "click",
    () => {

        stopRegistrationCamera();

        registrationStatus.textContent =
            "Câmera parada.";
    }
);


registerButton.addEventListener(
    "click",
    registerPerson
);


personName.addEventListener(
    "input",
    updateRegisterButton
);


/* =====================================================
   START
===================================================== */

initialize();