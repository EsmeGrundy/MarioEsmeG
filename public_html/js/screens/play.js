game.PlayScreen = me.ScreenObject.extend({
    /**
     *  action to perform on state change
     */
    onResetEvent: function() {
        // reset the score
        game.data.score = 0;
        
        //loads the first level when the game starts
        me.levelDirector.loadLevel("EsmeLevel01");
        
        this.resetPlayer(10, 200);

        //adds keys to use during game
        me.input.bindKey(me.input.KEY.RIGHT, "right");
        me.input.bindKey(me.input.KEY.LEFT, "left");
        me.input.bindKey(me.input.KEY.UP, "jump")
        me.input.bindKey(me.input.KEY.SPACE, "fireball");

        // add our HUD to the game world
        this.HUD = new game.HUD.Container();
        me.game.world.addChild(this.HUD);
    },
    /**
     *  action to perform when leaving this screen (state change)
     */
    onDestroyEvent: function() {
        // remove the HUD from the game world
        me.game.world.removeChild(this.HUD);
    },
    
    resetPlayer: function(x, y) {
        var player = me.pool.pull("mario", x, y, {});
        //adds mario in the 5 z position
        me.game.world.addChild(player, 5);

    }
});
