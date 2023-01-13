const mongoose = require('mongoose')
const schema = mongoose.Schema

const Categoria = new schema({
    nome:{
        type: String,
        required: true
    },
    slug:{
        type: String,
        required: true
    },
    date:{
        type:Date,
        default: Date.now()
    }
})
// modelo categorias
mongoose.model('categorias',Categoria)