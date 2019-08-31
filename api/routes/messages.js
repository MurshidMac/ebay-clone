const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const User = require('../models/user');
const Message = require('../models/message');

router.get('/:userId/sent', (req, res, next) => {
	User.find({ sender: userId})
	.select('_id sender receiver time text')
	.exec()
	.then(docs => {
        const response = {
            count: docs.length,
            users: docs.map(doc => {
                    return {
                            _id: doc._id,
                            sender: doc.sender,
                            receiver: doc.receiver,
                            subject: doc.subject,
                            time: doc.time,
                            text: doc.text
                    }
                })
            };
            res.status(200).json(response);
        })
	.catch(err => {
		console.log(err);
		res.status(500).json({
			error: err
		});
	})
});

router.get('/:userId/received', (req, res, next) => {
	User.find({ received: userId})
	.select('_id sender receiver time text')
	.exec()
	.then(docs => {
        const response = {
            count: docs.length,
            users: docs.map(doc => {
                    return {
                            _id: doc._id,
                            sender: doc.sender,
                            receiver: doc.receiver,
                            subject: doc.subject,
                            time: doc.time,
                            text: doc.text
                    }
                })
            };
            res.status(200).json(response);
        })
	.catch(err => {
		console.log(err);
		res.status(500).json({
			error: err
		});
	})
});

router.post('/', (req, res, next) => {
	
});

router.delete('/:messageId', (req, res, next) => {
	Message.remove({ _id: req.params.messageId})
	.exec()
	.then(result => {
		res.status(200).json({
			message: 'Message Deleted'
		})
	})
	.catch(err => {
		console.log(err);
		res.status(500).json({
			error: err
		});
	});
})
module.exports = router;
