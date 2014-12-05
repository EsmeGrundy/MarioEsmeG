// TODO
game.PlayerEntity = me.Entity.extend({
    init: function(x, y) {
        this._super(me.Entity, 'init', [x, y, {
                image: "mario",
                spritewidth: "128",
                spriteheight: "128",
                width: 128,
                height: 128,
                getShape: function() {
                    return (new me.Rect(0, 0, 30, 128).toPolygon());
                }
            }]);

        this.renderable.addAnimation("idle", [3]);
        this.renderable.addAnimation("bigIdle", [19]);
        //creates an animation for the character walking without powerups called smallwalk
        //adds an array of values 8-13 which are the pictures for the animation
        //80 represents the amount of milliseconds between switching pictures
        this.renderable.addAnimation("smallWalk", [8, 9, 10, 11, 12, 13], 80);
        this.renderable.addAnimation("bigWalk", [14, 15, 16, 17, 18, 19], 80);
        this.renderable.addAnimation("shrink", [0, 1, 2, 3], 10);
        this.renderable.addAnimation("grow", [4, 5, 6, 7], 10);


        //sets a variable for whether we have eaten the mushroom
        this.big = false;
        
        //the first number sets the speed mario moves on x axis, the second sets the speed on the y axis
        this.body.setVelocity(5, 20);
        
        //makes the screen(viewport) follow mario's position(pos) on both x and y axes
        me.game.viewport.follow(this.pos, me.game.viewport.AXIS.BOTH);
    },
    update: function(delta) {
        //checks if the right key is pushed down
        if (me.input.isKeyPressed("right")) {
            //resets the image if it has been flipped so it is back to normal
            this.flipX(false);
            //adds value to mario's x position based on the x value from setVelocity above
            //me.timer.tick smooths the animation for irregular updates
            this.body.vel.x += this.body.accel.x * me.timer.tick;
        }
        //checks if the left key is pressed
        else if (me.input.isKeyPressed("left")) {
            //flips the image along the  x-axis
            this.flipX(true);
            //subtracts value from mario's x position based on the x-value from setVelocity
            this.body.vel.x -= this.body.accel.x * me.timer.tick;
        }
        else {
            //if nothing happens, mario does not move
            this.body.vel.x = 0;
        }
        //checks if the up arrow key is pressed
        if (me.input.isKeyPressed("jump")) {
            //checks if mario is not already jumping or falling
            if (!this.body.jumping && !this.body.falling) {
                //sets mario's velocity in the y direction to the y velocity from setVelocity and smooths animation
                this.body.vel.y = -this.body.maxVel.y * me.timer.tick;
                //makes jumping variable true
                this.body.jumping = true;
            }
        }
        //calls update function
        this.body.update(delta);
        //checks if mario is colliding with anything and calls the collideHandler function
        //sends collideHandler function hidden parameter "this"
        me.collision.check(this, true, this.collideHandler.bind(this), true);

        if (!this.big) {
            //checks if mario is moving
            if (this.body.vel.x !== 0) {
                //checks if animation is already small walk, grow, or shrink
                if (!this.renderable.isCurrentAnimation("smallWalk") && !this.renderable.isCurrentAnimation("grow") && !this.renderable.isCurrentAnimation("shrink")) {
                    this.renderable.setCurrentAnimation("smallWalk");
                    this.renderable.setAnimationFrame();
                }
            }
            else {
                this.renderable.setCurrentAnimation("idle");
            }
        }
        else {
            //checks if mario is moving
            if (this.body.vel.x !== 0) {
                //checks if animation is already big walk, shrink, or grow
                if (!this.renderable.isCurrentAnimation("bigWalk") && !this.renderable.isCurrentAnimation("grow") && !this.renderable.isCurrentAnimation("shrink")) {
                    this.renderable.setCurrentAnimation("bigWalk");
                    this.renderable.setAnimationFrame();
                }
            }
            else {
                this.renderable.setCurrentAnimation("bigIdle");
            }
        }


        this._super(me.Entity, "update", [delta]);
        return true;
    },
    collideHandler: function(response) {
        //sets variable ydif to mario's y position minus the enemy's y position?
        var ydif = this.pos.y - response.b.pos.y;
        console.log(ydif);

        //checks if mario has collided with a bad guy
        if (response.b.type === 'badguy') {
            //checks if the ydif is enough to kill the enemy
            if (ydif <= -115) {
                //sets the enemy to not alive
                response.b.alive = false;
            }
            else {
                //checks if mario has eaten the mushroom
                if(this.big){
                    //sets mario to small mario again
                    this.big = false;
                    this.body.vel.y -= this.body.accel.x * me.timer.tick;
                    this.jumping = true;
                    this.renderable.setCurrentAnimation("shrink", "idle");
                    this.renderable.setAnimationFrame();
                }
                else {
                    me.state.change(me.state.RESTART);
                }
            }
        }
        else if (response.b.type === 'mushroom') {
            this.big = true;
            me.game.world.removeChild(response.b);
            this.renderable.setCurrentAnimation("grow", "bigIdle");
        }
        else if(response.b.type === 'star'){
            
        }
        else if(this.bottom > 300){
            console.log("You Died!");
            me.state.change(me.state.RESTART);
        }
    }
});

