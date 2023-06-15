/**
 * https://github.com/amirwolf5122/Telegram-time-group-bot
 */

const TOKEN = '***' // Get it from @BotFather https://core.telegram.org/bots#6-botfather
const NAME = "Amir" //Name group Or Channel
const IDCHAT = -1001966565849 // Get it from @chatIDrobot  ## Getting the numerical ID of a group or channel.
const TIMEZON = 'Asia/Tehran' // The timezone of your country
const WEBHOOK = '/endpoint'// No need to edit
const SECRET = 'QUEVEDO_BZRP_Music_Sessions_52' // No need to edit

/**
 * Wait for requests to the worker
 */
addEventListener('fetch', event => {
  const url = new URL(event.request.url)
  if (url.pathname === WEBHOOK) {
    event.respondWith(handleWebhook(event))
  } else if (url.pathname === '/cron') {
    event.respondWith(settilte(event))
  } else if (url.pathname === '/registerWebhook') {
    event.respondWith(registerWebhook(event, url, WEBHOOK, SECRET))
  } else if (url.pathname === '/unRegisterWebhook') {
    event.respondWith(unRegisterWebhook(event))
  } else {
    event.respondWith(new Response('No handler for this request'))
  }
})

async function settilte (event) {
  const id2232 = await fetch(`https://api.telegram.org/bot${TOKEN}/getWebhookInfo`)
  const id22e2 = await id2232.json();
  if (id22e2.ok){
    if (id22e2.result.url){
      var date = new Date();
      var options = { timeZone: TIMEZON, hour12: false, hour: 'numeric', minute: 'numeric' };
      var time = date.toLocaleTimeString('en-US', options);
  
      if (time.slice(0,2) === '24') {
        time = '00' + time.slice(2);
      }
      const id223 = (await fetch(apiUrl('setChatTitle', {
          chat_id: IDCHAT,
          title: NAME + " " +time,
        })))
      await fetch(apiUrl('SetChatDescription', {
          chat_id: IDCHAT,
          description: `Time:${time}`,
        }))
      const response23 = await id223.json();
      return new Response(JSON.stringify(response23, null, 2))
    }else{
      return new Response("ERROR:Webhook not done")
    }
  }else{
    return new Response("ERROR:The token is incorrect")
  }
}
async function handleWebhook (event) {
  if (event.request.headers.get('X-Telegram-Bot-Api-Secret-Token') !== SECRET) {
    return new Response('Unauthorized', { status: 403 })
  }
  const update = await event.request.json()
  event.waitUntil(onUpdate(update))

  return new Response('Ok')
}

async function onUpdate (update) {
    if ('message' in update) {
      var message = update.message
    }else{
      var message = update
    }
    if ('my_chat_member' in message) {
      var chat_id23 = message.my_chat_member.chat
    }else{
      if ('channel_post' in message) {
        var chat_id23 = message.channel_post.chat
      }else{
        var chat_id23 = message.chat
      }
    }
    if ('channel_post' in message) {
      var message_id23 = message.channel_post.message_id
    }else{
      var message_id23 = message.message_id
    }
    //fetch(`https://api.telegram.org/bot${TOKEN}/sendMessage?chat_id=6126601231&text=${JSON.stringify(message, null, 2)}`);
    
    if ('new_chat_title' in message || 'channel_post' in message && 'new_chat_title' in message.channel_post) {
      const id223 = (await fetch(apiUrl('getMe')))
      const response23 = await id223.json();
      if (chat_id23.type == "channel" || response23.result.id == message.from.id){
        return (await fetch(apiUrl('deleteMessage', {
          chat_id: chat_id23.id,
          message_id: message_id23,
        }))).json()
      }
    }
    if ('my_chat_member' in message && chat_id23.type != "private" && chat_id23.id != IDCHAT || chat_id23.type != "private" && chat_id23.id != IDCHAT ) {
      return (await fetch(apiUrl('leaveChat', {
        chat_id: chat_id23.id,
      }))).json()
    }
    if ( message.chat.type == "private"){
      if (message.text == "/start") {
        return (await fetch(apiUrl('sendMessage', {
          chat_id: chat_id23.id,
          text: "There is no command",
          reply_to_message_id: message_id23
        }))).json()
      }
    }
}

async function registerWebhook (event, requestUrl, suffix, secret) {
  const webhookUrl = `${requestUrl.protocol}//${requestUrl.hostname}${suffix}`
  const r = await (await fetch(apiUrl('setWebhook', { url: webhookUrl, secret_token: secret }))).json()
  return new Response('ok' in r && r.ok ? 'Ok' : JSON.stringify(r, null, 2))
}

async function unRegisterWebhook (event) {
  const r = await (await fetch(apiUrl('setWebhook', { url: '' }))).json()
  return new Response('ok' in r && r.ok ? 'Ok' : JSON.stringify(r, null, 2))
}

function apiUrl (methodName, params = null) {
  let query = ''
  if (params) {
    query = '?' + new URLSearchParams(params).toString()
  }
  return `https://api.telegram.org/bot${TOKEN}/${methodName}${query}`
}
