const express = require('express')
const { Blockhain } = require('./chain/blockchain')
const { v4: uuidv4 } = require('uuid')
const port = 5001
const chain = new Blockhain()
const nodeAdress = uuidv4().toString().replace(/-/g, '')

const app = express()
app.use(express.urlencoded({ extended: false }))
app.use(express.json())



app.get('/mine_block', (req,res) => {
  const block = chain.mineBlock(nodeAdress)
  const encodedBlock = JSON.stringify(block)
  res.status(200).send(encodedBlock)
})

app.get('/get_chain', (req, res) => {
  const data = chain.getChain()
  const encodedData = JSON.stringify(data)
  res.status(200).send(encodedData)
})

app.get('/is_valid', (req, res) => {
  if(chain.isChainValid(chain.getChain()))
    res.status(200).send('chain is valid')
  else
    res.status(500).send('chain is not valid')
})

app.post('/add_transaction', (req, res) => {
  const data = req.body
  console.log("body:", data)
  if(!data.sender && !data.receiver && !data.amount)
    return res.status(400).send('bad arguments')

  let index = chain.addTransaction(data.sender, data.receiver, data.amount)
  res.status(200).send('transaction added')
})

app.post('/connect_node', (req,res) => {
  const data = req.body
  let nodes = data.nodes
  if(!nodes)
    return res.status(400).send('nodes is none')
  for(let node of nodes) {
    chain.addNode(node)
  }
  res.status(200).send('nodes added to chain')
  console.log("nodes:", chain.nodes)
})

app.get('/replace_chain', (req, res) => {
  let isChainReplaced = chain.replaceChain()
  if(isChainReplaced)
    res.status(200).send('chain replaced by the longest one')
  else
    res.status(200).send('the chain largest one')
})

app.listen(port, () => {
  console.log(`Blockchain activeted on por ${port}`)
})
