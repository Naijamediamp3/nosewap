const mongoose = require('mongoose');

const ChainSchema = new mongoose.Schema({
  chainId: {
    type: String,
  },
  chainName: {
    type: String,
  },
  rpcUrls: {
    type: String,
  },
  blockExplorerUrls: {
    type: String,
  }
});

module.exports = mongoose.model('chainlist', ChainSchema, 'chainlists');
