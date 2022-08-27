const mongoose = require('mongoose')

const RoomSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  id: {
    type: String,
    required: true,
    unique: true
  },
  savedImgs: {
    type: Array
  }
})

module.exports = mongoose.model('Room', RoomSchema)