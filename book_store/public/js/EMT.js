// Event Emitter

const EventEmitter = require('events');
const alertMessage = require('../../helpers/messenger');
// const alertMessage = require('../helpers/messenger');


/*
/ means the root of the current drive;

./ means the current directory;

../ means the parent of the current directory

*/


class EMT extends EventEmitter {
    notify_user(message) {
        this.emit('notify_user')
    }

    nothing(message) {
        console.log("Nothing happens")
    }
}

// const EMT_obj = new EMT();

// EMT_obj.on('notify_user', (arg, req, res) => {
//     alertMessage(res, 'success', `You are at the event emitter page! + ${arg}`, 'fas fa-sign-in-alt', true);
// });

module.exports = EMT;