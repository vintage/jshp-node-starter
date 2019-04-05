import { ObjectId } from 'mongodb'

class MessageService {
  constructor(client) {
    this.client = client
  }

  get collection() {
    return this.client.db('app').collection('messages')
  }

  async getAll() {
    return await this.collection.find({}).toArray()
  }

  async getOne(id, author) {
    return await this.collection.findOne({ _id: ObjectId(id), author: author })
  }

  async create(content, author, image = null) {
    const record = {
      content: content,
      author: author,
      image: image,
      likes: [],
    }

    await this.collection.insertOne(record)
    return record
  }

  async delete(id, author) {
    const result = await this.collection.deleteOne({ _id: ObjectId(id), author: author })
    return result.deletedCount > 0
  }

  async like(id, author) {
    const message = await this.getOne(id, author)
    const likes = message.likes || []
    if (!message || likes.includes(author)) {
      return false
    }

    likes.push(author)

    await this.collection.updateOne({ _id: ObjectId(message._id) }, { $set: { likes: likes } })

    return true
  }

  async dislike(id, author) {
    const message = await this.getOne(id, author)
    const likes = message.likes || []
    if (!message || !likes.includes(author)) {
      return false
    }

    const newLikes = likes.filter(like => like !== author)

    await this.collection.updateOne({ _id: ObjectId(message._id) }, { $set: { likes: newLikes } })

    return true
  }
}

export default MessageService
