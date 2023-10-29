App = {
  loading: false,
  contracts: {},

  load: async () => {
    await App.loadWeb3()
    await App.loadAccount()
    await App.loadContract()
    await App.render()
  },

  // Metamask default settings
  // https://medium.com/metamask/https-medium-com-metamask-breaking-change-injecting-web3-7722797916a8
  loadWeb3: async () => {
    // if (typeof web3 !== 'undefined') {
    //   App.web3Provider = web3.currentProvider
    //   web3 = new Web3(web3.currentProvider)
    // } else {
    //   window.alert("Please connect to Metamask.")
    // }
    // Modern dapp browsers...
    if (window.ethereum) {
      window.web3 = new Web3(ethereum)
      //const Web3 = new Web3(newWeb3.providers.HttpProvider('http://localhost:8545'))

      try {
        // Request account access if needed
        //await ethereum.enable(), this methood of requesting account is deprecated
        const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
        const account = accounts[0]
        setAccounts(accounts);
        // Acccounts now exposed
        web3.eth.sendTransaction({/* ... */ })
      } catch (error) {
        if (error.code === 4001) {
          // User denied account access...
        }
      }
    }
    // Legacy dapp browsers...
    else if (window.web3) {
      App.web3Provider = web3.currentProvider
      window.web3 = new Web3(web3.currentProvider)
      // Acccounts always exposed
      web3.eth.sendTransaction({/* ... */ })
    }
    // Non-dapp browsers...
    else {
      console.log('Non-Ethereum browser detected. You should consider trying MetaMask!')
    }
  },
  // Metamask default settings ends here

  loadAccount: async () => {
    // Set the current blockchain account
    //App.account = web3.eth.accounts[0]
    const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
    App.account = accounts[0]
    // console.log(App.account)
  },

  loadContract: async () => {
    // Create a JavaScript version of the smart contract
    const todoList = await $.getJSON('TodoList.json')
    App.contracts.TodoList = TruffleContract(todoList)
    App.contracts.TodoList.setProvider(web3.currentProvider)
    // console.log(todoList)

    // Hydrate the smart contract with values from the blockchain
    App.todoList = await App.contracts.TodoList.deployed()

  },

  render: async () => {
    // Prevent double render
    if (App.loading) {
      return
    }

    // Update app loading state
    App.setLoading(true)

    // Render Account
    $('#account').html(App.account)
    // $('#account').html('This should be right here')
    console.log(App.account)

    // Render Tasks
    await App.renderTasks()

    // Update loading state
    App.setLoading(false)
  },

  renderTasks: async () => {
    // Load the total task count from the blockchain
    const taskCount = await App.todoList.taskCount()
    console.log('Total task: ',taskCount.toNumber())
    const $taskTemplate = $('.taskTemplate')

    // Render out each task with a new task template
    for (var i = 1; i <= taskCount; i++) {
      // Fetch the task data from the blockchain
      const task = await App.todoList.tasks(i)
      const taskId = task[0].toNumber()
      console.log('Task iD: ', taskId)
      const taskContent = task[1]
      console.log('Task Content: ', taskContent)
      const taskCompleted = task[2]
      console.log('Task Completed: ', taskCompleted)

      // Create the html for the task
      const $newTaskTemplate = $taskTemplate.clone()
      $newTaskTemplate.find('.content').html(taskContent)
      $newTaskTemplate.find('input')
                      .prop('name', taskId)
                      .prop('checked', taskCompleted)
                      // .on('click', App.toggleCompleted)

      // Put the task in the correct list
      if (taskCompleted) {
        $('#completedTaskList').append($newTaskTemplate)
      } else {
        $('#taskList').append($newTaskTemplate)
      }

      // Show the task
      $newTaskTemplate.show()
    }
  },

  // createTask: async () => {
  //   App.setLoading(true)
  //   const content = $('#newTask').val()
  //   await App.todoList.createTask(content)
  //   window.location.reload()
  // },

  // toggleCompleted: async (e) => {
  //   App.setLoading(true)
  //   const taskId = e.target.name
  //   await App.todoList.toggleCompleted(taskId)
  //   window.location.reload()
  // },

  setLoading: (boolean) => {
    App.loading = boolean
    const loader = $('#loader')
    const content = $('#content')
    if (boolean) {
      loader.show()
      content.hide()
    } else {
      loader.hide()
      content.show()
    }
  }
}

$(() => {
  $(window).on('load', () => {
    App.load()
  })
})