game.LevelTrigger = me.Entity.extend({
    init: function(x, y, settings) {
        this._super(me.Entity, 'init', [x, y, settings]);
        //Sets what happens when this body collides with something to a function called onCollision and
        //passes this level trigger as a hidden parameter
        this.body.onCollision = this.onCollision.bind(this);
        this.level = settings.level;
        this.xSpawn = settings.xSpawn;
        this.ySpawn = settings.ySpawn;
    },
    onCollision: function() {
        this.body.setCollisionMask(me.collision.types.NO_OBJECT);
        me.levelDirector.loadLevel(this.level);
        me.state.current().resetPlayer();
    }
});

game.BadGuy = me.Entity.extend({
    init: function(x, y, settings) {
        this._super(me.Entity, 'init', [x, y, {
                image: "slime",
                spritewidth: "60",
                spriteheight: "28",
                width: 60,
                height: 28,
                getShape: function() {
                    return (new me.Rect(0, 0, 60, 28).toPolygon());
                }
            }]);

        this.spritewidth = 60;
        var width = settings.width;
        x = this.pos.x;
        this.startX = x;
        this.endX = x + width - this.spritewidth;
        this.pos.x = x + width - this.spritewidth;

        this.updateBounds();

        this.alwaysUpdate = true;

        this.walkLeft = false;
        this.alive = true;
        this.type = "badguy";

        this.body.setVelocity(4, 6);
    },
    update: function(delta) {
        this.body.update(delta);
        me.collision.check(this, true, this.collideHandler.bind(this), true);

        if (this.alive) {
            if (this.walkLeft && this.pos.x <= this.startX) {
                this.walkLeft = false;
            }
            else if (!this.walkLeft && this.pos.x >= this.endX) {
                this.walkLeft = true;
            }

            this.flipX(!this.walkLeft);
            this.body.vel.x += (this.walkLeft) ? -this.body.accel.x * me.timer.tick : this.body.accel.x * me.timer.tick;
        }



        else {
            me.game.world.removeChild(this);
        }

        this._super(me.Entity, "update", [delta]);
        return true;
    },
    collideHandler: function() {

    }
});

game.Mushroom = me.Entity.extend({
    init: function(x, y, settings) {
        this._super(me.Entity, 'init', [x, y, {
                image: "mushroom",
                spritewidth: "64",
                spriteheight: "64",
                width: 64,
                height: 64,
                getShape: function() {
                    return (new me.Rect(0, 0, 64, 64).toPolygon());
                }
            }]);
        me.collision.check(this);
        this.type = "mushroom";
    }
});

game.Star = me.Entity.extend({
   init: function(x, y, settings){
         this._super(me.Entity, 'init', [x, y, {
                image: "star",
                spritewidth: "64",
                spriteheight: "64",
                width: 64,
                height: 64,
                getShape: function() {
                    return (new me.Rect(0, 0, 64, 64).toPolygon());
                }
            }]);
       me.collision.check(this);
       this.type = "star";
   } 
});
