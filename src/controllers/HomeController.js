require('dotenv').config();
import request from "request";
import chatbotService from "../services/chatbotService";

const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;

//process.env.NAME_VARIABLES
let getHomePage = (req, res) => {
  return res.render('homepage.ejs')
};

let postWebhook = (req, res) => {

  let body = req.body;

  // Checks this is an event from a page subscription
  if (body.object === 'page') {

    // Iterates over each entry - there may be multiple if batched
    body.entry.forEach(function (entry) {

      // Gets the body of the webhook event
      let webhook_event = entry.messaging[0];
      console.log(webhook_event);


      // Get the sender PSID
      let sender_psid = webhook_event.sender.id;
      console.log('Sender PSID: ' + sender_psid);

      // Check if the event is a message or postback and
      // pass the event to the appropriate handler function
      if (webhook_event.message) {
        handleMessage(sender_psid, webhook_event.message);
      } else if (webhook_event.postback) {
        handlePostback(sender_psid, webhook_event.postback);
      }
    });

    // Returns a '200 OK' response to all requests
    res.status(200).send('EVENT_RECEIVED');
  } else {
    // Returns a '404 Not Found' if event is not from a page subscription
    res.sendStatus(404);
  }

};

let getWebhook = (req, res) => {

  // Your verify token. Should be a random string.
  let VERIFY_TOKEN = process.env.VERIFY_TOKEN;

  // Parse the query params
  let mode = req.query['hub.mode'];
  let token = req.query['hub.verify_token'];
  let challenge = req.query['hub.challenge'];

  // Checks if a token and mode is in the query string of the request
  if (mode && token) {

    // Checks the mode and token sent is correct
    if (mode === 'subscribe' && token === VERIFY_TOKEN) {

      // Responds with the challenge token from the request
      console.log('WEBHOOK_VERIFIED');
      res.status(200).send(challenge);

    } else {
      // Responds with '403 Forbidden' if verify tokens do not match
      res.sendStatus(403);
    }
  }

};

// Handles messages events
function handleMessage(sender_psid, received_message) {
  let response;

  // Checks if the message contains text
  if (received_message.text) {
    // Create the payload for a basic text message, which
    // will be added to the body of our request to the Send API
    response = {
      "text": `You sent the message: "${received_message.text}". Now send me an attachment!`
    }
  } else if (received_message.attachments) {
    // Get the URL of the message attachment
    let attachment_url = received_message.attachments[0].payload.url;
    response = {
      "attachment": {
        "type": "template",
        "payload": {
          "template_type": "generic",
          "elements": [{
            "title": "Is this the right picture?",
            "subtitle": "Tap a button to answer.",
            "image_url": attachment_url,
            "buttons": [
              {
                "type": "postback",
                "title": "Yes!",
                "payload": "yes",
              },
              {
                "type": "postback",
                "title": "No!",
                "payload": "no",
              }
            ],
          }]
        }
      }
    }
  }

  // Send the response message
  callSendAPI(sender_psid, response);
}

// Handles messaging_postbacks events
async function handlePostback(sender_psid, received_postback) {
  let response;

  // Get the payload for the postback
  let payload = received_postback.payload;

  // Set the response based on the postback payload
  switch (payload) {
    case 'yes':
      response = { "text": "Thanks!" }
      break;
    case 'no':
      response = { "text": "Oops, try sending another image." }
      break;

    case 'RESTART_BOT':
    case 'GET_STARTED':
      await chatbotService.handleGetStarted(sender_psid);
      break;

    case "MAIN_MENU":
      await chatbotService.handleSendMainMenu(sender_psid);
      break;

    case 'LUNCH_MENU':
      await chatbotService.handleSendLunchMenu(sender_psid);
      break;

    case 'DINNER_MENU':
      await chatbotService.handleSendDinnerMenu(sender_psid);
      break;

    case 'VIEW_APPETIZERS':
      await chatbotService.handleDetailViewAppetizers(sender_psid);
      break;

    case 'VIEW_LAU':
      await chatbotService.handleDetailViewLAU(sender_psid);
      break;

    case 'View_BEER':
      await chatbotService.handleDetailViewBeer(sender_psid);
      break;

    case 'BACK_TO_MENU':
      await chatbotService.handleBackToMenu(sender_psid);
      break;

    case 'SHOW_ROOMS':
      await chatbotService.handleShowDetailRooms(sender_psid);
      break;
    default:
      // code block
      response = { "text": `Oops! idk response with postback ${payload}` }
  }

  // Send the message to acknowledge the postback
  // callSendAPI(sender_psid, response);
}

