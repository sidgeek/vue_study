import { mount } from '@vue/test-utils'
import { describe, it, expect, beforeEach } from 'vitest'
import TodoList from '../components/TodoList.vue'

describe('TodoList', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('adds a todo', async () => {
    const wrapper = mount(TodoList)
    const input = wrapper.find('input[placeholder="输入待办..."]')
    await input.setValue('learn vitest')
    await wrapper.find('form').trigger('submit.prevent')

    expect(wrapper.findAll('li').length).toBe(1)
    expect(wrapper.find('li .title').element.value).toBe('learn vitest')
  })

  it('toggles complete', async () => {
    const wrapper = mount(TodoList)
    const input = wrapper.find('input[placeholder="输入待办..."]')
    await input.setValue('task')
    await wrapper.find('form').trigger('submit.prevent')

    const checkbox = wrapper.find('li input[type="checkbox"]')
    await checkbox.trigger('change')
    expect(wrapper.find('li').classes()).toContain('done')
  })

  it('persists to localStorage', async () => {
    let wrapper = mount(TodoList)
    const input = wrapper.find('input[placeholder="输入待办..."]')
    await input.setValue('persist me')
    await wrapper.find('form').trigger('submit.prevent')

    // remount
    wrapper.unmount()
    wrapper = mount(TodoList)
    expect(wrapper.findAll('li').length).toBe(1)
    expect(wrapper.find('li .title').element.value).toBe('persist me')
  })
})