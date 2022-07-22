const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const userSchema = mongoose.Schema({
  id: {
    type: Schema.Types.ObjectId,
  },
  type: {
    type: String,
    default: "Customer",
  },
  username: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  mobile: {
    type: Number,
    required: true,
  },
  shop: {
    type: String,
    enum: ["registered", "unregistered"],
    default: "unregistered",
  },
  images: {
    data: Buffer,
    contentType: String,
  },
});

const Users = mongoose.model("users", userSchema);
module.exports = Users;
