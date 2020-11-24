$(document).ready(() => {
    // refreshMessagesBadge();
    // refreshNotificationsBadge();

    $('#postTextarea').keyup(e => {
        let textbox = $(e.target)
        let value = textbox.val().trim()

        let submitButton = $('#submitPostButton')
        if (value == '') {
            submitButton.prop('disabled', true)
            return
        }

        submitButton.prop('disabled', false)
    })

    $('#submitPostButton').click((e) => {
        e.preventDefault()
        let value = $('#postTextarea').val()
        let data = {
            content: value
        }

        $.post("/api/posts", data, (postData, status, xhr) => {
            var rawHtml = creatPostHtml(data)
            $('.postsContainer').prepend(rawHtml)
            $('#postTextarea').val('')
            $('#submitPostButton').prop('disabled', true)
        })
    })
})

function creatPostHtml(postData) {
    return postData.content
}

