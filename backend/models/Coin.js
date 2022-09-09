const mongoose = require('mongoose');

const CoinSchema = new mongoose.Schema({
  name: {
    type: String,
  },
  symbol: {
    type: String,
  },
  isCoin: {
    type: Boolean,
  },
  WalletName: {
    type: String,
  },
  chain: {
    type: String,
  },
  address: {
    type: String,
  },
  staked_value: {
    type: Number,
  },
  users: {
    type: [String],
  },
  country: {
    type: String,
  },
  fee: {
    type: Number,
  },
  avatar: {
    type: String,
  }
});

module.exports = mongoose.model('coin', CoinSchema, "coin");
