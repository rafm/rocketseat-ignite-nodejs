const express = require("express")
const { v4: uuidv4 } = require("uuid")

const app = express()

app.use(express.json())

const customers = []

app.post("/account", (request, response) => {
    const { cpf, name } = request.body

    const id = uuidv4()

    const newCustomer = {
        id,
        cpf,
        name,
        statement: [],
    }
    customers.push(newCustomer)

    return response.status(201).json(newCustomer)
})

app.listen(3333)
