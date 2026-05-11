import { TodoPage } from '../page-objects/TodoPage.js'

describe('Task completion flow', () => {
  const todo = new TodoPage()
  let taskId: number

  beforeAll(async () => {
    await todo.create({ title: 'Test completion flow', description: 'Created by automated test' })
    todo.expectStatus(201)
    taskId = todo.json.id as number
  })

  afterAll(async () => {
    await todo.delete(taskId)
    todo.expectStatus(204)
  })

  it('new task starts in Open Tasks (completed: false)', async () => {
    await todo.getById(taskId)
    todo.expectStatus(200).expectJsonValue('completed', false)
  })

  it('after completing, task moves to Completed section (completed: true)', async () => {
    await todo.update(taskId, { completed: true })
    todo.expectStatus(200).expectJsonValue('completed', true)

    await todo.getById(taskId)
    todo.expectStatus(200).expectJsonValue('completed', true)
  })

  it('after undoing completion, task returns to Open Tasks (completed: false)', async () => {
    await todo.update(taskId, { completed: false })
    todo.expectStatus(200).expectJsonValue('completed', false)

    await todo.getById(taskId)
    todo.expectStatus(200).expectJsonValue('completed', false)
  })

  it('after completing again, task is back in Completed section (completed: true)', async () => {
    await todo.update(taskId, { completed: true })
    todo.expectStatus(200).expectJsonValue('completed', true)

    await todo.getById(taskId)
    todo.expectStatus(200).expectJsonValue('completed', true)
  })
})
