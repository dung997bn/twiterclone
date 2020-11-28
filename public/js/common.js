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

    $('#replyTextarea').keyup(e => {
        let textbox = $(e.target)
        let value = textbox.val().trim()

        let submitButton = $('#submitReplyButton')
        if (value == '') {
            submitButton.prop('disabled', true)
            return
        }
        submitButton.prop('disabled', false)
    })

    $('#replyModal').on('show.bs.modal', (e) => {
        let button = $(e.relatedTarget)
        let postId = getPostIdFromElement(button)

        $.get("/api/posts/" + postId, results => {
            outputPosts(results.postData, $('#originalPostContainer'))
            $('#submitReplyButton').attr('data-id', postId)
        })
    })

    $('#replyModal').on('hide.bs.modal', () => {
        $('#originalPostContainer').html('')
        $('#submitReplyButton').attr('data-id', '')
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


    $('#submitReplyButton').click((e) => {
        e.preventDefault()
        let value = $('#replyTextarea').val()
        let postId = $('#submitReplyButton').data('id')
        let data = {
            content: value,
        }
        $.post("/api/posts/comment/" + postId, data, (postData, status, xhr) => {
            if (postData.post.replyTo) {
                location.reload()
            } else {
                console.log(postData.post);
            }
        })
    })


    $(document).on('click', '.likeButton', ((e) => {
        e.preventDefault()
        let button = $(e.target)
        let postId = getPostIdFromElement(button)
        if (postId) {
            $.ajax({
                url: `/api/posts/${postId}/like`,
                type: 'PUT',
                success: (postData) => {
                    button.find('span').text(postData.post.likes.length || '')

                    if (postData.post.likes.includes(userLoggedInClient._id)) {
                        button.addClass('active')
                    } else {
                        button.removeClass('active')
                    }
                },
                error: (error) => {
                    console.log(error);
                }
            })
        }
    }))

    $(document).on('click', '.retweetButton', ((e) => {
        e.preventDefault()
        let button = $(e.target)
        let postId = getPostIdFromElement(button)
        if (postId) {
            $.ajax({
                url: `/api/posts/${postId}/retweet`,
                type: 'POST',
                success: (postData) => {
                    console.log(postData);
                    button.find('span').text(postData.post.retweetUsers.length || '')

                    if (postData.post.retweetUsers.includes(userLoggedInClient._id)) {
                        button.addClass('active')
                    } else {
                        button.removeClass('active')
                    }
                },
                error: (error) => {
                    console.log(error);
                }
            })
        }
    }))

    $(document).on('click', '.post', ((e) => {
        let element = $(e.target)
        let postId = getPostIdFromElement(element)
        if (postId && !element.is("button")) {
            window.location.href = '/posts/' + postId
        }
    }))

    $(document).on('click', '.followButton', ((e) => {
        let button = $(e.target)
        let userId = button.data('user')

        $.ajax({
            url: `/api/users/${userId}/follow`,
            type: 'PUT',
            success: (data, status, xhr) => {
                if (xhr.status === 404) {
                    alert('User not found')
                    return
                }
                if (data.following && data.following.includes(userId))
                    button.addClass('following')
                else
                    button.removeClass('following')

            },
            error: (error) => {
                console.log(error);
            }
        })
    }))
})

function getPostIdFromElement(element) {
    let isRoot = element.hasClass('post')
    let rootElement = isRoot ? element : element.closest('.post')
    const postId = rootElement.data().id
    if (postId === undefined) return undefined
    return postId
}

