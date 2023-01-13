const express = require('express')
const router = express.Router()
const mongoose=require('mongoose')

require('../models/Usuario')
const Usuario = mongoose.model('usuarios')
const bcryptjs = require('bcryptjs')
const passport = require('passport')

router.get('/registo',(req,res)=>{
     res.render('usuarios/registo')
})

router.post('/registo',(req,res)=>{
    var erros=[]

    if(!req.body.nome||typeof req.body.nome == undefined || req.body.nome == null){
        erros.push({texto: 'Nome invalido'})
    }
    if(!req.body.email||typeof req.body.email == undefined || req.body.email == null){
        erros.push({texto: 'Email invalido'})
    }
    if(!req.body.senha||typeof req.body.senha == undefined || req.body.senha == null){
        erros.push({texto: 'Senha invalido'})
    }
    if(req.body.senha.length<4){
        erros.push({texto: 'Senha muito curta'})
    }
    if(req.body.senha != req.body.senha2){
        erros.push({texto: 'As senhas sao diferentes, tente novamente!'})
    }

    if(erros.length > 0){

        res.render('usuarios/registo',{erros: erros})

    }else{
        //verificar se o email ja foi registado na base de dados
        Usuario.findOne({email: req.body.email}).lean().then((usuario)=>{
            if(usuario){
                req.flash('error_msg','Ja existe uma conta com este email no nosso sistema')
                res.redirect('/usuarios/registo')
            }else{
                const novoUsuario = new Usuario({
                    nome: req.body.nome,
                    email: req.body.email,
                    senha: req.body.senha
                })

                //encriptar a senha
                bcryptjs.genSalt(10,(erro,salt)=>{
                    bcryptjs.hash(novoUsuario.senha,salt,(erro,hash)=>{
                        if(erro){
                            req.flash('error_msg','Houve um erro ao salvar o usuário')
                            res.redirect('/')
                        }

                        novoUsuario.senha = hash

                        novoUsuario.save().then(()=>{
                            req.flash('success_msg','Usuario criado com sucesso!')
                            res.redirect('/')
                        }).catch((err)=>{
                            req.flash('error_msg','Houve um erro ao criar o usuário, tente novamente!')
                        })
                    })
                })
            }
        }).catch((err)=>{
            req.flash('error_msg','Houve um erro interno')
        })
    }
})

//rota formulário de login
router.get('/login',(req,res)=>{
    res.render('usuarios/login')
})
//rota de autenticação
router.post('/login',(req,res,next)=>{
    
    passport.authenticate('local',{
        successRedirect: '/',
        failureRedirect: '/usuarios/login',
        failureFlash: true
    })(req,res,next)
})

router.get('/logout',(req,res)=>{
    req.logout(()=>{
        req.flash('success_msg','Sessão terminada com sucesso!')
        res.redirect('/')
    }).catch((err)=>{
        req.flash('error_msg','Houve um erro ao fazer Logout!')
    })
    
})

 module.exports = router