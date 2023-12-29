const mongoose = require('mongoose')

const dbUrl = 'mongodb+srv://Key_Sets:Key_Sets@cluster0.4qefo8p.mongodb.net/?retryWrites=true&w=majority'
//const dbUrl = 'mongodb://localhost:27017/jwkeys'

module.exports = ()=>{
    return mongoose.connect(dbUrl,{
        useNewUrlParser: true
    })
}
