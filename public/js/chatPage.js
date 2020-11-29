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