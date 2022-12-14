import { response } from "express";
import request from "request";
require('dotenv').config();

const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;

const IMAGE_GET_STARTED = 'https://cdn.discordapp.com/attachments/601413306355417088/979764015452528660/Menu.PNG'
const IMAGE_GET_DRINK = 'https://cdn.discordapp.com/attachments/601413306355417088/979765093996838982/GiaiKhat.PNG'
const IMAGE_GET_LAU = 'https://cdn.discordapp.com/attachments/601413306355417088/979765094265270352/Lau.PNG'
const IMAGE_GET_Nuong = 'https://cdn.discordapp.com/attachments/601413306355417088/979765094550474782/Nuong.PNG'
const IMAGE_GET_XAO = 'https://cdn.discordapp.com/attachments/601413306355417088/979765094768603156/Xao.PNG'
let callSendAPI = async (sender_psid, response) => {
    // Construct the message body
    let request_body = {
        "recipient": {
            "id": sender_psid
        },
        "message": response
    }

    await SendMarkReadMessage(sender_psid);
    await SendTypingOn(sender_psid);

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

let SendTypingOn = (sender_psid) => {
    // Construct the message body
    let request_body = {
        "recipient": {
            "id": sender_psid
        },
        "sender_action": "typing_on"
    }

    // Send the HTTP request to the Messenger Platform
    request({
        "uri": "https://graph.facebook.com/v13.0/me/messages",
        "qs": { "access_token": PAGE_ACCESS_TOKEN },
        "method": "POST",
        "json": request_body
    }, (err, res, body) => {
        if (!err) {
            console.log('SendTypingOn sent!')
        } else {
            console.error("Unable to send SendTypingOn:" + err);
        }
    });
}

let SendMarkReadMessage = (sender_psid) => {
    // Construct the message body
    let request_body = {
        "recipient": {
            "id": sender_psid
        },
        "sender_action": "mark_seen"
    }

    // Send the HTTP request to the Messenger Platform
    request({
        "uri": "https://graph.facebook.com/v13.0/me/messages",
        "qs": { "access_token": PAGE_ACCESS_TOKEN },
        "method": "POST",
        "json": request_body
    }, (err, res, body) => {
        if (!err) {
            console.log('SendMarkReadMessage sent!')
        } else {
            console.error("Unable to send SendMarkReadMessage:" + err);
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

            let response2 = getStartedTemplate(sender_psid);

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

let getStartedTemplate = (senderID) => {
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
                            "type": "web_url",
                            "url": `${process.env.URL_WEB_VIEW_ORDER}/${senderID}`,
                            "title": "Đặt bàn",
                            "webview_height_ratio": "tall",
                            "messenger_extensions": true //false: open the webview in new tab
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

let handleSendMainMenu = (sender_psid) => {
    return new Promise(async (resolve, reject) => {
        try {
            let response = getMainMenuTemplate(sender_psid);

            //send generic template message
            await callSendAPI(sender_psid, response);

            resolve('done');
        } catch (e) {
            reject(e);
        }
    })
}

let getMainMenuTemplate = (senderID) => {
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
                                "type": "web_url",
                                "url": `${process.env.URL_WEB_VIEW_ORDER}/${senderID}`,
                                "title": "Đặt bàn",
                                "webview_height_ratio": "tall",
                                "messenger_extensions": true //false: open the webview in new tab
                            },
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
                                "payload": "SHOW_ROOMS",
                            }
                        ],
                    }
                ]
            }
        }
    }
    return response;
}

let handleSendLunchMenu = (sender_psid) => {
    return new Promise(async (resolve, reject) => {
        try {
            let response = getMainLunchTemplate();

            //send generic template message
            await callSendAPI(sender_psid, response);

            resolve('done');
        } catch (e) {
            reject(e);
        }
    })
}

