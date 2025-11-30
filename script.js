let board = document.querySelector(".board");
let addNotes = document.querySelector(".add-note")
let attachAudio = document.querySelector(".attach-audio")
let atatchVideo = document.querySelector(".attach-video")
let deleteNote = document.querySelector(".delete-note")
let workingArea = document.querySelector(".working")

function makeNote(classname){
    let stickyNote = document.createElement("div")
    return stickyNote
}
addNotes.addEventListener("click",function (){
    workingArea.innerHTML = ""
    let textStickyNote = makeNote();
    textStickyNote.classList.add("text-sticky-note");

    let input = document.createElement("input")
    input.setAttribute("type","text")
    textStickyNote.appendChild(input);

    let textarea = document.createElement("p");
    textStickyNote.appendChild(textarea);

    workingArea.appendChild(textStickyNote);

    textStickyNote.addEventListener("click",function(){
        input.focus()

        input.addEventListener("input",function(event){
            textarea.textContent = `${event.target.value}`
        })
    })


})
attachAudio.addEventListener("click", function () {
 
    workingArea.innerHTML = "";

    let audioStickyNote = makeNote();
    audioStickyNote.classList.add("audio-sticky-note");

    let uploadBtn = document.createElement("button");
    uploadBtn.textContent = "Upload Audio";
    uploadBtn.classList.add("upload-audio-btn");

    let audioContainer = document.createElement("div");
    audioContainer.classList.add("audio-container");

    audioStickyNote.appendChild(uploadBtn);
    audioStickyNote.appendChild(audioContainer);

    workingArea.appendChild(audioStickyNote);

    uploadBtn.addEventListener("click", function () {
        let input = document.createElement("input");
        input.type = "file";
        input.accept = "audio/*";
        input.click();

        input.addEventListener("change", function (e) {
            let file = e.target.files[0];
            if (!file) return;

            let audioPlayer = document.createElement("audio");
            audioPlayer.controls = true;
            audioPlayer.src = URL.createObjectURL(file);

            uploadBtn.remove();
            audioContainer.appendChild(audioPlayer);
        });
    });
});
atatchVideo.addEventListener("click", function () {

    workingArea.innerHTML = "";

    let videoStickyNote = makeNote();
    videoStickyNote.classList.add("video-sticky-note");

    let uploadBtn = document.createElement("button");
    uploadBtn.textContent = "Upload Video";
    uploadBtn.classList.add("upload-video-btn");

    videoStickyNote.appendChild(uploadBtn);
    workingArea.appendChild(videoStickyNote);

    uploadBtn.addEventListener("click", function () {
        let input = document.createElement("input");
        input.type = "file";
        input.accept = "video/*";  
        input.click();

        input.addEventListener("change", function (e) {
            let file = e.target.files[0];
            if (!file) return;

            let videoPlayer = document.createElement("video");
            videoPlayer.controls = true;                   
            videoPlayer.src = URL.createObjectURL(file);
            videoPlayer.style.width = "100%";               
            videoPlayer.style.borderRadius = "8px";
           
            uploadBtn.remove();
   
            videoStickyNote.appendChild(videoPlayer);
        });
    });

});
deleteNote.addEventListener("click", function () {
    
    workingArea.innerHTML = "";
    
    let deleteStickyNote = makeNote();
    deleteStickyNote.classList.add("delete-sticky-note");
  
    workingArea.appendChild(deleteStickyNote);

    deleteBtn.addEventListener("click", function () {     
        deleteStickyNote.remove();
    });
});




