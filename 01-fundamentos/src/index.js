const express = require("express")
const { v4: uuidv4 } = require("uuid")

const app = express()

app.use(express.json())

const customers = []

function getBalance(statement) {
    return statement.reduce((acc, operation) => {
        switch (operation.type) {
            case "credit":
                return acc + operation.amount
            case "debit":
                return acc - operation.amount
            default:
                return acc
        }
    }, 0)
}

// Middleware
function verifyIfExistsAccountCPF(request, response, next) {
    const { cpf } = request.headers

    const customer = customers.find((customer) => customer.cpf === cpf)
    if (!customer) {
        return response.status(404).json({ error: "Customer not found" })
    }

    request.customer = customer

    return next()
}

app.post("/account", (request, response) => {
    const { cpf, name } = request.body

    const customerAlreadyExists = customers.some((customer) => customer.cpf === cpf)
    if (customerAlreadyExists) {
        return response.status(400).json({ error: "Customer already exists!" })
    }

    const newCustomer = {
        id: uuidv4(),
        cpf,
        name,
        statement: [],
    }
    customers.push(newCustomer)

    return response.status(201).json(newCustomer)
})

app.use(verifyIfExistsAccountCPF)

app.get("/statement", (request, response) => {
    const { customer } = request

    return response.json(customer.statement)
})

app.post("/deposit", (request, response) => {
    const { description, amount } = request.body
    
    const { customer } = request

    const statementOperation = {
        description,
        amount,
        created_at: new Date(),
        type: "credit"
    }

    customer.statement.push(statementOperation)

    return response.status(201).json(statementOperation)
})

app.post("/withdraw", (request, response) => {
    const { amount } = request.body
    const { customer } = request

    const balance = getBalance(customer.statement)

    if (balance < amount) {
        return response.status(400).json({ error: "Insufficient funds!" })
    }

    const statementOperation = {
        amount,
        created_at: new Date(),
        type: "debit"
    }

    customer.statement.push(statementOperation)

    return response.status(201).json(statementOperation)
})

app.get("/statement/date", (request, response) => {
    const { customer } = request
    const { date } = request.query

    const dateFormat = new Date(date + " 00:00").toDateString()

    const statement = customer.statement.filter(operation => operation.created_at.toDateString() === dateFormat)

    return response.json(statement)
})

app.get("/account", (request, response) => response.json(request.customer))

app.put("/account", (request, response) => {
    const { customer } = request
    const { name } = request.body

    customer.name = name

    return response.json(customer)
})

app.listen(3333)