let getMainLunchTemplate = () => {
    let response = {
        "attachment": {
            "type": "template",
            "payload": {
                "template_type": "generic",
                "elements": [
                    {
                        "title": "Món Nướng",
                        "subtitle": "Có nhiều món tráng miệng hấp dẫn",
                        "image_url": IMAGE_GET_NUONG,
                        "buttons": [
                            {
                                "type": "postback",
                                "title": "Xem Chi Tiết",
                                "payload": "VIEW_APPETIZERS",
                            }
                        ],
                    },
                    {
                        "title": "Lẩu",
                        "subtitle": "Nhiều loại lẩu",
                        "image_url": IMAGE_GET_LAU,
                        "buttons": [
                            {
                                "type": "postback",
                                "title": "Xem Chi Tiết",
                                "payload": "VIEW_LAU",
                            }
                        ],
                    },
                    {
                        "title": "Món Xào",
                        "subtitle": "Awesome =))",
                        "image_url": IMAGE_GET_XAO,
                        "buttons": [
                            {
                                "type": "postback",
                                "title": "Xem Chi Tiết",
                                "payload": "View_BEER",
                            }
                        ],
                    },
                    {
                        "title": "Giải khát",
                        "subtitle": "Awesome =))",
                        "image_url": IMAGE_GET_DRINK,
                        "buttons": [
                            {
                                "type": "postback",
                                "title": "Xem Chi Tiết",
                                "payload": "View_BEER",
                            }
                        ],
                    },
                    {
                        "title": "Quay trở lại",
                        "subtitle": "Quay trở lại Menu",
                        "image_url": IMAGE_GET_STARTED,
                        "buttons": [
                            {
                                "type": "postback",
                                "title": "QUAY TRỞ LẠI",
                                "payload": "BACK_TO_MENU",
                            }
                        ],
                    }
                ]
            }
        }
    }

    return response;

}

let handleSendDinnerMenu = (sender_psid) => {
    return new Promise(async (resolve, reject) => {
        try {
            let response = getMainDinnerTemplate();

            //send generic template message
            await callSendAPI(sender_psid, response);

            resolve('done');
        } catch (e) {
            reject(e);
        }
    })
}

let getMainDinnerTemplate = () => {
    let response = {
        "attachment": {
            "type": "template",
            "payload": {
                "template_type": "generic",
                "elements": [
                    {
                        "title": "Món Khai Vị",
                        "subtitle": "Có nhiều món tráng miệng hấp dẫn",
                        "image_url": IMAGE_GET_STARTED,
                        "buttons": [
                            {
                                "type": "postback",
                                "title": "Xem Chi Tiết",
                                "payload": "VIEW_APPETIZERS",
                            }
                        ],
                    },
                    {
                        "title": "Lẩu",
                        "subtitle": "Nhiều loại lẩu",
                        "image_url": IMAGE_GET_STARTED,
                        "buttons": [
                            {
                                "type": "postback",
                                "title": "Xem Chi Tiết",
                                "payload": "VIEW_LAU",
                            }
                        ],
                    },
                    {
                        "title": "Bia",
                        "subtitle": "Awesome =))",
                        "image_url": IMAGE_GET_STARTED,
                        "buttons": [
                            {
                                "type": "postback",
                                "title": "Xem Chi Tiết",
                                "payload": "View_BEER",
                            }
                        ],
                    },
                    {
                        "title": "Quay trở lại",
                        "subtitle": "Quay trở lại Menu",
                        "image_url": IMAGE_GET_STARTED,
                        "buttons": [
                            {
                                "type": "postback",
                                "title": "QUAY TRỞ LẠI",
                                "payload": "BACK_TO_MENU",
                            }
                        ],
                    }
                ]
            }
        }
    }

    return response;
}

let handleBackToMenu = async (sender_psid) => {
    await handleSendMainMenu(sender_psid);
}

let handleDetailViewAppetizers = async (sender_psid) => {
    return new Promise(async (resolve, reject) => {
        try {
            let response = getDetailViewAppetizersTemplate();

            //send generic template message
            await callSendAPI(sender_psid, response);

            resolve('done');
        } catch (e) {
            reject(e);
        }
    })
}

let getDetailViewAppetizersTemplate = () => {
    let response = {
        "attachment": {
            "type": "template",
            "payload": {
                "template_type": "generic",
                "elements": [
                    {
                        "title": "Đậu hũ lướt ván",
                        "subtitle": "Thơm ngon mời bạn ăn nha - 40.000/p",
                        "image_url": IMAGE_GET_STARTED,
                    },

                    {
                        "title": "Gỏi ngó sen",
                        "subtitle": "Thơm ngon mời bạn ăn nha - 120.000/p",
                        "image_url": IMAGE_GET_STARTED,

                    },
                    {
                        "title": "Súp bào ngư vi cá hảo hạng",
                        "subtitle": "Awesome =)) - 240.000/p",
                        "image_url": IMAGE_GET_STARTED,
                    },
                    {
                        "title": "Quay trở lại",
                        "subtitle": "Quay trở lại Menu",
                        "image_url": IMAGE_GET_STARTED,
                        "buttons": [
                            {
                                "type": "postback",
                                "title": "QUAY TRỞ LẠI",
                                "payload": "BACK_TO_MENU",
                            }
                        ],
                    }
                ]
            }
        }
    }

    return response;

}

