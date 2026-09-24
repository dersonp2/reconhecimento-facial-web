const Camera = {

    stream: null,


    async start(video) {

        this.stream =
            await navigator.mediaDevices
                .getUserMedia({

                    video: {

                        /*
                         * Prioriza câmera frontal.
                         */
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


        video.srcObject =
            this.stream;


        await video.play();


        return this.stream;

    },


    stop(video) {

        if (this.stream) {

            this.stream
                .getTracks()
                .forEach(
                    track => track.stop()
                );

            this.stream = null;

        }


        video.srcObject = null;

    },


    isSupported() {

        return !!(
            navigator.mediaDevices &&
            navigator.mediaDevices.getUserMedia
        );

    }

};