function creatPostHtml(postData) {
    let root = location.origin
    //check if post is retweet?
    let isRetweet = postData.retweetData != undefined
    let retweetBy = isRetweet ? postData.postedBy.username : null

    postData = isRetweet ? postData.retweetData : postData

    let retweeText = ''
    if (isRetweet) {
        retweeText = `<span>
                    <i class="fas fa-retweet"></i>
                    Retweeted by  <a href="/profile/${retweetBy}"></a> ${retweetBy}
                    </span>`
    }

    let replyFlag = ""
    if (postData.replyTo && postData.replyTo.postedBy) {
        let replyToUserName = postData.replyTo.postedBy.username ?? ""
        replyFlag = `
            <div class="replyFlag">
                Replied to <a href="/profile/${replyToUserName}">@${replyToUserName}</a>
            </div>      
        `
    }
    //Render data
    let postedBy = postData.postedBy
    let displayName = postedBy.firstName + " " + postedBy.lastName
    let timestamp = timeDifference(new Date(), new Date(postData.createdAt))

    let likeButtonActiveClass = postData.likes.includes(userLoggedInClient._id) ? 'active' : ''
    let retweetButtonActiveClass = postData.retweetUsers.includes(userLoggedInClient._id) ? 'active' : ''

    return `
    <div class="post" data-id="${postData._id}">
        <div class="postActionContainer">
            ${retweeText}
        </div>
        <div class="mainContentContainer">
            <div class="userImageContainer">
                <img src="${root}/${postedBy.profilePic}" />
            </div>
        <div class="postContentContainer">
            <div class="header">
                <a href="/profile/${postedBy.username}" class='displayName'>${displayName}</a>
                <span class="username">${postedBy.username}</span>
                <span class="date">${timestamp}</span>
            </div>
            ${replyFlag}
            <div class="postBody">
                <span>${postData.content}</span>
            </div>
            <div class="postFooter">
                <div class="postButtonContainer">
                     <button data-toggle="modal" data-target="#replyModal">
                        <i class="fas fa-comment"></i>
                     </button>
                </div>
                <div class="postButtonContainer green">
                    <button class="retweetButton ${retweetButtonActiveClass}">
                        <i class="fas fa-retweet"></i>
                        <span>${postData.retweetUsers.length || ''}</span>
                    </button>
                </div>
                <div class="postButtonContainer red">
                     <button class="likeButton ${likeButtonActiveClass}">
                        <i class="fas fa-heart"></i>
                        <span>${postData.likes.length || ''}</span>
                    </button>
                </div>
            </div>
        </div>
    </div>
</div>
    `
}

function timeDifference(current, previous) {

    var msPerMinute = 60 * 1000;
    var msPerHour = msPerMinute * 60;
    var msPerDay = msPerHour * 24;
    var msPerMonth = msPerDay * 30;
    var msPerYear = msPerDay * 365;

    var elapsed = current - previous;

    if (elapsed < msPerMinute) {
        if (Math.round(elapsed / 1000) < 30)
            return 'Just now'
        return Math.round(elapsed / 1000) + ' seconds ago';
    }

    else if (elapsed < msPerHour) {
        return Math.round(elapsed / msPerMinute) + ' minutes ago';
    }

    else if (elapsed < msPerDay) {
        return Math.round(elapsed / msPerHour) + ' hours ago';
    }

    else if (elapsed < msPerMonth) {
        return + Math.round(elapsed / msPerDay) + ' days ago';
    }

    else if (elapsed < msPerYear) {
        return + Math.round(elapsed / msPerMonth) + ' months ago';
    }

    else {
        return + Math.round(elapsed / msPerYear) + ' years ago';
    }
}


function outputPosts(results, container) {
    container.html('')
    if (results.length == 0) {
        container.append(`<span class="noResults">No post to show.</span>`)
        return
    }
    if (!Array.isArray(results)) {
        results = [results]
    }

    results.forEach(result => {
        var html = creatPostHtml(result)
        container.append(html)
    })
}


function outputPostWithReplies(results, container) {
    container.html('')

    if (results.replyTo && results.replyTo._id) {
        var html = creatPostHtml(results.replyTo)
        container.append(html)
    }

    var mainPostHtml = creatPostHtml(results.postData)
    container.append(mainPostHtml)
    if (results.replies.length == 0) {
        container.append(`<span class="noResults">No post to show.</span>`)
        return
    }
    if (!Array.isArray(results.replies)) {
        results = [results.replies]
    }

    results.replies.forEach(result => {
        var html = creatPostHtml(result.replies)
        container.append(html)
    })
}
