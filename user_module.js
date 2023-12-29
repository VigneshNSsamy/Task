const mongoose = require('mongoose')

module.exports = mongoose.model('jwk_sets',{
    userName: {type:String},
    userPassword: {type:String},
    jwkeys: {type:String}
}),'keys'
