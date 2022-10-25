const socket = io()
// elements
const $messageForm = document.querySelector('#message-form')
const $messageFormInput = document.querySelector('input')
const $messageFormButton = document.querySelector('button')
const $sendLocationButton = document.querySelector('#send-location')
const $messages = document.querySelector('#messages')

// templates  

const messageTemplate = document.querySelector('#message-template').innerHTML
const locationMessageTemplate = document.querySelector('#location-message-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML


// Options

const { username , room } = Qs.parse(location.search,{ ignoreQueryPrefix:true})

const autoscroll = () =>{
    // new message element
    const $newMessage = $messages.lastElementChild

    // height of new message
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeigh = $newMessage.offsetHeight + newMessageMargin

    // visible height
    const visibleHeight = $messages.offsetHeight

    // height of messages container

    const containerHeight = $messages.scrollHeight

    // how far have i scrolled

    const scrollOffset = $messages.scrollTop + visibleHeight

    if(containerHeight - newMessageHeigh <= scrollOffset){

        $messages.scrollTop = $messages.scrollHeight

    }

}



socket.on('message',(message)=>{

    console.log(message)
    const html = Mustache.render(messageTemplate, {
        username: message.username,
        message: message.text,
        createdAt: moment(message.createdAt).format('h:mm a')
    })

    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()

})

socket.on('locationMessage' , (message)=>{
    console.log(message)
    const html = Mustache.render(locationMessageTemplate,{
        username : message.username,
        url : message.url,
        createdAt : moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

socket.on('roomData',({room , users}) =>{
    const html = Mustache.render(sidebarTemplate,{
        room,
        users

    })
    document.querySelector('#sidebar').innerHTML = html
})

$messageForm.addEventListener('submit',(e)=>{
    e.preventDefault()

    $messageFormButton.setAttribute('disabled','disabled')
    // const message = document.querySelector('input').value

    // disable

    const message = e.target.elements.message.value
    socket.emit('sendMessage',message,(error)=>{

        $messageFormButton.removeAttribute('disabled')
        $messageFormInput.value = ''
        $messageFormInput.focus()

        // enable

        if(error){
            return console.log(error)

        }
        console.log('message delivered')
    })

})

$sendLocationButton.addEventListener('click',()=>{
    if(!navigator.geolocation){
        return alert('geolocation is not supported by your browser')
    }
    $sendLocationButton.setAttribute('disabled','disabled')

    
    navigator.geolocation.getCurrentPosition((position) => {

        // console.log(position)
        socket.emit('sendlocation',{
            latitude:position.coords.latitude,
            longitude:position.coords.longitude
        },()=>{
            $sendLocationButton.removeAttribute('disabled')
            console.log('location shared')
        })

    })
})

socket.emit('join',{username,room},(error)=>{
    if(error){
        alert(error)
        location.href = '/'
    }
})


// socket.on('countUpdated',(count)=>{
//     console.log('the count has been updated')
// })

// document.querySelector('#increment').addEventListener('click',()=>{
//     console.log('clicked')
//     socket.emit('increment')
// })