let board = document.querySelector(".board");
let addNotes = document.querySelector(".add-note");
let attachAudio = document.querySelector(".attach-audio");
let atatchVideo = document.querySelector(".attach-video");
let workingArea = document.querySelector(".working");
let themebtn = document.querySelector(".themebtn");
let colorbtns = document.querySelector("#color-form");
let color = "#E1E1E1";
let stickyNote;
let dbInstance;

// --- 1. INDEXED DB SETUP ---
const DB_NAME = "StickyNotesDB";
const STORE_NAME = "notes";

function openDB() {
    return new Promise((resolve, reject) => {
        let request = indexedDB.open(DB_NAME, 1);
        request.onupgradeneeded = function(e) {
            let db = e.target.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME, { keyPath: "id" });
            }
        };
        request.onsuccess = function(e) {
            dbInstance = e.target.result;
            resolve(dbInstance);
        };
        request.onerror = function(e) {
            console.error("Database error", e);
            reject("Error opening DB");
        };
    });
}

function saveNotesToStorage() {
    if (!dbInstance) return;

    const notes = [];
    const allNotes = board.querySelectorAll(".sticky-note");

    allNotes.forEach(note => {
        let content = "";
        let classList = note.classList;
        let type = "";
        let mediaType = "";

        if (classList.contains("text-sticky-note")) {
            type = "text-sticky-note";
            content = note.querySelector("p").textContent;
        } else if (classList.contains("audio-sticky-note")) {
            type = "audio-sticky-note";
            mediaType = "audio";
            content = note.dataset.content || "";
        } else if (classList.contains("video-sticky-note")) {
            type = "video-sticky-note";
            mediaType = "video";
            content = note.dataset.content || "";
        }

        let dateInput = note.querySelector(".date-input");
        let dueDateVal = dateInput ? dateInput.value : "";

        notes.push({
            id: note.dataset.id,
            type: type,
            mediaType: mediaType,
            content: content,
            color: note.style.backgroundColor,
            left: note.style.left,
            top: note.style.top,
            width: note.style.width,
            height: note.style.height,
            priority: note.dataset.priority || "",
            dueDate: dueDateVal
        });
    });

    const transaction = dbInstance.transaction([STORE_NAME], "readwrite");
    const store = transaction.objectStore(STORE_NAME);
    store.clear(); 
    notes.forEach(note => {
        store.put(note);
    });
}

function loadNotesFromStorage() {
    if (!dbInstance) return;
    const transaction = dbInstance.transaction([STORE_NAME], "readonly");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();

    request.onsuccess = function() {
        const notes = request.result;
        notes.forEach(noteData => {
            makeNote(noteData.type, noteData.mediaType, noteData);
        });
    };
}

document.addEventListener("DOMContentLoaded", async () => {
    await openDB();
    loadNotesFromStorage();
});

colorbtns.addEventListener("click", (e) => {
    if (e.target.classList.contains("color-button")) {
        color = window.getComputedStyle(e.target).backgroundColor;
    }
});


// --- 2. PRIORITY BUTTON LOGIC ---
function addPriorityButtons(note, savedPriority) {
    let container = document.createElement("div");
    container.classList.add("priority-container"); 
    
    const priorities = [
        { name: "red", color: "#FF5F56" },
        { name: "yellow", color: "#FFBD2E" },
        { name: "green", color: "#27C93F" }
    ];

    if (savedPriority) note.dataset.priority = savedPriority;

    priorities.forEach(p => {
        let btn = document.createElement("div");
        btn.classList.add("priority-dot"); 
        btn.style.backgroundColor = p.color; 
        btn.dataset.pName = p.name;

        if (savedPriority && savedPriority !== p.name) btn.style.display = "none";

        btn.addEventListener("click", (e) => {
            e.stopPropagation(); 
            const siblings = container.querySelectorAll("div");
            let areOthersHidden = false;
            siblings.forEach(s => { if (s !== btn && s.style.display === "none") areOthersHidden = true; });

            if (areOthersHidden) {
                siblings.forEach(s => s.style.display = "block");
                note.dataset.priority = "";
            } else {
                siblings.forEach(s => { if (s !== btn) s.style.display = "none"; });
                note.dataset.priority = p.name;
            }
            saveNotesToStorage();
        });
        container.appendChild(btn);
    });
    note.appendChild(container);
}

