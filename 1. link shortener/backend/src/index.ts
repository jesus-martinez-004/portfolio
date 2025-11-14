const start = () => {
    console.log("Iniciando")
}

const restart = () => {
    console.log("Reiniciando")
}

const commands = {
    "start": start,
    "restart": restart
}

console.log(JSON.stringify(commands.restart.toString()))