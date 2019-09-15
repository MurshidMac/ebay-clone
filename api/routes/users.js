const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nn = require('nearest-neighbor');

const User = require('../models/user');

router.get('/', (req, res, next) => {
	User.find()
	.select('_id username firstname lastname email phone address city afm rating role')
	.exec()
	.then(docs => {
		const response = {
			count: docs.length,
			users: docs.map(doc => {
				return {
					_id: doc._id,
					username: doc.username,
					firstname: doc.firstname,
					lastname: doc.lastname,
					email: doc.email,
					phone: doc.phone,
					address: doc.address,
					city: doc.city,
					afm: doc.afm,
					rating: doc.rating,
					role: doc.role,
					verified: doc.verified
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

router.post('/signup', (req, res, next) => {
	User.find({ username: req.body.username}) //add more checks
	.exec()
	.then( user => {
		if (user.length >= 1) {
			return res.status(409).json({
				message: 'Username Exists'
			});
		}
		});
	User.find({ email: req.body.email}) //add more checks
	.exec()
	.then( user => {
		if (user.length >= 1) {
			return res.status(409).json({
				message: 'Email Exists'
			});
		}
		});
	User.find({ phone: req.body.phone}) //add more checks
	.exec()
	.then( user => {
		if (user.length >= 1) {
			return res.status(409).json({
				message: 'Phone Exists'
			});
		}
		});
	User.find({ afm: req.body.afm}) //add more checks
	.exec()
	.then( user => {
		if (user.length >= 1) {
			return res.status(409).json({
				message: 'Afm Exists'
				});
			}
			});
	bcrypt.hash(req.body.password, 10, (err, hash) => {
			if (err) {
				return res.status(500).json({
					error: err
				});
			} else {
				const user = new User({
				_id: new mongoose.Types.ObjectId(),
				username: req.body.username,
				password: hash, 	//add check for confirm pass
				firstname: req.body.firstname,
				lastname: req.body.lastname,
				email: req.body.email,
				phone: req.body.phone,
				address: req.body.address,
				city: req.body.city,
				afm: req.body.afm,
				rating: req.body.rating,
				role: req.body.role
				});
				user.save()
				.then(result => {
					console.log(result);
					res.status(201).json({
						message: 'User Created'
					});
					return res.redirect('/pages/thanks_signup.html');
				}).catch(err => {
					console.log(err);
					res.status(500).json({
						error: err
					});
				});
			}
		});
	});

router.post('/login', (req, res, next) => {
	User.find({ email: req.body.email})
	.exec()
	.then(user => {
		if (user.length < 1) {
			return res.status(401).json({
				message: 'Auth Failed'
			});
		}
		bcrypt.compare(req.body.password, user[0].password, (err, result) => {
			if (err) {
				return res.status(401).json({
					message: 'Auth Failed'
				});
			}
				if (result) {
					if (user[0].verified) 
					{
						const token = jwt.sign(
						{
							email: user[0].email,
							userId: user[0]._id,
							role: user[0].role
						},
						process.env.JWT_KEY,
						{
							expiresIn: "1h"
						});
						return res.status(200).json({
							message: 'Auth Successful',
							token: token
						});
					}
					else
					{
						return res.status(401).json({
							message: 'Not Yet Verified'
						});
					}
				}
				res.status(401).json({
					message: 'Auth Failed'
				});
		});
	})
	.catch(err => {
		console.log(err);
		res.status(500).json({
			error: err
		});
	});
});

router.put('/:userId', (req, res, next) => {
	const id = req.params.userId;

	User.findById(req.params.userId)
	.exec()
		.then(user => {
			if (!user) {
				return res.status(404).json({
					message: 'User Not Found'
				});
			}
			const temp_user = new User({
				_id: user._id,
				username: user.username,
				password: user.password,
				firstname: user.firstname,
				lastname: user.lastname,
				email: user.email,
				phone: user.phone,
				address: user.address,
				city: user.city,
				afm: user.afm,
				rating: user.rating,
				role: user.role
			});

			User.find({ username: req.body.username}) //add more checks
			.exec()
			.then( user2 => {
				if (user2.length >= 1 && req.body.username != user.username) {
					return res.status(409).json({
						message: 'Username Exists'
					});
				}
				});
			User.find({ email: req.body.email}) //add more checks
			.exec()
			.then( user2 => {
				if (user2.length >= 1 && req.body.email != user.email) {
					return res.status(409).json({
						message: 'Email Exists'
					});
				}
				});
			User.find({ phone: req.body.phone}) //add more checks
			.exec()
			.then( user2 => {
				if (user2.length >= 1 && req.body.phone != user.phone) {
					return res.status(409).json({
						message: 'Phone Exists'
					});
				}
				});
			User.find({ afm: req.body.afm}) //add more checks
			.exec()
			.then( user2 => {
				if (user2.length >= 1 && req.body.afm != user.afm) {
					return res.status(409).json({
						message: 'Afm Exists'
					});
				}
				});

			if (req.body.name)
				temp_user.name = req.body.name;
			if (req.body.username)
				temp_user.username = req.body.username;
			if (req.body.password)
			{
				bcrypt.hash(req.body.password, 10, (err, hash));
				temp_user.password = hash;
			}
			if (req.body.firstname)
				temp_user.firstname = req.body.firstname;
			if (req.body.lastname)
				temp_user.lastname = req.body.lastname;
			if (req.body.email)
				temp_user.email = req.body.email;
			if (req.body.phone)
				temp_user.phone = req.body.phone;
			if (req.body.address)
				temp_user.address = req.body.address;
			if (req.body.city)
				temp_user.city = req.body.city;
			if (req.body.afm)
				temp_user.afm = req.body.afm;
			if (req.body.rating)
				temp_user.rating = req.body.rating;
			if (req.body.role)
				temp_user.role = req.body.role;

			User.update({ _id: id }, { $set: {
				username: temp_user.username,
				password: temp_user.password,
				firstname: temp_user.firstname,
				lastname: temp_user.lastname,
				email: temp_user.email,
				phone: temp_user.phone,
				address: temp_user.address,
				city: temp_user.city,
				afm: temp_user.afm,
				rating: temp_user.rating,
				role: temp_user.role
			} })
				.exec()
				.then(result => {
					res.status(200).json({
						message: 'User updated',
						request: {
							type: 'GET',
							url: 'http://localhost:3000/auctions/' + id
						}
					});
				})
				.catch(err => {
					console.log(err);
					res.status(500).json({
						error: err
					});
				});
	});
});

router.post('/seen', (req, res, next) => {
	auction = req.body.seen;
	User.findById(req.body._id)
	.exec()
		.then(user => {
			if (!user) {
				return res.status(404).json({
					message: 'User Not Found'
				});
			}
			else {
				user.seen = user.seen || [];
				if (!user.seen.includes(auction))
				{
					user.seen.push(auction);
					user.save();
					return res.status(201).json({
						message: 'Seen Updated'
					});
				}
				else
				{
					return res.status(201).json({
						message: 'Exists'
					});
				}
			}
		})
		.catch(err => {
			console.log(err);
			res.status(500).json({
				error: err
			});
		});
});

router.post('/bid', (req, res, next) => {
	auction = req.body.bid;
	User.findById(req.body._id)
	.exec()
		.then(user => {
			if (!user) {
				return res.status(404).json({
					message: 'User Not Found'
				});
			}
			else {
				user.bid = user.bid || [];
				if (!user.bid.includes(auction))
				{
					user.bid.push(auction);
					user.save();
					return res.status(201).json({
						message: 'Bid Updated'
					});
				}
				else
				{
					return res.status(201).json({
						message: 'Exists'
					});
				}
			}
		})
		.catch(err => {
			console.log(err);
			res.status(500).json({
				error: err
			});
		});
});

router.get('/bid/:userId', (req, res, next) => {
	User.findById(req.params.userId)
	.exec()
		.then(user => {
			if (!user) {
				return res.status(404).json({
					message: 'User Not Found'
				});
			}
			else {
                return res.status(201).json({
					_id: user._id,
					bid: user.bid
                });
			}
		})
		.catch(err => {
			console.log(err);
			res.status(500).json({
				error: err
			});
		});
});

router.get('/seen/:userId', (req, res, next) => {
	User.findById(req.params.userId)
	.exec()
		.then(user => {
			if (!user) {
				return res.status(404).json({
					message: 'User Not Found'
				});
			}
			else {
                return res.status(201).json({
					_id: user._id,
					seen: user.seen
                });
			}
		})
		.catch(err => {
			console.log(err);
			res.status(500).json({
				error: err
			});
		});
});

router.post('/recommendations/:userId', (req, res, next) => {
	//https://www.npmjs.com/package/nearest-neighbor
	var items = [];
	var query;
	var value;
	nn.comparisonMethods.custom = function(b, a) {
		var i, similarity;
	
		i = 0;
		similarity = 0;
		//console.log(b);

		while (i < a.length) {
			if (b.includes(a[i]))
			{
				//console.log(a[i] + " included");
				similarity += 1;
				//console.log(b);
			}
			i++;
		}
		//console.log(a.length);
		return similarity;
	  };
	
	  var fields = [
		  { name: "array", measure: nn.comparisonMethods.custom }
	  ];
	
	User.findById(req.params.userId)
	.exec()
		.then(user => {
			if (!user) {
				return res.status(404).json({
					message: 'User Not Found'.length
				});
			}
			else {
				if (user.bid.length >= 1)
				{
					query = { _id: user._id, array: user.bid };
				}
				else if (user.seen.length >= 1)
				{
					query = { _id: user._id, array: user.seen };
				}
				else
				{
					return res.status(200).json({
						message: "No Recommendations For New Users"
					});
				}
				User.find()
					.exec()
					.then(docs => {
						docs.map(other => {
							if (other != user)
							{
								items.push({ _id: other._id, array: other.bid });
								//console.log(items);
							}
							if (docs.length == items.length)
							{
								nn.findMostSimilar(query, items, fields, function(nearestNeighbor, probability) {
									console.log(query._id);
									console.log(nearestNeighbor._id);
									console.log(probability);
									var index;
									for (var i = 0; i < query.array.length; i++)
									{
										index = nearestNeighbor.array.indexOf(query.array[i]);
										if (index > -1) {
											nearestNeighbor.array.splice(index, 1);
										}
									}
									return res.status(200).json({
										nearestNeighbor: nearestNeighbor._id,
										recommendations: nearestNeighbor.array
									});
								});
							}
						});
					})
					.catch(err => {
						res.status(500).json({
							error: err
						});
					});
			}
		})
		.catch(err => {
			console.log(err);
			res.status(500).json({
				error: err
			});
		});
});

router.put('/:userId', (req, res, next) => {
	User.find({ _id: req.params.userId})
	.exec()
	.then(result => {
		res.status(200).json({
			message: 'User Deleted'
		})
	})
	.catch(err => {
		console.log(err);
		res.status(500).json({
			error: err
		});
	});
})

router.delete('/:userId', (req, res, next) => {
	User.remove({ _id: req.params.userId})
	.exec()
	.then(result => {
		res.status(200).json({
			message: 'User Deleted'
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
