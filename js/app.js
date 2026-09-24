const video = document.getElementById("video");
const canvas = document.getElementById("canvas");

let detectionInterval = null;

let lastEmbedding = null;
let faceDetected = false;

async function initialize() {
    if (!Camera.isSupported()) {
        UI.setStatus(
            "Câmera não suportada neste navegador"
        );

        UI.startButton.disabled = true;

        return;
    }

    UI.setStatus("Inicializando...");

    try {
        await Face.loadModels();

        UI.setStatus("Modelos carregados");
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

async function startCamera() {
    try {
        UI.setStatus("Inicializando...");

        await Camera.start(video);

        setupCanvas();

        UI.setCameraRunning(true);

        UI.setStatus("Câmera ativada");

        resetFaceState();

        startDetection();

    } catch (error) {
        console.error(
            "Erro ao iniciar câmera:",
            error
        );

        if (error.name === "NotAllowedError") {
            UI.setStatus(
                "Permissão da câmera negada"
            );

        } else if (error.name === "NotFoundError") {
            UI.setStatus(
                "Câmera não encontrada"
            );

        } else {
            UI.setStatus(
                "Erro ao iniciar câmera"
            );
        }
    }
}

function setupCanvas() {
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
}

function startDetection() {
    stopDetection();

    detectionInterval = setInterval(
        processFace,
        150
    );
}

function stopDetection() {
    if (detectionInterval) {
        clearInterval(detectionInterval);

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
        const detection = await Face.detect(video);

        Face.draw(
            canvas,
            detection
        );

        if (!detection) {
            handleNoFace();

            return;
        }

        handleFaceDetected(detection);

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

function handleFaceDetected(detection) {
    const confidence =
        Face.getConfidence(detection);

    const confidencePercent =
        Math.round(confidence * 100);

    UI.setStatus(
        `Rosto detectado - ${confidencePercent}%`
    );

    /*
     * Se já existe um rosto sendo acompanhado,
     * não precisamos gerar outro embedding.
     */
    if (faceDetected) {
        return;
    }

    faceDetected = true;

    const embedding =
        Face.getEmbedding(detection);

    lastEmbedding = embedding;

    UI.setStatus(
        "Embedding gerado"
    );

    console.log(
        "======================================"
    );

    console.log(
        "NOVO ROSTO DETECTADO"
    );

    console.log(
        "Confiança:",
        `${confidencePercent}%`
    );

    console.log(
        "Dimensão:",
        embedding.length
    );

    console.log(
        "Embedding:",
        embedding
    );

    console.log(
        "======================================"
    );
}

function resetFaceState() {
    faceDetected = false;
    lastEmbedding = null;
}

function stopCamera() {
    stopDetection();

    Camera.stop(video);

    Face.clear(canvas);

    resetFaceState();

    UI.setCameraRunning(false);

    UI.setStatus(
        "Câmera parada"
    );
}

UI.startButton.addEventListener(
    "click",
    startCamera
);

UI.stopButton.addEventListener(
    "click",
    stopCamera
);

initialize();