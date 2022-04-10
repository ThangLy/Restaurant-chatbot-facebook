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
            let response1 = { "text": `Xin chào mừng bạn ${username} đến với lẩu Thuận Phát.` }

            let response2 = getStartedTemplate();

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

let getStartedTemplate = () => {
    let response = {
        "attachment": {
            "type": "template",
            "payload": {
                "template_type": "generic",
                "elements": [{
                    "title": "Lẩu Thuận Phát kính chào quý khách",
                    "subtitle": "Dưới đây là các lựa chọn của nhà hàng",
                    "image_url": IMAGE_GET_STARTED,
                    "buttons": [
                        {
                            "type": "postback",
                            "title": "Menu",
                            "payload": "MAIN_MENU",
                        },
                        {
                            "type": "postback",
                            "title": "Đặt Bàn",
                            "payload": "RESERVE_TABLE",
                        },
                        {
                            "type": "postback",
                            "title": "Hướng dẫn sử dụng bot",
                            "payload": "GUIDE_TO-USE",
                        }
                    ],
                }]
            }
        }
    }
    return response;
}

let handleSendMainIdea = () => {
    return new Promise(async (resolve, reject) => {
        try {
            let response2 = getMainIdeaTemplate();

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

let getMainIdeaTemplate = () => {
    let response = {
        "attachment": {
            "type": "template",
            "payload": {
                "template_type": "generic",
                "elements": [
                    {
                        "title": "Menu của nhà hàng",
                        "subtitle": "Chúng tôi mang đến cho bạn thực đơn phong phú cho bữa trưa hoặc bữa tối",
                        "image_url": IMAGE_GET_STARTED,
                        "buttons": [
                            {
                                "type": "postback",
                                "title": "Bữa Trưa",
                                "payload": "LUNCH_MENU",
                            },
                            {
                                "type": "postback",
                                "title": "Bữa Tối",
                                "payload": "DINNER_MENU",
                            }
                        ],
                    },
                    {
                        "title": "Giờ mở cửa",
                        "subtitle": "Thứ 2 đến chủ nhật hàng tuần | 10AM - 10PM",
                        "image_url": IMAGE_GET_STARTED,
                        "buttons": [
                            {
                                "type": "postback",
                                "title": "Đặt Bàn",
                                "payload": "RESERVE_TABLE",
                            }
                        ],
                    },
                    {
                        "title": "Không gian của lẩu Thuận Phát",
                        "subtitle": "Phục vụ cho mọi buổi nhậu của các bạn =))",
                        "image_url": IMAGE_GET_STARTED,
                        "buttons": [
                            {
                                "type": "postback",
                                "title": "Phòng để nhậu",
                                "payload": "SHOW_ROOM",
                            }
                        ],
                    }
                ]
            }
        }
    }
    return response;
}

module.exports = {
    handleGetStarted: handleGetStarted,
    handleSendMainIdea: handleSendMainIdea
}