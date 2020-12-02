let typing = false
let lastTypingTime

$(document).ready(() => {
    socket.emit('join room', chatId)
    socket.on('typing', () => $('.typingDots').show())
    socket.on('stop typing', () => $('.typingDots').hide())

    $.get(`/api/chats/${chatId}`, data => {
        $('#chatName').text(data.chatName)
    })
    $.get(`/api/chats/${chatId}/messages`, data => {
        let messages = []
        let lastSenderId = "";
        data.forEach((message, index) => {
            let html = createMessageHtml(message, data[index + 1], lastSenderId)
            messages.push(html)
            lastSenderId = message.sender._id
        });

        let messagesHtml = messages.join(" ")
        addMessagesHtmlToPage(messagesHtml)
        scrollToBottom(false);

        $(".loadingSpinnerContainer").remove();
        $(".chatContainer").css("visibility", "visible");
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
    updateTyping()
    if (e.which === 13 && !e.shiftKey) {
        messageSubmitted()
        return false
    }
})

function updateTyping() {
    if (!connected) return
    if (!typing) {
        typing = true
        socket.emit("typing", chatId)
    }

    lastTypingTime = new Date().getTime()
    let timerLength = 3000

    setTimeout(() => {
        let timerNow = new Date().getTime()
        let timeDiff = timerNow - lastTypingTime
        if (timeDiff >= timerLength && typing) {
            socket.emit("stop typing", chatId)
            typing = false
        }
    }, timerLength)
}

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
    scrollToBottom(true);
}

function createMessageHtml(message, nextMessage, lastSenderId) {

    let sender = message.sender
    let senderName = sender.firstName + " " + sender.lastName

    let currentSenderId = sender._id
    let nextSenderId = nextMessage ? nextMessage.sender._id : ""

    let isFirst = lastSenderId !== currentSenderId
    let isLast = nextSenderId !== currentSenderId

    let isMine = message.sender._id === userLoggedInClient._id
    let liClassName = isMine ? "mine" : "theirs"

    let nameElement = ""

    if (isFirst) {
        liClassName += " first"
        if (!isMine) {
            nameElement = `<span class='senderName'>${senderName}</span>`;
        }
    }
    var profileImage = "";
    if (isLast) {
        liClassName += " last"
        profileImage = `<img src='${sender.profilePic}'>`;
    }
    let imageContainer = ""
    if (!isMine) {
        imageContainer = `<div class='imageContainer'>
                                ${profileImage}
                            </div>`;
    }
    return `
        <li class="message ${liClassName}">
        ${imageContainer}
            <div class="messageContainer">
            ${nameElement}
                <span class="messageBody">
                    ${message.content}
                </span>
            </div>
        </li>
    `
}

function addMessagesHtmlToPage(html) {
    $('.chatMessages').append(html)
}

function scrollToBottom(animated) {
    var container = $(".chatMessages");
    var scrollHeight = container[0].scrollHeight;

    if (animated) {
        container.animate({ scrollTop: scrollHeight }, "slow");
    }
    else {
        container.scrollTop(scrollHeight);
    }
}