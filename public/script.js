const socket = io("/");

var peer = new Peer(undefined, {
    path: "/peerjs",
    host: "/",
    port: "443",
});
const container = document.getElementById("audio_grid");
const canvas = document.getElementById("canvas");

const ctx = canvas.getContext("2d");
const user = prompt("Enter your name");
const my_audio = document.createElement("audio");
my_audio.muted = false

let my_stream;
navigator.mediaDevices.getUserMedia({
    audio: true,
    video: false
}).then((stream) => {
    my_stream = stream
    addAudioStream(my_audio, stream)
});

const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
let audioSource = null;
let analyser = null;

function addAudioStream(audio, stream){
    audio.srcObject = stream
           audio.addEventListener("loadedmetadata", () => {   
          audio.play();
          audioSource = audioCtx.createMediaElementSource(audio);
            analyser = audioCtx.createAnalyser();
            audioSource.connect(analyser);
            analyser.connect(audioCtx.destination);
            analyser.fftSize = 128;
            const bufferLength = analyser.frequencyBinCount;
            const dataArray = new Uint8Array(bufferLength);
            const barWidth = canvas.width / bufferLength;
            let x = 0;

            function animate() {
                x = 0;
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                analyser.getByteFrequencyData(dataArray);
                for (let i = 0; i < bufferLength; i++) {
                    barHeight = dataArray[i];
                    ctx.fillStyle = "white";
                    ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
                    x += barWidth;
                }
            
                requestAnimationFrame(animate);
            }
            
            animate();

          });
    }


 $(function () {
    $("#show_chat").click(function () {
        $(".left-window").css("display", "none")
        $(".right-window").css("display", "block")
        $(".header_back").css("display", "block")
    })
    $(".header_back").click(function () {
        $(".left-window").css("display", "block")
        $(".right-window").css("display", "none")
        $(".header_back").css("display", "none")
    })

    $("#send").click(function () {
        if ($("#chat_message").val().length !== 0) {
            socket.emit("message", $("#chat_message").val());
            $("#chat_message").val("");
        }
    })

    $("#chat_message").keydown(function (e) {
        if (e.key == "Enter" && $("#chat_message").val().length !== 0) {
            socket.emit("message", $("#chat_message").val());
            $("#chat_message").val("");
        }
    })

})

peer.on("open", (id) => {
    socket.emit("join-room", ROOM_ID, id, user);
});

socket.on("createMessage", (message, userName) => {
    $(".messages").append(`
        <div class="message">
            <b><i class="far fa-user-circle"></i> <span> ${userName === user ? "me" : userName
        }</span> </b>
            <span>${message}</span>
        </div>
    `)
});