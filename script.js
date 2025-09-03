class Example extends Phaser.Scene {
  constructor() {
    super();
  }

  preload() {
    this.load.tilemapTiledJSON("map", "assets/maps/level1.json");

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

    map.createLayer("background1", [backgroundTiles], 0, 0);
    map.createLayer("background2", [grasslandTiles], 0, 0);
    const groundsLayer = map.createLayer(
      "grounds",
      [terrainTiles, blocksTiles, grasslandTiles],
      0,
      0
    );
    map.createLayer("lava", [lavaTiles], 0, 0);

    groundsLayer.setCollisionByProperty({ collides: true });

    this.player = this.physics.add.sprite(100, 100, "mario");
    this.player.setCollideWorldBounds(true);
    this.player.body.setGravityY(500);

    this.anims.create({
      key: "left",
      frames: this.anims.generateFrameNumbers("mario", {
        start: 0,
        end: 3,
      }),
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
      frames: this.anims.generateFrameNumbers("mario", {
        start: 5,
        end: 8,
      }),
      frameRate: 10,
      repeat: -1,
    });

    this.physics.add.collider(this.player, groundsLayer);

    this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
    this.physics.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
    this.cameras.main.startFollow(this.player, true);
    this.cameras.main.setZoom(2);

    // Kontrol keyboard
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
    }
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
      gravity: { y: 0 },
      debug: false,
    },
  },
  scene: Example,
};

const game = new Phaser.Game(config);
