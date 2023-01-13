//Carregando módulos

const express = require('express')
const hbs = require('express-handlebars')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const app = express()
const admin = require('./routes/admin')
const path = require('path') // Modulo para manipular diretórios/pastas
const PORTA =process.env.PORT ||8089 //Porta aleatória do Heroku

const session = require('express-session')
const flash = require('connect-flash')
const { nextTick } = require('process')

require('./models/Postagem')
const Postagem = mongoose.model('postagens')
require('./models/Categoria')
const Categoria = mongoose.model('categorias')

const usuarios = require('./routes/usuario')
const passport = require('passport')
require('./config/auth')(passport)
const db = require('./config/db')

//Configurações
    //session
    app.use(session({
      secret: 'cursodenode',
      resave: true,
      saveUninitialized: true
    }))
    //passport
    app.use(passport.initialize())
    app.use(passport.session())
    //flash
    app.use(flash())
    //middleware
    app.use((req,res,next)=>{
      //Variáveis globais
      res.locals.success_msg = req.flash('success_msg')
      res.locals.error_msg = req.flash('error_msg')
      res.locals.error = req.flash('error')
      res.locals.user = req.user||null
      next()
    })
    //body-parser
    app.use(bodyParser.urlencoded({ extended: false }))
    app.use(bodyParser.json())
    //Handlebars
    // app.use('hbs',hbs.engine({defaultLayout:'main'}))
    app.set('view engine', 'hbs');
    app.engine('hbs', hbs.engine({
        extname: 'hbs',
        defaultLayout: 'main',
        layoutsDir:__dirname+'/views/layouts'
      }));
      
    //app.set("view engine", "hbs") //Engine HBS
    //app.set("views", __dirname +"/views") //Folder views (templates)
    //  app.engine('handlebars', engine());
    //  app.set('view engine', 'handlebars');
    //  app.set("views", "./views");
    //Mongoose
    mongoose.Promise = global.Promise
    mongoose.set("strictQuery", true)
    //coneccao com BD
      mongoose.connect(db.mongoURI).then(()=>{
        console.log('Conectado ao mongo')
      }).catch((erro)=>{
        console.log('Erro ao se conectar ao mongo')
      })
    //public : pasta de arquivos estáticos
    app.use(express.static(path.join(__dirname,"/public"))) //estamos informando ao express que a pasta public guarda os arquivos estáticos
      //__dirname: caminho absoluto para evitar erros
    
      
     
//Rotas
    //Rota principal
    app.get('/',(req,res)=>{
        //res.send('Rota Principal')
        Postagem.find().populate('categoria').sort({date:'desc'}).lean().then((postagens)=>{
          res.render('index',{postagens:postagens})
      }).catch((err)=>{
          req.flash('error_msg','Houve um erro interno'+err)
          res.redirect('/404')
      }) 
    })
    
    app.get('/postagem/:slug',(req,res)=>{
      Postagem.findOne({slug: req.params.slug}).lean().then((postagem)=>{
        if(postagem){
          res.render('postagem/index',{postagem:postagem})
        }else{
          req.flash('error_msg','Esta postagem nao existe')
          res.redirect('/')
        }
      }).catch((err)=>{
        req.flash('error_msg','Houve um erro interno')
      })
    })
    app.get('/categorias',(req,res)=>{
      Categoria.find().lean().then((categorias)=>{
        res.render('categorias/index',{categorias:categorias})
      }).catch((err)=>{
        req.flash('error_msg','Houve um erro interno ao listar as categorias')
        res.redirect('/')
      })
    })
    

    app.get('/categorias/:slug', (req,res)=>{
      Categoria.findOne({slug: req.params.slug}).lean().then((categoria)=>{
        
        if(categoria){
          Postagem.find({categoria:categoria._id}).lean().then((postagens)=>{
            res.render('categorias/postagens',{postagens:postagens,categoria:categoria})
          }).catch((err)=>{
            req.flash('error_msg','Houve um erro ao listar os posts!')
            res.redirect('/')
          })
        }else{
          req.flash('error_msg','Esta categoria nao existe')
          res.redirect('/')
        }

      }).catch((err)=>{
        req.flash('error_msg','Houve um erro interno ao carregar a pagina desta categoria')
        res.redirect('/')
      })
    })



    app.get('404',(req,res)=>{
        res.send('Erro 404!')
    })
    //prefixo de Rotas de painel Administrativo : /admin
    app.use('/admin',admin)
    app.use('/usuarios',usuarios)
// Iniciar servidor
app.listen(PORTA,()=>{
    console.log('Servidor ligado na URL http:/localhost:8089')
})