const express = require('express')
const router = express.Router()

//
const mongoose=require('mongoose')
require('../models/Categoria') //Chama o arquivo model
const Categoria = mongoose.model('categorias') // passar a referencia do seu model(no ficheiro Categoria.js) para uma variavel
require('../models/Postagem')
const Postagem = mongoose.model('postagens')
const {eAdmin}= require('../helpers/eAdmin')// no objecto eAdmin quero somente a funcao eAdmin

//rotas
router.get('/',eAdmin,(req,res)=>{
   res.render("admin/index")
})
router.get('/posts',eAdmin,(req,res)=>{
    res.send('Pagina de posts')
})
router.get('/categorias',eAdmin,(req,res)=>{
    //listar todas as categorias
    Categoria.find().sort({date:'desc'}).lean().then((categorias)=>{
        res.render('admin/categorias.hbs',{categorias: categorias})
    }).catch((err)=>{
        req.flash("error_msg","Houve um erro ao listar as categorias"+err)
        res.redirect("/admin")
    })
    
})
router.get('/categorias/add',eAdmin,(req,res)=>{
    res.render('admin/addcategorias')
})
router.post('/categorias/nova',eAdmin,(req,res)=>{
    //validação manual de formulário
    var erros=[]
    if(!req.body.nome||typeof req.body.nome == undefined || req.body.nome == null){
        erros.push({texto: "Nome Invalido"}) //coloca dado dentro do array
    }
    if(!req.body.slug||typeof req.body.slug == undefined || req.body.slug == null){
        erros.push({texto: "Slug Invalido"})
    }
    if(req.body.nome.length<2){
        erros.push({texto:"Nome da categoria muito pequeno"})
    }

    if(erros.length > 0){
        res.render('admin/addcategorias',{erros:erros})
    }else{
        const novaCategoria = { 
            nome: req.body.nome,
            slug: req.body.slug
        }

        //criar uma nova categoria
        new Categoria(novaCategoria).save().then(()=>{
            // console.log('Categoria salva com sucesso!')
            //emitir uma mensagem
            req.flash('success_msg','Categoria criada com sucesso')
            res.redirect('/admin/categorias')
        }).catch((erro)=>{
            //emitir mensagem
            req.flash('error_msg','Houve um erro ao salvar categoria, tente novamente')
            //console.log('Erro ao salvar categoria')
            res.redirect('/admin')
     })
    }
    
    
})
router.get('/categorias/edit/:id',eAdmin,(req,res)=>{
    Categoria.findOne({_id:req.params.id}).lean().then((categoria)=>{
        res.render('admin/editcategorias',{categoria: categoria}) 
    }).catch((err)=>{
        req.flash('error_msg','Esta categoria nao existe')
        res.redirect('/admin/categorias')
    })
    
})
router.post('/categorias/edit',eAdmin,(req,res)=>{
    Categoria.findOne({_id: req.body.id}).then((categoria)=>{
        categoria.nome = req.body.nome
        categoria.slug = req.body.slug

        categoria.save().then(()=>{
            req.flash('success_msg','Categoria editada com sucesso!')
            res.redirect('/admin/categorias')
        }).catch((err)=>{
            req.flash('error_msg','Houve um erro interno ao editar a categoria')
            res.redirect('/admin/categorias')
        })
    }).catch((err)=>{
        req.flash('error_msg','Houve um erro ao editar a categoria'+err)
        res.redirect('/admin/categorias')
    })
})
router.post('/categorias/deletar',eAdmin,(req,res)=>{
    Categoria.remove({_id :req.body.id}).then(()=>{
        req.flash('success_msg','Categoria apagada com sucesso!')
        res.redirect('/admin/categorias')
    }).catch((err)=>{
        req.flash('error_msg','houve um erro ao apagar a categoria')
        res.redirect('/admin/categorias')
    })
})
// router.get('/postagens',(req,res)=>{
//     //listar todas as postagens
//     Postagem.find().populate('postagens').sort({data:'desc'}).lean().then((postagens)=>{
//         res.render('admin/postagens.hbs',{postagens:postagens})
//     }).catch((err)=>{
//         req.flash('error_msg','Houve um erro ao listar as postagens'+err)
//         res.redirect('/admin')
// })
// })
router.get('/postagens',eAdmin,(req,res)=>{
    //listar todas as postagens. populate-utilizado para o id do modelo categoria
    Postagem.find().populate('categoria').sort({date:'desc'}).lean().then((postagens)=>{
        res.render('admin/postagens.hbs',{postagens:postagens})
    }).catch((err)=>{
        req.flash('error_msg','Houve um erro ao listar as postagens'+err)
        res.redirect('/admin')
})
})
//...................

