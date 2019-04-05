import express from 'express'
import request from 'request'

import { client as dbClient } from './db'
import UserService from './services/user'
import MessageService from './services/message'

const userService = new UserService(dbClient)
const messageService = new MessageService(dbClient)

function asyncHandler(route) {
  return async (req, res, next) => {
    try {
      await route(req, res, next)
    } catch (err) {
      console.log(err)
      res.status(500).send(err.message)
    }
  }
}

function getRandomName(req, res) {
  request('https://randomuser.me/api/', function(error, response, body) {
    try {
      const userResponse = JSON.parse(body)

      const nameData = userResponse.results[0].name
      const randomName = `${nameData.first} ${nameData.last}`

      res.json({
        name: randomName,
      })
    } catch (err) {
      res.json({
        name: 'John Smith',
      })
    }
  })
}

async function authSignup(req, res) {
  const userName = req.body.name

  try {
    const user = await userService.signup(userName)
    res.json(user)
  } catch (err) {
    res.status(400).json({
      error: err.message,
    })
  }
}

async function authSignin(req, res) {
  const token = req.body.token

  const user = await userService.signin(token)
  if (user) {
    res.json(user)
  } else {
    res.status(400).json({
      error: 'Invalid token provided',
    })
  }
}

async function authSignout(req, res) {
  const token = req.body.token

  const isSuccess = await userService.signout(token)
  res.json({
    success: isSuccess,
  })
}

async function getUsers(req, res) {
  const isHacker = req.query.isHacker === 'true'
  const users = await userService.getAll()

  res.json(
    users.map(user => {
      // Security!
      if (!isHacker) {
        delete user.token
      }
      return user
    }),
  )
}

async function getMessages(req, res) {
  const messages = await messageService.getAll()
  res.json(messages)
}

async function getMessage(req, res) {
  const user = await userService.getByToken(req.header('Authorization-Token'))
  if (!user) {
    res.status(400).json({
      error: 'Invalid token',
    })
  }

  const messageId = req.params.id
  const message = await messageService.getOne(messageId, user.name)
  res.json({
    message: message,
  })
}

async function createMessage(req, res) {
  const user = await userService.getByToken(req.header('Authorization-Token'))
  if (!user) {
    res.status(400).json({
      error: 'Invalid token',
    })
  }

  const content = req.body.content
  const image = req.files ? req.files.image : null

  if (!content) {
    res.status(400).json({
      error: 'Content cannot be empty',
    })
  }

  const message = await messageService.create(content, user.name, image)
  res.json(message)
}

async function deleteMessage(req, res) {
  const user = await userService.getByToken(req.header('Authorization-Token'))
  if (!user) {
    res.status(400).json({
      error: 'Invalid token',
    })
  }

  const messageId = req.params.id
  const isDeleted = await messageService.delete(messageId, user.name)
  res.json({
    isDeleted: isDeleted,
  })
}

async function likeMessage(req, res) {
  const user = await userService.getByToken(req.header('Authorization-Token'))
  if (!user) {
    res.status(400).json({
      error: 'Invalid token',
    })
  }

  const messageId = req.params.id
  const isSuccess = await messageService.like(messageId, user.name)
  res.json({
    isSuccess: isSuccess,
  })
}

async function dislikeMessage(req, res) {
  const user = await userService.getByToken(req.header('Authorization-Token'))
  if (!user) {
    res.status(400).json({
      error: 'Invalid token',
    })
  }

  const messageId = req.params.id
  const isSuccess = await messageService.dislike(messageId, user.name)
  res.json({
    isSuccess: isSuccess,
  })
}

const router = express.Router()
// Utils
router.get('/random-name', asyncHandler(getRandomName))

// Auth
router.post('/auth/signup', asyncHandler(authSignup))
router.post('/auth/signin', asyncHandler(authSignin))
router.post('/auth/signout', asyncHandler(authSignout))

// Users
router.get('/users', asyncHandler(getUsers))

// Messages
router.get('/messages', asyncHandler(getMessages))
router.post('/messages', asyncHandler(createMessage))
router.get('/messages/:id', asyncHandler(getMessage))
router.delete('/messages/:id', asyncHandler(deleteMessage))
router.post('/messages/:id/like', asyncHandler(likeMessage))
router.delete('/messages/:id/like', asyncHandler(dislikeMessage))

export default router
