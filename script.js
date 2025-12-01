let board = document.querySelector(".board");
let addNotes = document.querySelector(".add-note")
let attachAudio = document.querySelector(".attach-audio")
let atatchVideo = document.querySelector(".attach-video")
let deleteNote = document.querySelector(".delete-note")
let workingArea = document.querySelector(".working")
let stickyNote;

function makeNote(classname, mediaType){
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
            input.click();
            break;

        case "audio-sticky-note":
        case "video-sticky-note":
            let uploadBtn = document.createElement("button");
            uploadBtn.textContent = `Upload ${mediaType}`;
            uploadBtn.classList.add("upload-btn");

            let Container = document.createElement("div");
            Container.classList.add(`${mediaType}-container`);
            Container.style.display = "flex";
            Container.style.justifyContent = "center";
            Container.style.alignItems = "center";
            Container.style.flexDirection = "column";
            Container.style.height = "calc(100% - 2em)";

            stickyNote.appendChild(uploadBtn);
            stickyNote.appendChild(Container);

            workingArea.appendChild(stickyNote);

            uploadBtn.addEventListener("click", function (e) {
                e.stopPropagation(); // Prevent dragging while clicking upload
                let inputFile = document.createElement("input");
                inputFile.type = "file";
                inputFile.accept = `${mediaType}/*`;
                inputFile.click();

                inputFile.addEventListener("change", function (ev) {
                    let file = ev.target.files[0];
                    if (!file) return;

                    let Player = document.createElement(`${mediaType}`);
                    Player.controls = true;
                    Player.src = URL.createObjectURL(file);
                    Player.style.maxWidth = "100%";
                    Player.style.maxHeight = "100%";
                    Player.style.borderRadius = "5px";

                    uploadBtn.remove();
                    Container.appendChild(Player);
                });
            });
            break;
    }

    // Smooth Drag-and-Drop
    enableDrag(stickyNote);
}

// Smooth Drag-and-Drop with read-only on drop
function enableDrag(stickyNote) {
    let offsetX = 0;
    let offsetY = 0;
    let isDragging = false;

    stickyNote.addEventListener('mousedown', (e) => {
        e.preventDefault();

        // Only start drag if not clicking inside input or button
        if(e.target.tagName === "INPUT" || e.target.tagName === "BUTTON") return;

        isDragging = true;

        const rect = stickyNote.getBoundingClientRect();
        offsetX = e.clientX - rect.left;
        offsetY = e.clientY - rect.top;

        if (!board.contains(stickyNote)) {
            board.appendChild(stickyNote);
        }

        stickyNote.style.position = 'absolute';
        stickyNote.style.zIndex = 1000;
    });

    document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;

        let x = e.clientX - board.getBoundingClientRect().left - offsetX;
        let y = e.clientY - board.getBoundingClientRect().top - offsetY;

        const boardRect = board.getBoundingClientRect();
        const noteRect = stickyNote.getBoundingClientRect();

        x = Math.max(0, Math.min(x, boardRect.width - noteRect.width));
        y = Math.max(0, Math.min(y, boardRect.height - noteRect.height));

        stickyNote.style.left = x + 'px';
        stickyNote.style.top = y + 'px';
    });

    document.addEventListener('mouseup', () => {
        if (isDragging) {
            isDragging = false;
            stickyNote.style.zIndex = 1;

            // Make the sticky note read-only when dropped
            makeReadOnly(stickyNote);
        }
    });
}

// Make Sticky Note Read-Only
function makeReadOnly(stickyNote){
    if(stickyNote.classList.contains("text-sticky-note")){
        let input = stickyNote.querySelector("input");
        if(input) input.disabled = true;
    } else if(stickyNote.classList.contains("audio-sticky-note") || stickyNote.classList.contains("video-sticky-note")){
        let uploadBtn = stickyNote.querySelector(".upload-btn");
        if(uploadBtn) uploadBtn.remove();
    }
}

// Event Listeners
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
    let deleteStickyNote = document.createElement("div");
    deleteStickyNote.classList.add("delete-sticky-note");
    workingArea.appendChild(deleteStickyNote);

    deleteStickyNote.addEventListener("click", function () {     
        deleteStickyNote.remove();
    });
});
