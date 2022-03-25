const sha256 = require('js-sha256')
const axios = require('axios')

class Blockhain {
  constructor() {
    this.chain = []
    this.transactions = []
    this.nodes = new Set()
    this.createBlock(1, '0')
  }

  createBlock(proof, prevHash) {
    let block = {
      index: this.chain.length + 1,
      timestamp: new Date().getTime(),
      proof: proof,
      previousHash: prevHash,
      transactions: this.transactions.splice(0, this.transactions.length)
    }
    this.chain.push(block)
    return block
  }

  getPreviousBlock() {
    return this.chain[this.chain.length - 1]
  }

  proofOfWork(previousProof) {
    let newProof = 1
    let checkProof = false

    while(!checkProof) {
      let hashOperation = sha256((newProof**2 - previousProof**2).toString())
      if(hashOperation.substring(0,4) === "0000")
        checkProof = true
      else
        newProof++
    }
    return newProof
  }

  hash(block) {
    let encodedBlock = JSON.stringify(block)
    return sha256(encodedBlock)
  }

  mineBlock(adress) {
    let previousBlock = this.getPreviousBlock()
    let previousProof = previousBlock.proof
    let proof = this.proofOfWork(previousProof)
    let previousHash = this.hash(previousBlock)
    this.addTransaction(adress, 'miner', 1)
    let block = this.createBlock(proof, previousHash)
    return block
  }

  isChainValid(chain) {
    let previousBlock = chain.blocks[0]
    let blockIndex = 1
    while(blockIndex < chain.length) {
      let block = chain.blocks[blockIndex]

      if(block.previousHash != this.hash(previousBlock))
        return false

      let previousProof = previousBlock.proof
      let proof =  block.proof
      let hashOperation = sha256((proof**2 - previousProof**2).toString())
      console.log("hash operation:", hashOperation)

      if(hashOperation.substring(0, 4) !== "0000")
        return false

      previousBlock = block
      blockIndex++
    }
    return true
  }

  getChain() {
    return {
      blocks: this.chain,
      length: this.chain.length
    }
  }

  addTransaction(sender, receiver, amount) {
    this.transactions.push({
      sender: sender,
      receiver: receiver,
      amount: amount
    })
    let prevBLock = this.getPreviousBlock()
    return prevBLock.index + 1
  }

  addNode(address) {
    const url = new URL(address)
    this.nodes.add(url.host)
  }

  replaceChain() {
    let network = this.nodes
    let longestChain = null
    let maxLength = this.chain.length
    for(let node of network) {
      console.log("node:", node)
      const response = axios({
        method: 'get',
        url: `http://${node}/get_chain`
      })
      .then((response) => {
        if(response.status === 200) {
          const data = response.data
          if(data.length > maxLength && this.isChainValid(data)) {
            maxLength = data.length
            longestChain = data.blocks
          }
        }
      })
    }
    if(longestChain !== null) {
      this.chain = longestChain
      return true
    }
    return false
  }
}

module.exports = {
  Blockhain
}