let getDetailViewLAUTemplate = () => {
    let response = {
        "attachment": {
            "type": "template",
            "payload": {
                "template_type": "generic",
                "elements": [
                    {
                        "title": "Lẩu cá",
                        "subtitle": "Thơm ngon mời bạn ăn nha - 240.000/p",
                        "image_url": IMAGE_GET_STARTED,
                    },

                    {
                        "title": "Lẩu thái",
                        "subtitle": "Thơm ngon mời bạn ăn nha - 220.000/p",
                        "image_url": IMAGE_GET_STARTED,

                    },
                    {
                        "title": "Lẩu bò",
                        "subtitle": "Awesome =)) - 260.000/p",
                        "image_url": IMAGE_GET_STARTED,
                    },
                    {
                        "title": "Quay trở lại",
                        "subtitle": "Quay trở lại Menu",
                        "image_url": IMAGE_GET_STARTED,
                        "buttons": [
                            {
                                "type": "postback",
                                "title": "QUAY TRỞ LẠI",
                                "payload": "BACK_TO_MENU",
                            }
                        ],
                    }
                ]
            }
        }
    }

    return response;

}

let getDetailViewBeerTemplate = () => {
    let response = {
        "attachment": {
            "type": "template",
            "payload": {
                "template_type": "generic",
                "elements": [
                    {
                        "title": "Tiger",
                        "subtitle": "Rượu bia không ép",
                        "image_url": IMAGE_GET_STARTED,
                    },

                    {
                        "title": "Sài Gòn Lager",
                        "subtitle": "Rượu bia không ép",
                        "image_url": IMAGE_GET_STARTED,

                    },
                    {
                        "title": "Corona",
                        "subtitle": "Awesome =))",
                        "image_url": IMAGE_GET_STARTED,
                    },
                    {
                        "title": "Quay trở lại",
                        "subtitle": "Quay trở lại Menu",
                        "image_url": IMAGE_GET_STARTED,
                        "buttons": [
                            {
                                "type": "postback",
                                "title": "QUAY TRỞ LẠI",
                                "payload": "BACK_TO_MENU",
                            }
                        ],
                    }
                ]
            }
        }
    }

    return response;

}


let handleDetailViewLAU = async (sender_psid) => {
    return new Promise(async (resolve, reject) => {
        try {
            let response = getDetailViewLAUTemplate();

            //send generic template message
            await callSendAPI(sender_psid, response);

            resolve('done');
        } catch (e) {
            reject(e);
        }
    })
}

let handleDetailViewBeer = async (sender_psid) => {
    return new Promise(async (resolve, reject) => {
        try {
            let response = getDetailViewBeerTemplate();

            //send generic template message
            await callSendAPI(sender_psid, response);

            resolve('done');
        } catch (e) {
            reject(e);
        }
    })
}

let getImageRoomsTemplate = () => {
    let response = {
        "attachment": {
            "type": "image",
            "payload": {
                "url": IMAGE_GET_STARTED,
                "is_reusable": true
            }
        }
    }
    return response;
}

let getButtonRoomsTemplate = () => {
    let response = {
        "attachment": {
            "type": "template",
            "payload": {
                "template_type": "button",
                "text": "Có thể phục vụ mọi mặt trận",
                "buttons": [
                    {
                        "type": "postback",
                        "title": "Menu",
                        "payload": "MAIN_MENU",
                    },
                    {
                        "type": "postback",
                        "title": "QUAY TRỞ LẠI",
                        "payload": "BACK_TO_MENU",
                    },
                ]
            }
        }
    }
    return response;
}

let handleShowDetailRooms = async (sender_psid) => {
    return new Promise(async (resolve, reject) => {
        try {

            let response1 = getImageRoomsTemplate();
            await callSendAPI(sender_psid, response1);

            let response2 = getButtonRoomsTemplate();
            await callSendAPI(sender_psid, response2);

            resolve('done');
        } catch (e) {
            reject(e);
        }
    })
}

module.exports = {
    handleGetStarted: handleGetStarted,
    handleSendMainMenu: handleSendMainMenu,
    handleSendLunchMenu: handleSendLunchMenu,
    handleSendDinnerMenu: handleSendDinnerMenu,
    handleBackToMenu: handleBackToMenu,
    handleDetailViewAppetizers: handleDetailViewAppetizers,
    handleDetailViewLAU: handleDetailViewLAU,
    handleDetailViewBeer: handleDetailViewBeer,
    handleShowDetailRooms: handleShowDetailRooms,
    callSendAPI: callSendAPI,
}