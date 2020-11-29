let timer
let selectedUser = []
$('#userSearchTextbox').keydown(e => {
    clearTimeout(timer)
    let textbox = $(e.target)
    let value = textbox.val()

    if (value == "" && (e.which == 8 || e.keyCode == 8)) {
        //remove user from selection
        selectedUser.pop()
        updateSelectedUser()
        $('.resultsContainer').html('')
        if (selectedUser.length === 0)
            $('#createChatButton').prop('disabled', true)
        return
    }

    timer = setTimeout(() => {
        value = textbox.val().trim()
        if (value == '')
            $('.resultsContainer').html('')
        else {
            seachUsers(value)
        }
    }, 1000)
})

function seachUsers(searchTerm) {
    let url = `/api/users/page/search`
    $.get(url, { search: searchTerm }, (results) => {
        outputSelectableUsers(results, $(".resultsContainer"));
    })
}

function outputSelectableUsers(results, container) {
    container.html("");
    results.forEach(result => {
        if (result._id === userLoggedInClient._id || selectedUser.some(u => u._id === result._id)) {
            return
        } else {
            let html = createUserHtml(result, false);
            container.append(html);
        }
    });

    if (results.length == 0) {
        container.append("<span class='noResults'>No results found</span>")
    }
}

function updateSelectedUser() {
    let elements = []
    selectedUser.forEach((u) => {
        let username = u.username
        let htmlElement = $(`<span class="selectedUser">${username}</span>`)
        elements.push(htmlElement)
    })

    $('.selectedUser').remove()
    $('#selectedUsers').prepend(elements)
}

$(document).ready(function () {
    $(document).on('click', '.user', function (e) {
        selectedUser.push({
            _id: $(this).data('id'),
            username: $(this).data('username')
        })
        updateSelectedUser()
        $('#userSearchTextbox').val("").focus()
        $('.resultsContainer').html('')

        if (selectedUser.length > 0)
            $('#createChatButton').prop('disabled', false)
    })

    $(document).on('click', '#createChatButton', ((e) => {
        if (!selectedUser.length > 0) {
            return alert('please choose somene to create chat')
        }
        let data = JSON.stringify(selectedUser)

        $.post("/api/chats", { users: data }, chat => {
            if (!chat || !chat._id)
                return alert('Invalid response')
            window.location.href = `/messages/${chat._id}`
        })
    }))
})