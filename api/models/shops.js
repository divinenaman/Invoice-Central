const mongoose=require('mongoose')
const Schema=mongoose.Schema

const productSchema = new Schema({
    id: {
        type: Schema.Types.ObjectId
    },

    name: {
        type: String,
        required: true
    },

    productId: {
        type: String,
        required: true
    },

    mrp: { 
        type: Number,
        required: true
    },

    discount: { 
        type: Number,
        default: 0
    },

    type: {
        type: String,
    },

    quantity: {
        type: Number,
    },

    desc:{
        type: Object,
    },

    gst:{
        type: Number,
    },

    mobile:{
        type: Number,
    }


})

const shopSchema = Schema({
    id:{
        type: Schema.Types.ObjectId
    },

    name:{
        type: String,
        required: true
    },

    username:{
        type: String,
        required: true
    },

    email:{
        type: String,
        required: true
    },

    address:{
        type: Object,
        required: true
    },

    desc:{
        type: String,
        required: true
    },

    products: [{
            type: Schema.Types.ObjectId,
            ref: 'product' 
        }],

    mobile: {
        type: String,
        required: true
    }

})

const Product = mongoose.model('product',productSchema)
const Shop = mongoose.model('shops',shopSchema)
module.exports={
    Product,
    Shop
}
