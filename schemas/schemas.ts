import joi from 'joi'

export const todoSchema = joi.object({
  id: joi.number().integer().positive().required(),
  title: joi.string().required(),
  description: joi.string().allow(null, '').optional(),
  completed: joi.boolean().required(),
  due_date: joi.string().allow(null, '').optional(),
})

export const todoListSchema = joi.array().items(todoSchema)
