const TodoList = artifacts.require('./TodoList.sol')

contract('TodoList', (accounts) => {
    let todoList;

    before(async () => {
        todoList = await TodoList.deployed()
    })

    it('deploys successfully', async () => {
        const address = await todoList.address

        assert.notEqual(address, 0x0)
        assert.notEqual(address, '')
        assert.notEqual(address, null)
        assert.notEqual(address, undefined)
    })

    it('lists tasks', async () => {
        const taskCount = await todoList.taskCount()
        const task = await todoList.tasks(taskCount)

        assert.equal(task.id.toNumber(), taskCount.toNumber())
        assert.equal(task.content, 'Check out aappuniversity.com')
        assert.equal(task.completed, false)
        assert.equal(taskCount.toNumber(), 1)
    })
})