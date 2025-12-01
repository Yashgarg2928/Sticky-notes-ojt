let board = document.querySelector(".board");
let addNotes = document.querySelector(".add-note")
let attachAudio = document.querySelector(".attach-audio")
let atatchVideo = document.querySelector(".attach-video")
let deleteNote = document.querySelector(".delete-note")
let workingArea = document.querySelector(".working")
let stickyNote;
function makeNote(classname,mediaType){
    workingArea.innerHTML = ""
    stickyNote = document.createElement("div")
    stickyNote.classList.add(classname,"sticky-note");
    
    switch(classname){
        case "text-sticky-note":
            let input = document.createElement("input")
            input.setAttribute("type","text")
            stickyNote.appendChild(input);

            let textarea = document.createElement("p");
            stickyNote.appendChild(textarea);

            workingArea.appendChild(stickyNote);

            stickyNote.addEventListener("click",function(){
                input.focus()

                input.addEventListener("input",function(event){
                    textarea.textContent = `${event.target.value}`
                })
            })
            break;
        case "audio-sticky-note":
        case "video-sticky-note":
            let uploadBtn = document.createElement("button");
            uploadBtn.textContent = `Upload ${mediaType}`;
            uploadBtn.classList.add("upload-btn");

            let Container = document.createElement("div");
            Container.classList.add(`${mediaType}-container`);

            stickyNote.appendChild(uploadBtn);
            stickyNote.appendChild(Container);

            workingArea.appendChild(stickyNote);

            uploadBtn.addEventListener("click", function () {
                let input = document.createElement("input");
                input.type = "file";
                input.accept = `${mediaType}/*`;
                input.click();

                input.addEventListener("change", function (e) {
                    let file = e.target.files[0];
                    if (!file) return;

                    let Player = document.createElement(`${mediaType}`);
                    Player.controls = true;
                    Player.src = URL.createObjectURL(file);

                    uploadBtn.remove();
                    Container.appendChild(Player);
                });
            });
            break;
        
            
    }

    function stickyNoteclick(){
        event.preventDefault();
        console.log("yes")
        board.appendChild(stickyNote);
        stickyNote.removeEventListener("click",stickyNoteclick);
        stickyNote.addEventListener("click",moveStickyNote);
    }
    function moveStickyNote(){
        console.log("hell")
        board.addEventListener('mousemove',changePos)
        stickyNote.removeEventListener("click",moveStickyNote);

    }
    function changePos(){
        const rect = board.getBoundingClientRect();

        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        stickyNote.style.top = `${y}px`
        stickyNote.style.left = `${x}px`  
        console.log("moving")
        stickyNote.addEventListener("click",() => {
            board.removeEventListener("mousemove",changePos);
            stickyNote.addEventListener("click",stickyNoteclick);
        })  
       
    };
    stickyNote.addEventListener("contextmenu",stickyNoteclick)
}










addNotes.addEventListener("click",function (){
    makeNote("text-sticky-note","text");

})
attachAudio.addEventListener("click", function () {
 
    makeNote("audio-sticky-note","audio");
});
atatchVideo.addEventListener("click", function () {

    makeNote("video-sticky-note","video");

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





