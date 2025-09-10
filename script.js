class Example extends Phaser.Scene {
  constructor() {
    super();
  }

  preload() {
    this.load.tilemapTiledJSON("map", "assets/maps/level1.json");
    this.load.audio("bgm", "assets/audio/backsound.mp3");
    this.load.audio("jump", "assets/audio/jump.mp3");

    this.load.spritesheet("hantu", "assets/enemy/ghost1_fly.png", {
      frameWidth: 16,
      frameHeight: 16,
    });

    this.load.image(
      "background",
      "assets/tilesets/_Complete_static_BG_(288 x 208).png"
    );
    this.load.image("Blocks", "assets/tilesets/Blocks (16 x 16).png");
    this.load.image(
      "Grassland",
      "assets/tilesets/Grassland_entities (16 x 16).png"
    );
    this.load.image("Lava", "assets/tilesets/Lava_frames (16 x 32).png");
    this.load.image("Terrain", "assets/tilesets/Terrain (16 x 16).png");

    this.load.spritesheet("mario", "assets/sprites/Mario.png", {
      frameWidth: 32,
      frameHeight: 32,
    });
  }

  create() {
    const map = this.make.tilemap({ key: "map" });

    const backgroundTiles = map.addTilesetImage("background", "background");
    const terrainTiles = map.addTilesetImage("Terrain", "Terrain");
    const blocksTiles = map.addTilesetImage("Blocks", "Blocks");
    const grasslandTiles = map.addTilesetImage("Grassland", "Grassland");
    const lavaTiles = map.addTilesetImage("Lava", "Lava");

    // sound
    this.bgm = this.sound.add("bgm", { loop: true, volume: 0.7 });
    this.bgm.play();
    this.jumpSound = this.sound.add("jump");

    map.createLayer("background1", [backgroundTiles], 0, 0);
    map.createLayer("background2", [grasslandTiles], 0, 0);

    const groundsLayer = map.createLayer(
      "grounds",
      [terrainTiles, blocksTiles, grasslandTiles],
      0,
      0
    );
    const lavaLayer = map.createLayer("lava", [lavaTiles], 0, 0);

    groundsLayer.setCollisionByProperty({ collides: true });

    const spawnPoint = map.findObject(
      "playerStart",
      (obj) => obj.name === "spawn"
    );

    this.player = this.physics.add.sprite(spawnPoint.x, spawnPoint.y, "mario");
    this.player.setCollideWorldBounds(true);
    this.physics.add.collider(this.player, groundsLayer);

    this.anims.create({
      key: "left",
      frames: this.anims.generateFrameNumbers("mario", { start: 0, end: 3 }),
      frameRate: 10,
      repeat: -1,
    });
    this.anims.create({
      key: "idle",
      frames: [{ key: "mario", frame: 4 }],
      frameRate: 20,
    });
    this.anims.create({
      key: "right",
      frames: this.anims.generateFrameNumbers("mario", { start: 5, end: 8 }),
      frameRate: 10,
      repeat: -1,
    });

    const enemiesLayer = map.getObjectLayer("enemies").objects;
    this.enemies = this.physics.add.group();

    this.anims.create({
      key: "ghost-fly",
      frames: this.anims.generateFrameNumbers("hantu", { start: 0, end: 20 }),
      frameRate: 8,
      repeat: -1,
    });

    enemiesLayer.forEach((obj) => {
      const ghost = this.enemies.create(obj.x, obj.y - 16, "hantu");
      ghost.play("ghost-fly");

      ghost.setSize(12, 12);
      ghost.setOffset(2, 2);

      ghost.minX = obj.x - 200;
      ghost.maxX = obj.x + 200;
      ghost.speed = 50;
      ghost.setVelocityX(ghost.speed);

      ghost.setCollideWorldBounds(true);
      ghost.body.onWorldBounds = true;
    });

    this.physics.add.collider(this.enemies, groundsLayer);

    this.physics.add.collider(this.player, this.enemies, () => {
      console.log("Player kena musuh!");
      this.player.setPosition(spawnPoint.x, spawnPoint.y);
      this.player.setVelocity(0, 0);
    });

    lavaLayer.setTileIndexCallback(
      lavaTiles.firstgid,
      () => {
        console.log("Player jatuh ke lava!");
        this.player.setPosition(spawnPoint.x, spawnPoint.y);
        this.player.setVelocity(0, 0);
      },
      this
    );

    this.physics.add.collider(this.player, lavaLayer);

    this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
    this.physics.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
    this.cameras.main.startFollow(this.player, true);
    this.cameras.main.setZoom(2);

    this.cursors = this.input.keyboard.createCursorKeys();
  }

  update() {
    const speed = 150;
    this.player.setVelocityX(0);

    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-speed);
      this.player.anims.play("left", true);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(speed);
      this.player.anims.play("right", true);
    } else {
      this.player.anims.play("idle", true);
    }

    if (this.cursors.up.isDown && this.player.body.blocked.down) {
      this.player.setVelocityY(-300);
      this.jumpSound.play();
    }

    this.enemies.children.iterate((ghost) => {
      if (!ghost) return;
      if (ghost.x <= ghost.minX) {
        ghost.setVelocityX(ghost.speed);
      } else if (ghost.x >= ghost.maxX) {
        ghost.setVelocityX(-ghost.speed);
      }
      if (ghost.body.blocked.left) {
        ghost.setVelocityX(ghost.speed);
      } else if (ghost.body.blocked.right) {
        ghost.setVelocityX(-ghost.speed);
      }
    });
  }
}

const config = {
  type: Phaser.AUTO,
  parent: "phaser-example",
  width: 1200,
  height: 700,
  pixelArt: true,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 700 },
      debug: false,
    },
  },
  scene: Example,
};

const game = new Phaser.Game(config);