// router.get('/categorias',(req,res)=>{
//     //listar todas as categorias
//     Categoria.find().sort({date:'desc'}).lean().then((categorias)=>{
//         res.render('admin/categorias.hbs',{categorias: categorias})
//     }).catch((err)=>{
//         req.flash("error_msg","Houve um erro ao listar as categorias"+err)
//         res.redirect("/admin")
//     })
    
// })



//......................













router.get('/postagens/add',eAdmin,(req,res)=>{
    Categoria.find().lean().then((categorias)=>{
        res.render('admin/addpostagem',{categorias:categorias})
    }).catch((err)=>{
        req.flash('error_msg','Houve um erro ao carregar o formulário')
        res.redirect('/admin')
    })
    

})
router.post('/postagens/nova',eAdmin,(req,res)=>{
    var erros = []
    // validar campos
    if(!req.body.titulo||typeof req.body.titulo == undefined || req.body.titulo == null){
        erros.push({texto: "Titulo Invalido"}) 
        erro_titulo='Titulo invalido'
    }
    if(req.body.titulo.length<2){
        erros.push({texto:"Titulo muito pequeno"})
    }
    if(!req.body.descricao||typeof req.body.descricao == undefined || req.body.descricao == null){
        erros.push({texto: "descrição Invalido"})
    }
    if(!req.body.conteudo||typeof req.body.conteudo == undefined || req.body.conteudo == null){
        erros.push({texto: "conteúdo Invalido"})
    }
    if(!req.body.slug||typeof req.body.slug == undefined || req.body.slug == null){
        erros.push({texto: "Slug Invalido"}) 
    }
    if(req.body.slug.length<2){
        erros.push({texto:"Slug muito pequeno"})
    }
    //.........
    if(req.body.categoria == '0'){
        erros.push({texto:'Categoria invalida, registe uma categoria'})
    }

    if(erros.length> 0){
        res.render('admin/addpostagem',{erros:erros})
    }else{
        const novaPostagem = {
            titulo: req.body.titulo,
            descricao: req.body.descricao,
            conteudo:req.body.conteudo,
            categoria:req.body.categoria,
            slug:req.body.slug
        }

        new Postagem(novaPostagem).save().then(()=>{
            req.flash('success_msg','Postagem criada com sucesso!')
            res.redirect('/admin/postagens')
        }).catch((err)=>{
            req.flash('error_msg','Houve um erro ao criar uma postagem')
            res.redirect('/admin/postagens')
        })



    }
})
router.get('/postagens/edit/:id',eAdmin,(req,res)=>{
    
    Postagem.findOne({_id:req.params.id}).lean().then((postagem)=>{
        
        Categoria.find().lean().then((categorias)=>{
            res.render('admin/editpostagens',{categorias:categorias,postagem:postagem})
        }).catch((err)=>{
            req.flash('error_msg','Houve um erro ao listar as categorias')
            res.redirect('/admin/postagens')
        })
    }).catch((err)=>{
        req.flash('error_msg','Houve um erro ao carregar o formulário')
        res.redirect('/admin/postagens')
    })
    
})
router.post('/postagens/edit',eAdmin,(req,res)=>{
    Postagem.findOne({_id: req.body.id}).then((postagem)=>{
        postagem.titulo = req.body.titulo
        postagem.slug = req.body.slug
        postagem.descricao = req.body.descricao
        postagem.conteudo = req.body.conteudo
        postagem.categoria = req.body.categoria

        postagem.save().then(()=>{
            req.flash('success_msg','Postagem editada com sucesso!')
            res.redirect('/admin/postagens')
        }).catch((err)=>{
            req.flash('error_msg','Houve um erro ao salvar: '+err)
            res.redirect('/admin/postagens')
        })
    }).catch((err)=>{
        req.flash('error_msg','Houve um erro ao editar a postagem'+err)
        res.redirect('/admin/postagens')
    })
})

router.get('/postagens/delete/:id',eAdmin,(req,res)=>{
    Postagem.remove({_id :req.params.id}).then(()=>{
        req.flash('success_msg','Postagens apagada com sucesso!')
        res.redirect('/admin/postagens')
    }).catch((err)=>{
        req.flash('error_msg','houve um erro ao apagar a postagem : '+err)
        res.redirect('/admin/postagens')
    })
})
module.exports = router

