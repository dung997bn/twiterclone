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
            var rawHtml = creatPostHtml(postData.data)
            $('.postsContainer').prepend(rawHtml)
            $('#postTextarea').val('')
            $('#submitPostButton').prop('disabled', true)
        })
    })
})

function creatPostHtml(postData) {
    let postedBy = postData.postedBy
    let displayName = postedBy.firstName + " " + postedBy.lastName
    let timestamp = postedBy.createdAt
    return `
    <div class="post">
    <div class="mainContentContainer">
        <div class="userImageContainer">
            <img src="${postedBy.profilePic}" />
        </div>
        <div class="postContentContainer">
            <div class="header">
                <a href="/profile/${postedBy.username}" class='displayName'>${displayName}</a>
                <span class="username">${postedBy.username}</span>
                <span class="date">${timestamp}</span>
            </div>
            <div class="postBody">
                <span>${postData.content}</span>
            </div>
            <div class="postFooter">
            <div class="postButtonContainer">
            <button>
                <i class="fas fa-comment"></i>
            </button>
        </div>
        <div class="postButtonContainer">
            <button>
                <i class="fas fa-retweet"></i>
            </button>
        </div>
        <div class="postButtonContainer">
            <button>
                <i class="fas fa-heart"></i>
            </button>
        </div>
            </div>
        </div>
    </div>
</div>
    `
}

