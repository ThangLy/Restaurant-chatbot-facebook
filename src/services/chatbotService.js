import { response } from "express";
import request from "request";
require('dotenv').config();

const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;

const IMAGE_GET_STARTED = 'https://phongvu.vn/cong-nghe/wp-content/uploads/2018/07/hinh-nen-laptop-dep-danh-cho-man-hinh-ips-1.jpg'
let callSendAPI = (sender_psid, response) => {
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

let getUserName = (sender_psid) => {
    return new Promise((resolve, reject) => {
        // Send the HTTP request to the Messenger Platform
        request({
            "uri": `https://graph.facebook.com/${sender_psid}?fields=first_name,last_name,profile_pic&access_token=${PAGE_ACCESS_TOKEN}`,
            "method": "GET",
        }, (err, res, body) => {
            if (!err) {
                body = JSON.parse(body);
                let username = `${body.last_name} ${body.first_name}`;
                resolve(username);
            } else {
                console.error("Unable to send message:" + err);
                reject(err);
            }
        });
    })
}

let handleGetStarted = (sender_psid) => {
    return new Promise(async (resolve, reject) => {
        try {
            let username = await getUserName(sender_psid);
            let response1 = { "text": `Xin chào mừng bạn ${username} đến với 1 con bot sắp thông minh.` }

            let response2 = sendGetStartedTemplate();

            //send text message
            await callSendAPI(sender_psid, response1);

            //send generic template message
            await callSendAPI(sender_psid, response2);

            resolve('done');
        } catch (e) {
            reject(e);
        }
    })
}

let sendGetStartedTemplate = () => {
    let response = {
        "attachment": {
            "type": "template",
            "payload": {
                "template_type": "generic",
                "elements": [{
                    "title": "Bạn với Bot xem ai thông minh hơn?",
                    "subtitle": "lựa chọn cho đi bot sẽ trả lời bạn.",
                    "image_url": IMAGE_GET_STARTED,
                    "buttons": [
                        {
                            "type": "postback",
                            "title": "Tôi thông minh hơn bạn!",
                            "payload": "Dung_Vay",
                        },
                        {
                            "type": "postback",
                            "title": "Bạn thông minh thua tôi!",
                            "payload": "Chuan_Luon",
                        },
                        {
                            "type": "postback",
                            "title": "Hưỡng dẫn sử dụng bot",
                            "payload": "Guide_To-Use",
                        }
                    ],
                }]
            }
        }
    }
    return response;
}

module.exports = {
    handleGetStarted: handleGetStarted
}