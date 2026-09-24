const UI = {

    statusElement:
        document.getElementById("status"),

    startButton:
        document.getElementById("startButton"),

    stopButton:
        document.getElementById("stopButton"),


    setStatus(message) {

        this.statusElement.textContent =
            message;

    },


    setCameraRunning(running) {

        this.startButton.disabled =
            running;

        this.stopButton.disabled =
            !running;

    }

};
