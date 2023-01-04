import bot from "./assets/bot.svg";
import user from "./assets/user.svg";

const form = document.querySelector('form')
const chatContainer = document.querySelector('#chat_container')

let loadInterval;


// loader animation
function loader(element) {
  element.textContent = ''

    // setting interval time
  loadInterval = setInterval(() => {
      // Update the text content of the loading indicator
      element.textContent += '.';

      // If the loading indicator has reached three dots, reset it
      if (element.textContent === '....') {
          element.textContent = '';
      }
  }, 300);
}


// for typing experience
function typeText(element, text) {
  let index = 0

    //setting interval
  let interval = setInterval(() => {
    //if index length is smaller than text length
      if (index < text.length) {
        // this is going to get the charecter under specific index in the text that AI is going to return
          element.innerHTML += text.charAt(index)
          // and then increment that index
          index++
      }
      // and if we reach the end of text we clear the interval 
      else {
          clearInterval(interval)
      }
  }, 20)
}


// for generating random uniques id's
// for generating unique Id for every single message
// generate unique ID for each message div of bot
// necessary for typing text effect for that specific reply
// without unique ID, typing text will work on every element
function generateUniqueId() {
  const timestamp = Date.now();              // making id's unique by using current date
  const randomNumber = Math.random();        // for generating random numbers
  const hexadecimalString = randomNumber.toString(16);   // we gonna get 16 charecters

  return `id-${timestamp}-${hexadecimalString}`;
}



// chat stripe
// for every stripes that comes evertime different for question and answer
function chatStripe(isAi, value, uniqueId) {
  // parameters for is it AI talking or us and then passing the unique id
  return (
      `
      <div class="wrapper ${isAi && 'ai'}">
          <div class="chat">
              <div class="profile">
                  <img 
                    src=${isAi ? bot : user} 
                    alt="${isAi ? 'bot' : 'user'}" 
                  />
              </div>
              <div class="message" id=${uniqueId}>${value}</div>
          </div>
      </div>
  `
  )
}



// function that going to be the trigger to get the AI generated response
const handleSubmit = async (e) => {
  // default browser behaviour for when we submit a form is to reload the browser (but we dont want that to happen) so we use
  e.preventDefault()     // this is gonna prevent the default behavior of browser

  //then get the data that we type into form
  const data = new FormData(form)

  // user's chatstripe
  chatContainer.innerHTML += chatStripe(false, data.get('prompt'))    // passing false as we are not AI and in value we are taking users value using prompt

  // to clear the textarea input 
  form.reset()

  // bot's chatstripe
  const uniqueId = generateUniqueId()      // function we created for generate unique id
  chatContainer.innerHTML += chatStripe(true, " ", uniqueId)     // passes true because AI is passing this time and passes empty string because it can later fill by loader function then provide uique id

  // to focus scroll to the bottom 
  // as user going to type we need to keep scrolling to be able to see the messages
  chatContainer.scrollTop = chatContainer.scrollHeight;     // this will put the new message

  // specific message div 
  const messageDiv = document.getElementById(uniqueId)     // now for fetching newly created div

  // messageDiv.innerHTML = "..."
  loader(messageDiv)

  // fetch data from the server
  const response = await fetch('http://localhost:5000/', {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
          prompt: data.get('prompt')            // this is the data where the message coming from our textarea element on the screen
      })
  })

  clearInterval(loadInterval)       // after we get the response we need to clear the interval
  messageDiv.innerHTML = " "        // because we are not sure at which point in the loading are we (at which point it might be 1 or might be 2) but we want to clear it to the empty for us be able to add our message

  if (response.ok) {
      const data = await response.json();      // this will give us the actual response coming from the backend
      const parsedData = data.bot.trim()       // trims any trailing spaces/'\n' 
      console.log(parsedData)

      typeText(messageDiv, parsedData)
  } else {
      const err = await response.text()

      messageDiv.innerHTML = "Something went wrong"
      alert(err)
  }
}

// to be able to see the changes that we did in handleSubmit
form.addEventListener('submit', handleSubmit)         // a listner to submit handleevents
form.addEventListener('keyup', (e) => {               // once we press the enter key
    if (e.keyCode === 13) {                           // then call this callback function
        handleSubmit(e)
    }
})