// Sends response messages via the Send API
function callSendAPI(sender_psid, response) {
  // Construct the message body
  let request_body = {
    "recipient": {
      "id": sender_psid
    },
    "message": response
  }

  // Send the HTTP request to the Messenger Platform
  request({
    "uri": "https://graph.facebook.com/v13.0/me/messages",
    "qs": { "access_token": PAGE_ACCESS_TOKEN },
    "method": "POST",
    "json": request_body
  }, (err, res, body) => {
    if (!err) {
      console.log('message sent!')
    } else {
      console.error("Unable to send message:" + err);
    }
  });
}

let setupProfile = async (req, res) => {
  //Call profile facebook api
  // Construct the message body
  let request_body = {

    "get_started": { "payload": "GET_STARTED" },
    "whitelisted_domains": ["https://chatbot-thangly.herokuapp.com/"]
  }

  //template string

  // Send the HTTP request to the Messenger Platform
  await request({
    "uri": `https://graph.facebook.com/v13.0/me/messenger_profile?access_token=${PAGE_ACCESS_TOKEN}`,
    "qs": { "access_token": PAGE_ACCESS_TOKEN },
    "method": "POST",
    "json": request_body
  }, (err, res, body) => {
    console.log(body)
    if (!err) {
      console.log('Setup user profile succeeds!')
    } else {
      console.error("Unable to setup user profile:" + err);
    }
  });

  return res.send('Setup user profile succeeds!');

}
let setupPersistentMenu = async (req, res) => {
  //Call profile facebook api
  // Construct the message body
  let request_body = {

    "psid": "<PSID>",
    "persistent_menu": [
      {
        "locale": "default",
        "composer_input_disabled": false,
        "call_to_actions": [
          {
            "type": "postback",
            "title": "Kh???i ?????ng l???i bot",
            "payload": "RESTART_BOT"
          },
          {
            "type": "postback",
            "title": "Sao ban khong thay doi",
            "payload": "CURATION"
          },
          {
            "type": "web_url",
            "title": "????y l?? trang web nguy hi???m",
            "url": "https://www.facebook.com/duc.thang.9129/",
            "webview_height_ratio": "full"
          }
        ]
      }
    ]
  }

  //template string

  // Send the HTTP request to the Messenger Platform
  await request({
    "uri": `https://graph.facebook.com/v13.0/me/messenger_profile?access_token=${PAGE_ACCESS_TOKEN}`,
    "qs": { "access_token": PAGE_ACCESS_TOKEN },
    "method": "POST",
    "json": request_body
  }, (err, res, body) => {
    if (!err) {
      console.log('Setup persistent menu succeeds!')
    } else {
      console.error("Unable to setup persistent menu:" + err);
    }
  });

  return res.send('Setup persistent menu succeeds!');
}

let handleReserveTable = (req, res) => {
  let senderId = req.params.senderId;
  return res.render("reserve-table.ejs", {
    senderId: senderId
  });
}

let handlePostReverseTable = async (req, res) => {
  try {
    let customerName = "";
    if (req.body.customerName === "") {
      customerName = "????? Tr???ng";
    } else customerName = req.body.customerName;

    // I demo response with sample text
    // you can check database for customer order's status

    let response1 = {
      "text": `---Th??ng tin kh??ch h??ng ?????t b??n---
        \nH??? v?? T??n: ${customerName}
        \n?????a ch??? email: ${req.body.email}
        \nS??? ??i???n tho???i: ${req.body.phoneNumber}
        `
    };

    await chatbotService.callSendAPI(req.body.psid, response1);

    return res.status(200).json({
      message: "ok"
    });

  } catch (e) {
    console.log('L???i post reserve-table', e)
    return res.status(500).json({
      message: 'Server error'
    });
  }
}

module.exports = {
  getHomePage: getHomePage,
  postWebhook: postWebhook,
  getWebhook: getWebhook,
  setupProfile: setupProfile,
  setupPersistentMenu: setupPersistentMenu,
  handleReserveTable: handleReserveTable,
  handlePostReverseTable: handlePostReverseTable,
}