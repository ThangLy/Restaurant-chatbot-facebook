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
            let response1 = { "text": `Xin ch??o m???ng b???n ${username} ?????n v???i l???u Thu???n Ph??t.` }

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
                    "title": "L???u Thu???n Ph??t k??nh ch??o qu?? kh??ch",
                    "subtitle": "D?????i ????y l?? c??c l???a ch???n c???a nh?? h??ng",
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
                            "title": "?????t b??n",
                            "webview_height_ratio": "tall",
                            "messenger_extensions": true //false: open the webview in new tab
                        },
                        {
                            "type": "postback",
                            "title": "H?????ng d???n s??? d???ng bot",
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
                        "title": "Menu c???a nh?? h??ng",
                        "subtitle": "Ch??ng t??i mang ?????n cho b???n th???c ????n phong ph?? cho b???a tr??a ho???c b???a t???i",
                        "image_url": IMAGE_GET_STARTED,
                        "buttons": [
                            {
                                "type": "postback",
                                "title": "B???a Tr??a",
                                "payload": "LUNCH_MENU",
                            },
                            {
                                "type": "postback",
                                "title": "B???a T???i",
                                "payload": "DINNER_MENU",
                            }
                        ],
                    },
                    {
                        "title": "Gi??? m??? c???a",
                        "subtitle": "Th??? 2 ?????n ch??? nh???t h??ng tu???n | 10AM - 10PM",
                        "image_url": IMAGE_GET_STARTED,
                        "buttons": [
                            {
                                "type": "web_url",
                                "url": `${process.env.URL_WEB_VIEW_ORDER}/${senderID}`,
                                "title": "?????t b??n",
                                "webview_height_ratio": "tall",
                                "messenger_extensions": true //false: open the webview in new tab
                            },
                        ],
                    },
                    {
                        "title": "Kh??ng gian c???a l???u Thu???n Ph??t",
                        "subtitle": "Ph???c v??? cho m???i bu???i nh???u c???a c??c b???n =))",
                        "image_url": IMAGE_GET_STARTED,
                        "buttons": [
                            {
                                "type": "postback",
                                "title": "Ph??ng ????? nh???u",
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
                        "title": "M??n N?????ng",
                        "subtitle": "C?? nhi???u m??n tr??ng mi???ng h???p d???n",
                        "image_url": IMAGE_GET_NUONG,
                        "buttons": [
                            {
                                "type": "postback",
                                "title": "Xem Chi Ti???t",
                                "payload": "VIEW_APPETIZERS",
                            }
                        ],
                    },
                    {
                        "title": "L???u",
                        "subtitle": "Nhi???u lo???i l???u",
                        "image_url": IMAGE_GET_LAU,
                        "buttons": [
                            {
                                "type": "postback",
                                "title": "Xem Chi Ti???t",
                                "payload": "VIEW_LAU",
                            }
                        ],
                    },
                    {
                        "title": "M??n X??o",
                        "subtitle": "Awesome =))",
                        "image_url": IMAGE_GET_XAO,
                        "buttons": [
                            {
                                "type": "postback",
                                "title": "Xem Chi Ti???t",
                                "payload": "View_BEER",
                            }
                        ],
                    },
                    {
                        "title": "Gi???i kh??t",
                        "subtitle": "Awesome =))",
                        "image_url": IMAGE_GET_DRINK,
                        "buttons": [
                            {
                                "type": "postback",
                                "title": "Xem Chi Ti???t",
                                "payload": "View_BEER",
                            }
                        ],
                    },
                    {
                        "title": "Quay tr??? l???i",
                        "subtitle": "Quay tr??? l???i Menu",
                        "image_url": IMAGE_GET_STARTED,
                        "buttons": [
                            {
                                "type": "postback",
                                "title": "QUAY TR??? L???I",
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
                        "title": "M??n Khai V???",
                        "subtitle": "C?? nhi???u m??n tr??ng mi???ng h???p d???n",
                        "image_url": IMAGE_GET_STARTED,
                        "buttons": [
                            {
                                "type": "postback",
                                "title": "Xem Chi Ti???t",
                                "payload": "VIEW_APPETIZERS",
                            }
                        ],
                    },
                    {
                        "title": "L???u",
                        "subtitle": "Nhi???u lo???i l???u",
                        "image_url": IMAGE_GET_STARTED,
                        "buttons": [
                            {
                                "type": "postback",
                                "title": "Xem Chi Ti???t",
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
                                "title": "Xem Chi Ti???t",
                                "payload": "View_BEER",
                            }
                        ],
                    },
                    {
                        "title": "Quay tr??? l???i",
                        "subtitle": "Quay tr??? l???i Menu",
                        "image_url": IMAGE_GET_STARTED,
                        "buttons": [
                            {
                                "type": "postback",
                                "title": "QUAY TR??? L???I",
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
                        "title": "?????u h?? l?????t v??n",
                        "subtitle": "Th??m ngon m???i b???n ??n nha - 40.000/p",
                        "image_url": IMAGE_GET_STARTED,
                    },

                    {
                        "title": "G???i ng?? sen",
                        "subtitle": "Th??m ngon m???i b???n ??n nha - 120.000/p",
                        "image_url": IMAGE_GET_STARTED,

                    },
                    {
                        "title": "S??p b??o ng?? vi c?? h???o h???ng",
                        "subtitle": "Awesome =)) - 240.000/p",
                        "image_url": IMAGE_GET_STARTED,
                    },
                    {
                        "title": "Quay tr??? l???i",
                        "subtitle": "Quay tr??? l???i Menu",
                        "image_url": IMAGE_GET_STARTED,
                        "buttons": [
                            {
                                "type": "postback",
                                "title": "QUAY TR??? L???I",
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
                        "title": "L???u c??",
                        "subtitle": "Th??m ngon m???i b???n ??n nha - 240.000/p",
                        "image_url": IMAGE_GET_STARTED,
                    },

                    {
                        "title": "L???u th??i",
                        "subtitle": "Th??m ngon m???i b???n ??n nha - 220.000/p",
                        "image_url": IMAGE_GET_STARTED,

                    },
                    {
                        "title": "L???u b??",
                        "subtitle": "Awesome =)) - 260.000/p",
                        "image_url": IMAGE_GET_STARTED,
                    },
                    {
                        "title": "Quay tr??? l???i",
                        "subtitle": "Quay tr??? l???i Menu",
                        "image_url": IMAGE_GET_STARTED,
                        "buttons": [
                            {
                                "type": "postback",
                                "title": "QUAY TR??? L???I",
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
                        "subtitle": "R?????u bia kh??ng ??p",
                        "image_url": IMAGE_GET_STARTED,
                    },

                    {
                        "title": "S??i G??n Lager",
                        "subtitle": "R?????u bia kh??ng ??p",
                        "image_url": IMAGE_GET_STARTED,

                    },
                    {
                        "title": "Corona",
                        "subtitle": "Awesome =))",
                        "image_url": IMAGE_GET_STARTED,
                    },
                    {
                        "title": "Quay tr??? l???i",
                        "subtitle": "Quay tr??? l???i Menu",
                        "image_url": IMAGE_GET_STARTED,
                        "buttons": [
                            {
                                "type": "postback",
                                "title": "QUAY TR??? L???I",
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
                "text": "C?? th??? ph???c v??? m???i m???t tr???n",
                "buttons": [
                    {
                        "type": "postback",
                        "title": "Menu",
                        "payload": "MAIN_MENU",
                    },
                    {
                        "type": "postback",
                        "title": "QUAY TR??? L???I",
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