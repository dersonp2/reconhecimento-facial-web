// ============================================================
// CONFIGURAÇÕES
// ============================================================

const MODEL_URL =
    "https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model/";


// ============================================================
// ELEMENTOS DA PÁGINA
// ============================================================

const video =
    document.getElementById("video");

const canvas =
    document.getElementById("canvas");

const statusElement =
    document.getElementById("status");

const startButton =
    document.getElementById("startButton");

const stopButton =
    document.getElementById("stopButton");


// ============================================================
// VARIÁVEIS
// ============================================================

let stream = null;

let detectionInterval = null;

let modelsLoaded = false;


// ============================================================
// STATUS
// ============================================================

function setStatus(message) {

    statusElement.textContent = message;

}


// ============================================================
// CARREGAMENTO DOS MODELOS
// ============================================================

async function loadModels() {

    if (modelsLoaded) {
        return;
    }

    setStatus("Inicializando...");

    console.log(
        "Carregando modelos de reconhecimento facial..."
    );


    // Modelo responsável pela detecção do rosto
    await faceapi.nets.tinyFaceDetector.loadFromUri(
        MODEL_URL
    );


    // Modelo de pontos faciais
    await faceapi.nets.faceLandmark68Net.loadFromUri(
        MODEL_URL
    );


    // Modelo responsável pelo descritor facial
    await faceapi.nets.faceRecognitionNet.loadFromUri(
        MODEL_URL
    );


    modelsLoaded = true;

    console.log(
        "Modelos carregados."
    );
}


// ============================================================
// INICIAR CÂMERA
// ============================================================

async function startCamera() {

    try {

        setStatus("Inicializando...");


        // Carrega os modelos antes de iniciar
        // o processamento facial
        await loadModels();


        // Solicita acesso à câmera
        stream =
            await navigator.mediaDevices.getUserMedia({

                video: {

                    // Prioriza câmera frontal
                    facingMode: {
                        ideal: "user"
                    },

                    width: {
                        ideal: 1280
                    },

                    height: {
                        ideal: 720
                    }

                },

                audio: false

            });


        // Coloca o stream no elemento video
        video.srcObject = stream;


        await video.play();


        setStatus("Câmera ativada");


        startButton.disabled = true;

        stopButton.disabled = false;


        // Configura o canvas
        if (video.readyState >= 2) {

            initializeCanvas();

        } else {

            video.addEventListener(
                "loadedmetadata",
                initializeCanvas,
                {
                    once: true
                }
            );

        }


        // Começa a detecção
        startFaceDetection();

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

            setStatus(
                "Permissão da câmera negada"
            );

        }

        else if (
            error.name ===
            "NotFoundError"
        ) {

            setStatus(
                "Câmera não encontrada"
            );

        }

        else {

            setStatus(
                "Erro ao iniciar câmera"
            );

        }

    }

}


// ============================================================
// CONFIGURAR CANVAS
// ============================================================

function initializeCanvas() {

    if (
        !video.videoWidth ||
        !video.videoHeight
    ) {

        return;

    }


    canvas.width =
        video.videoWidth;

    canvas.height =
        video.videoHeight;


    console.log(
        "Resolução da câmera:",
        video.videoWidth,
        "x",
        video.videoHeight
    );

}


// ============================================================
// INICIAR DETECÇÃO
// ============================================================

function startFaceDetection() {

    stopFaceDetection();


    /*
     * Executa a detecção aproximadamente
     * a cada 150 milissegundos.
     */
    detectionInterval =
        setInterval(
            detectFace,
            150
        );

}


// ============================================================
// PARAR DETECÇÃO
// ============================================================

function stopFaceDetection() {

    if (detectionInterval) {

        clearInterval(
            detectionInterval
        );

        detectionInterval = null;

    }

}


// ============================================================
// DETECTAR ROSTO
// ============================================================

async function detectFace() {

    if (
        !video.videoWidth ||
        !video.videoHeight
    ) {

        return;

    }


    if (video.readyState < 2) {

        return;

    }


    try {

        /*
         * Detecta um rosto.
         *
         * withFaceLandmarks()
         * obtém os pontos do rosto.
         *
         * withFaceDescriptor()
         * gera o descritor facial.
         */
        const detection =
            await faceapi

                .detectSingleFace(
                    video,

                    new faceapi
                        .TinyFaceDetectorOptions({

                            inputSize: 320,

                            scoreThreshold: 0.5

                        })
                )

                .withFaceLandmarks()

                .withFaceDescriptor();


        // Contexto para desenhar no canvas
        const context =
            canvas.getContext("2d");


        // Limpa o desenho anterior
        context.clearRect(
            0,
            0,
            canvas.width,
            canvas.height
        );


        // ====================================================
        // NENHUM ROSTO
        // ====================================================

        if (!detection) {

            setStatus(
                "Nenhum rosto detectado"
            );

            return;

        }


        // ====================================================
        // ROSTO DETECTADO
        // ====================================================

        setStatus(
            "Rosto detectado"
        );


        // Ajusta as coordenadas
        const resizedDetection =
            faceapi.resizeResults(
                detection,

                {
                    width:
                        canvas.width,

                    height:
                        canvas.height
                }
            );


        // Desenha o retângulo
        faceapi.draw.drawDetections(
            canvas,
            resizedDetection
        );


        // ====================================================
        // EMBEDDING
        // ====================================================

        const descriptor =
            detection.descriptor;


        /*
         * O descriptor possui 128 valores.
         *
         * Transformamos em Array para facilitar
         * visualização, armazenamento futuro
         * e comparação.
         */
        const embedding =
            Array.from(
                descriptor
            );


        setStatus(
            "Embedding gerado"
        );


        // Mostra no console
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
            "======================================"
        );

    }

    catch (error) {

        console.error(
            "Erro na detecção facial:",
            error
        );

    }

}


// ============================================================
// PARAR CÂMERA
// ============================================================

function stopCamera() {

    // Para a detecção
    stopFaceDetection();


    // Para todas as tracks da câmera
    if (stream) {

        stream
            .getTracks()
            .forEach(
                track => track.stop()
            );

        stream = null;

    }


    // Remove o stream do vídeo
    video.srcObject = null;


    // Limpa o canvas
    const context =
        canvas.getContext("2d");

    context.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
    );


    setStatus(
        "Câmera parada"
    );


    startButton.disabled = false;

    stopButton.disabled = true;

}


// ============================================================
// EVENTOS
// ============================================================

startButton.addEventListener(
    "click",
    startCamera
);

stopButton.addEventListener(
    "click",
    stopCamera
);


// ============================================================
// VERIFICAÇÃO DO NAVEGADOR
// ============================================================

if (
    !navigator.mediaDevices ||
    !navigator.mediaDevices.getUserMedia
) {

    setStatus(
        "Câmera não suportada neste navegador"
    );

    startButton.disabled = true;

}

else {

    setStatus(
        "Inicializando..."
    );

}
