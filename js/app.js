const video =
    document.getElementById("video");

const canvas =
    document.getElementById("canvas");


let detectionInterval = null;


// ============================================================
// INICIALIZAÇÃO
// ============================================================

async function initialize() {

    if (!Camera.isSupported()) {

        UI.setStatus(
            "Câmera não suportada neste navegador"
        );

        UI.startButton.disabled = true;

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

    }

    catch (error) {

        console.error(
            "Erro ao carregar modelos:",
            error
        );

        UI.setStatus(
            "Erro ao carregar modelos"
        );

    }

}


// ============================================================
// INICIAR CÂMERA
// ============================================================

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


        startDetection();

    }

    catch (error) {

        console.error(
            "Erro ao iniciar câmera:",
            error
        );


        if (
            error.name ===
            "NotAllowedError"
        ) {

            UI.setStatus(
                "Permissão da câmera negada"
            );

        }

        else if (
            error.name ===
            "NotFoundError"
        ) {

            UI.setStatus(
                "Câmera não encontrada"
            );

        }

        else {

            UI.setStatus(
                "Erro ao iniciar câmera"
            );

        }

    }

}


// ============================================================
// CONFIGURAR CANVAS
// ============================================================

function setupCanvas() {

    canvas.width =
        video.videoWidth;

    canvas.height =
        video.videoHeight;

}


// ============================================================
// INICIAR DETECÇÃO
// ============================================================

function startDetection() {

    stopDetection();


    detectionInterval =
        setInterval(
            processFace,
            150
        );

}


// ============================================================
// PARAR DETECÇÃO
// ============================================================

function stopDetection() {

    if (detectionInterval) {

        clearInterval(
            detectionInterval
        );

        detectionInterval = null;

    }

}


// ============================================================
// PROCESSAR ROSTO
// ============================================================

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


        // ====================================================
        // NENHUM ROSTO
        // ====================================================

        if (!detection) {

            UI.setStatus(
                "Nenhum rosto detectado"
            );

            return;

        }


        // ====================================================
        // ROSTO DETECTADO
        // ====================================================

        UI.setStatus(
            "Rosto detectado"
        );


        // ====================================================
        // EMBEDDING
        // ====================================================

        const embedding =
            Face.getEmbedding(
                detection
            );


        UI.setStatus(
            "Embedding gerado"
        );


        console.log(
            "======================================"
        );

        console.log(
            "EMBEDDING FACIAL GERADO"
        );

        console.log(
            "Dimensão:",
            embedding.length
        );

        console.log(
            embedding
        );

        console.log(
            "======================================");

    }

    catch (error) {

        console.error(
            "Erro no processamento facial:",
            error
        );

    }

}


// ============================================================
// PARAR CÂMERA
// ============================================================

function stopCamera() {

    stopDetection();

    Camera.stop(video);

    Face.clear(canvas);

    UI.setCameraRunning(false);

    UI.setStatus(
        "Câmera parada"
    );

}


// ============================================================
// EVENTOS
// ============================================================

UI.startButton.addEventListener(
    "click",
    startCamera
);

UI.stopButton.addEventListener(
    "click",
    stopCamera
);


// ============================================================
// START
// ============================================================

initialize();