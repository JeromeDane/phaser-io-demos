import bg1 from 'images/bg1.png'

const preload = () => {
  game.load.image('bg1', bg1)
}

const create = () => {
  game.add.sprite(0, 0, 'bg1')
}

const update = () => {
  // todo
}

const game = new Phaser.Game(800, 600, Phaser.AUTO, 'phaser-example', { preload, create, update})
