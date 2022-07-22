const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const invoiceSchema = Schema({
  id: {
    type: Schema.Types.ObjectId,
  },

  client: {
    type: Object,
  },

  shop: {
    type: String,
  },

  items: [
    {
      type: String,
    },
  ],

  quantity: {
    type: Object,
  },

  date_added: {
    type: String,
  },

  order_status: {
    type: String,
    enum: ["Paid", "Unpaid"],
    default: "Paid",
  },

  discount: {
    type: String,
    default: 0,
  },
});

const Invoices = mongoose.model("invoices", invoiceSchema);
module.exports = Invoices;
