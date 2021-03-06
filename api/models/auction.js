const mongoose = require('mongoose');

const auctionSchema = mongoose.Schema({
	_id: mongoose.Schema.Types.ObjectId,
	//product: { type: mongoose.Schema.Types.ObjectId, red: 'Product' , required: true},
	name: { type: String, required: true },
	category: [{ type: String }],
	location: { type: String, required: true },
	country: { type: String, required: true },
	currently: { type: Number, required: true },
	first_bid: { type: Number, required: true },
	no_bids: { type: Number, default: 0 },
	started: { type: Date },
	ends: { type: Date, required: true },
	description: { type: String },
	latitude: { type: Number },
	longitude: { type: Number },
	seller: { type: mongoose.Schema.Types.ObjectId, red: 'User', required: true },
	buy_price: { type: Number },
	bids: [{ type: mongoose.Schema.Types.ObjectId, red: 'Bid' }],
	images: [{ type: String }]

});

auctionSchema.index({ '$**': 'text' });

module.exports = mongoose.model('Auction', auctionSchema);
