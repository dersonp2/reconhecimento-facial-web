const Face = {
    MODEL_URL:
        "https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model/",

    modelsLoaded: false,

    async loadModels() {
        if (this.modelsLoaded) return;

        console.log("Carregando modelos faciais...");

        await faceapi.nets.tinyFaceDetector.loadFromUri(
            this.MODEL_URL
        );

        await faceapi.nets.faceLandmark68Net.loadFromUri(
            this.MODEL_URL
        );

        await faceapi.nets.faceRecognitionNet.loadFromUri(
            this.MODEL_URL
        );

        this.modelsLoaded = true;

        console.log("Modelos faciais carregados.");
    },

    async detect(video) {
        return await faceapi
            .detectSingleFace(
                video,
                new faceapi.TinyFaceDetectorOptions({
                    inputSize: 320,
                    scoreThreshold: 0.5
                })
            )
            .withFaceLandmarks()
            .withFaceDescriptor();
    },

    getEmbedding(detection) {
        if (!detection) return null;

        return Array.from(detection.descriptor);
    },

    getConfidence(detection) {
        if (!detection) return 0;

        return detection.detection.score;
    },

    draw(canvas, detection) {
        const context = canvas.getContext("2d");

        context.clearRect(
            0,
            0,
            canvas.width,
            canvas.height
        );

        if (!detection) return;

        const resized = faceapi.resizeResults(
            detection,
            {
                width: canvas.width,
                height: canvas.height
            }
        );

        faceapi.draw.drawDetections(
            canvas,
            resized
        );
    },

    clear(canvas) {
        const context = canvas.getContext("2d");

        context.clearRect(
            0,
            0,
            canvas.width,
            canvas.height
        );
    }
};