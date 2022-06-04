import admin from 'firebase-admin';

async function sendNotification(title, body, token) {
    await admin
    .messaging()
    .send({
        notification: {
            title,
            body
          }, 
        token,
    })
    .then((res) => {
        console.log('notification successfully sent', res);
    })
    .catch((error) => {
        console.log('something went wrong', error);
    })
}

module.exports = { sendNotification }