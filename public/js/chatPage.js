$(document).ready(() => {
    $.get(`/api/chats/${chatId}`, data => {
        $('#chatName').text(data.chatName)
    })
})

$("#chatNameButton").click(() => {
    var name = $("#chatNameTextbox").val().trim();
    $.ajax({
        url: "/api/chats/" + chatId,
        type: "PUT",
        data: { chatName: name },
        success: (data, status, xhr) => {
            if (xhr.status != 200) {
                alert("could not update");
            }
            else {
                location.reload();
            }
        }
    })
})

$(".inputTextbox").keydown((e) => {
    if (e.which === 13 && !e.shiftKey) {
        messageSubmitted()
        return false
    }
})

$(".sendMessageButton").click(() => {
    if ($('.inputTextbox').val().trim()) {
        messageSubmitted()
    }
})

function messageSubmitted() {
    let content = $('.inputTextbox').val().trim()
    sendMessage(content)
    $('.inputTextbox').val('')
}

function sendMessage(content) {
    $.post('/api/messages', { content: content, chatId: chatId }, (data, status, xhr) => {
        if (xhr.status != 201) {
            alert('Could not send message')
            return
        }
        addChatMessageHtml(data);
    })
}

function addChatMessageHtml(message) {
    if (!message || !message._id) {
        console.log('Message is not valid')
        return
    }
    let messageLi = createMessageHtml(message)
    $('.chatMessages').append(messageLi)
}

function createMessageHtml(message) {
    let isMine = message.sender._id === userLoggedInClient._id
    let liClassName = isMine ? "mine" : "theirs"
    return `
        <li class="message ${liClassName}">
            <div class="messageContainer">
                <span class="messageBody">
                    ${message.content}
                </span>
            </div>
        </li>
    `
}