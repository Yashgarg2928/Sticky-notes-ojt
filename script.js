let board = document.querySelector(".board");
let addNotes = document.querySelector(".add-note")
let attachAudio = document.querySelector(".attach-audio")
let atatchVideo = document.querySelector(".attach-video")
let deleteNote = document.querySelector(".delete-note")
let workingArea = document.querySelector(".working")

function makeNote(){
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

textStickyNote.addEventListener()