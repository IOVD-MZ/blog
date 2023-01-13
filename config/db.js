//se a nossa aplicacao estiver em modo de produção
if(process.env.NODE_ENV == 'production'){
    module.exports = {mongoURI:'mongodb+srv://root:root@cluster0.yvjwuvz.mongodb.net/?retryWrites=true&w=majority'}
}else{
    module.exports = {mongoURI: 'mongodb://localhost/blog'}
}