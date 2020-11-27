$(document).ready(() => {
    $.get("/api/posts/" + postId, results => {
        console.log(results);
        outputPostWithReplies(results, $('.postsContainer'))
    })
})