// --- 3. DUE DATE LOGIC ---
function addDueDate(note, savedDate) {
    let container = document.createElement("div");
    container.classList.add("date-container"); 


    let input = document.createElement("input");
    input.type = "date"; 
    input.classList.add("date-input"); 
    input.style.backgroundColor = note.style.backgroundColor;

    if (savedDate) input.value = savedDate;

    input.addEventListener("change", () => {
        saveNotesToStorage();
    });

    // Stop drag when clicking anywhere in the container (label or input)
    container.addEventListener("mousedown", (e) => {
        e.stopPropagation();
    });

    container.appendChild(input);
    note.appendChild(container);
}


// --- MAIN FUNCTION ---
function makeNote(classname, mediaType, data = null) {
    if (!data) {
        workingArea.innerHTML = "";
    }

    stickyNote = document.createElement("div");
    stickyNote.classList.add(classname, "sticky-note");
    stickyNote.dataset.id = data ? data.id : Date.now();
    stickyNote.style.backgroundColor = data ? data.color : color;

    addPriorityButtons(stickyNote, data ? data.priority : null);
    addDueDate(stickyNote, data ? data.dueDate : null);

    if (data) {
        stickyNote.style.position = "absolute";
        stickyNote.style.left = data.left;
        stickyNote.style.top = data.top;
        stickyNote.style.width = data.width;
        stickyNote.style.height = data.height;
        stickyNote.style.zIndex = "1";
    }

    let elementToFocus = null;

    switch (classname) {
        case "text-sticky-note":
            let input = document.createElement("input");
            input.setAttribute("type", "text");
            input.classList.add("text-input")
            stickyNote.appendChild(input);

            let textarea = document.createElement("p");
            stickyNote.appendChild(textarea);

            if (data) {
                textarea.textContent = data.content;
                input.value = data.content;
            }

            input.addEventListener("input", function (event) {
                textarea.textContent = event.target.value;
            });
            addDueDate(stickyNote, data ? data.dueDate : null);
            input.addEventListener("blur", saveNotesToStorage);

            
            // --- FIX IS HERE ---
            // Only focus the text input if the user is NOT interacting with Date or Priority
            stickyNote.addEventListener("click", function (e) {
                // If clicked inside date container or priority container, DO NOT focus text
                if (e.target.closest(".date-container") || e.target.closest(".priority-container")) {
                    return;
                }
                // Otherwise, focus text
                input.focus();
            });

            elementToFocus = input;
            break;

        case "audio-sticky-note":
        case "video-sticky-note":
            let Container = document.createElement("div");
            Container.classList.add(mediaType === "audio" ? "audio-container" : "video-container");

            if (data && data.content) {
                let Player = document.createElement(`${mediaType}`);
                Player.controls = true;
                Player.src = data.content;
                Player.style.maxWidth = "100%";
                Player.style.maxHeight = "100%";
                Player.style.borderRadius = "5px";
                stickyNote.dataset.content = data.content;
                Container.appendChild(Player);
                stickyNote.appendChild(Container);
            } else {
                let uploadBtn = document.createElement("button");
                uploadBtn.textContent = `Upload ${mediaType}`;
                uploadBtn.classList.add("upload-btn");

                stickyNote.appendChild(uploadBtn);
                stickyNote.appendChild(Container);

                uploadBtn.addEventListener("click", function (e) {
                    e.stopPropagation();
                    let inputFile = document.createElement("input");
                    inputFile.type = "file";
                    inputFile.accept = `${mediaType}/*`;
                    inputFile.click();

                    inputFile.addEventListener("change", function (ev) {
                        let file = ev.target.files[0];
                        if (!file) return;

                        let reader = new FileReader();
                        reader.onload = function(evt) {
                            let base64String = evt.target.result;
                            let Player = document.createElement(`${mediaType}`);
                            Player.controls = true;
                            Player.src = base64String;
                            Player.style.maxWidth = "100%";
                            Player.style.maxHeight = "100%";
                            Player.style.borderRadius = "5px";

                            uploadBtn.remove();
                            Container.appendChild(Player);
                            stickyNote.dataset.content = base64String;
                            saveNotesToStorage();
                        };
                        reader.readAsDataURL(file);
                    });
                });
            }
            break;
    }

    if (data) {
        board.appendChild(stickyNote);
    } else {
        workingArea.appendChild(stickyNote);
    }

    if (!data && elementToFocus) {
        elementToFocus.focus();
    }

    enableDrag(stickyNote);
}

