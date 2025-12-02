let board = document.querySelector(".board");
let addNotes = document.querySelector(".add-note")
let attachAudio = document.querySelector(".attach-audio")
let atatchVideo = document.querySelector(".attach-video")
let deleteNote = document.querySelector(".delete-note")
let workingArea = document.querySelector(".working")
let themebtn = document.querySelector(".themebtn")
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

themebtn.addEventListener("click",function(){
    let root = document.documentElement;
    const themelogo = themebtn.querySelector("svg")
    const moon = "M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z"

    const sun = "M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z"

    switch (getComputedStyle(root).getPropertyValue("--color1")){
        case "#363A42":
            let props = {
                "--color1": "#B2AAC1",
                "--color2": "#DCDBDD",
                "--color3": "#C7E9EE",
                "--color4": "#174579",
                "--boardcolor": "#DCDBDD",
                "--colcolor": "#000000"
            }
            for(const prop in props){
                root.style.setProperty(prop,props[prop])
            }
            
            
            themelogo.querySelector("path").setAttribute("d",sun)
            
            break;
        case "#B2AAC1":
            let darkprops = {
                "--color1": "#363A42",
                "--color2": "#B2A7BC",
                "--color3": "#415563",
                "--color4": "#F0F5F7",
                "--boardcolor": "#363A42",
                "--colcolor": "#727880"
            }
            for(const darkprop in darkprops){
                root.style.setProperty(darkprop,darkprops[darkprop])
            }
            themelogo.querySelector("path").setAttribute("d",moon)

            break;
    }
    
})