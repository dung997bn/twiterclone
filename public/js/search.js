$(document).ready(() => {
    let timer

    $('#searchBox').keydown(e => {
        clearTimeout(timer)
        let textbox = $(e.target)
        let value = textbox.val()
        let searchTab = textbox.data('search')
        timer = setTimeout(() => {
            value = textbox.val().trim()
            if (value == '')
                $('.resultsContainer').html('')
            else {
                seach(value, searchTab)
            }
        }, 1000)
    })

})

function seach(searchTerm, searchTab) {
    let urlPath = searchTab == 'users' ? 'users' : 'posts'
    let url = `/api/${urlPath}/page/search`
    $.get(url, { search: searchTerm }, (results) => {
        if (searchTab == 'users') {
            outputUsers(results, $(".resultsContainer"));
        } else {
            outputPosts(results, $('.resultsContainer'))
        }
    })
}
