$(document).ready(() => {
    $.get("/api/posts", results => {
        outputPosts(results, $('.postsContainer'))
    })
})



function outputPosts(results, container) {
    container.html('')

    if (results.length == 0) {
        container.append(`<span class="noResults">No post to show.</span>`)
        return 
    }

    results.forEach(result => {
        var html = creatPostHtml(result)
        container.append(html)
    })
}