function enableDrag(stickyNote) {
    let offsetX = 0;
    let offsetY = 0;
    let isDragging = false;

    stickyNote.addEventListener('mousedown', (e) => {
        // Stop drag if clicking: Input, Button, Audio/Video, Date Container, or Priority Dots
        if (e.target.tagName === "INPUT" || 
            e.target.tagName === "BUTTON" || 
            e.target.tagName === "AUDIO" || 
            e.target.closest(".date-container") || // Stops drag on date label + input
            e.target.dataset.pName) { 
            return;
        }

        e.preventDefault();
        isDragging = true;

        const rect = stickyNote.getBoundingClientRect();
        offsetX = e.clientX - rect.left;
        offsetY = e.clientY - rect.top;

        if (!board.contains(stickyNote)) {
            board.appendChild(stickyNote);
            stickyNote.style.width = "25%";
            stickyNote.style.height = "auto";
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
            saveNotesToStorage();
        }
    });
}

// Event Listeners for UI
addNotes.addEventListener("click", function () { makeNote("text-sticky-note", "text"); });
attachAudio.addEventListener("click", function () { makeNote("audio-sticky-note", "audio"); });
atatchVideo.addEventListener("click", function () { makeNote("video-sticky-note", "video"); });

themebtn.addEventListener("click", function () {
    let root = document.documentElement;
    const themelogo = themebtn.querySelector("svg");
    const moon = "M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z";
    const sun = "M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z";

    switch (getComputedStyle(root).getPropertyValue("--color1")) {
        case "#363A42":
            let props = { "--color1": "#B2AAC1", "--color2": "#DCDBDD", "--color3": "#C7E9EE", "--color4": "#174579", "--boardcolor": "#DCDBDD", "--colcolor": "#000000" };
            for (const prop in props) root.style.setProperty(prop, props[prop]);
            themelogo.querySelector("path").setAttribute("d", sun);
            break;
        case "#B2AAC1":
            let darkprops = { "--color1": "#363A42", "--color2": "#B2A7BC", "--color3": "#415563", "--color4": "#F0F5F7", "--boardcolor": "#363A42", "--colcolor": "#727880" };
            for (const darkprop in darkprops) root.style.setProperty(darkprop, darkprops[darkprop]);
            themelogo.querySelector("path").setAttribute("d", moon);
            break;
    }
});

const observer = new MutationObserver((mutationsList) => {
    for (const mutation of mutationsList) {
        if (mutation.type === "childList") {
            mutation.addedNodes.forEach(node => {
                if(node.nodeType === 1 && node.classList.contains("sticky-note")){
                    node.addEventListener("contextmenu", (e) => {
                        e.preventDefault();
                        node.remove();
                        saveNotesToStorage();
                    });
                }
            });
        }
    }
});

observer.observe(document.querySelector(".board"), { childList: true, subtree: false });

window.addEventListener("resize", function () {
    const workingStickyNote = workingArea.querySelector(".sticky-note");
    if (workingStickyNote) {
        if (workingArea.offsetWidth <= workingArea.offsetHeight) {
            workingStickyNote.style.width = "80%";
            workingStickyNote.style.height = "auto";
        } else {
            workingStickyNote.style.height = "80%";
            workingStickyNote.style.width = "auto";
        }
    }
});