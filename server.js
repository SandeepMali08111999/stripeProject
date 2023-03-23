require('dotenv').config()
const express=require('express')
const app=express()
const {join} = require('path');
const SECRET_KEY=process.env.STRIPE_SECRET_KEY
const PUBLIC_KEY=process.env.STRIPE_PUBLIC_KEY
const port=process.env.PORT || 3000
const fs=require('fs')
const stripe=require('stripe')(SECRET_KEY)

app.set('view engine','ejs')
app.use(express.json())

app.use(express.static(join(process.cwd(),'public')))

app.get('/store', function(req, res) {
    fs.readFile('items.json', function(error, data) {
      if (error) {
        res.status(500).end()
      } else {
        res.render('store.ejs', {
            stripePublicKey:PUBLIC_KEY,
          items: JSON.parse(data)
        })
      }
    })
  })

  app.post('/purchase', function(req, res) {
    fs.readFile('items.json', function(error, data) {
      if (error) {
        res.status(500).end()
      } else {
        const itemsJson=JSON.parse(data)
        const itemsArray=itemsJson.music.concat(itemsJson.merch)
        let total=0
        req.body.items.forEach((item)=>{
            const itemJson=itemsArray.find((i)=>{
                return i.id==item.id
            })
            total=total+itemJson.price*item.quantity
        })
           stripe.charges.create({
            amount:total,
            source:req.body.stripeTokenId,
            currency:'usd'
           }).then((err,data)=>{
            console.log(data)
            console.log('charge Successful')
            res.json({message:'Successfully purchased items'})
           }).catch((err)=>{
             console.log(err)
             console.log('charge fail')
             res.status(500).end()
           })

          }
        })
      })
  
app.listen(port,()=>{
    console.log(`server listening on ${port}`)
})