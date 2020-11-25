$(document).ready(() => {
    $.get("/api/posts", results => {
        console.log(result);
        outputPosts(results, $('.postsContainer'))
    })
})



function outputPosts(results, container) {
    container.html('')

    if(results)

    results.forEach(result => {
        var html = creatPostHtml(result)
        container.append(html)
    })


}