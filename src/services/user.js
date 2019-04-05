class UserService {
  constructor(client) {
    this.client = client
  }

  get collection() {
    return this.client.db('app').collection('users')
  }

  createToken(name) {
    return `${name}_${name.length}`
  }

  async getAll() {
    return await this.collection.find({}).toArray()
  }

  async getByName(name) {
    return await this.collection.findOne({ name: name })
  }

  async getByToken(token) {
    return await this.collection.findOne({ token: token })
  }

  async signup(name) {
    if (await this.getByName(name)) {
      throw Error('User with given name already exists')
    }

    const record = {
      name: name,
      token: this.createToken(name),
    }

    await this.collection.insertOne(record)
    return record
  }

  async signin(token) {
    return await this.getByToken(token)
  }

  async signout(token) {
    const result = await this.collection.deleteOne({ token: token })
    return result.deletedCount > 0
  }
}

export default UserService
