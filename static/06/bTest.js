var   b2Vec2 = Box2D.Common.Math.b2Vec2
 , b2BodyDef = Box2D.Dynamics.b2BodyDef
 , b2Body = Box2D.Dynamics.b2Body
 , b2FixtureDef = Box2D.Dynamics.b2FixtureDef
 , b2Fixture = Box2D.Dynamics.b2Fixture
 , b2World = Box2D.Dynamics.b2World
 , b2MassData = Box2D.Collision.Shapes.b2MassData
 , b2PolygonShape = Box2D.Collision.Shapes.b2PolygonShape
 , b2CircleShape = Box2D.Collision.Shapes.b2CircleShape
 , b2DebugDraw = Box2D.Dynamics.b2DebugDraw
   ;

function bTest(intervalRate, adaptive) {
  this.intervalRate = parseInt(intervalRate);
  this.adaptive = adaptive;

  this.world = new b2World(
        new b2Vec2(0, 10)    //gravity
     ,  true                 //allow sleep
  );

  var SCALE = 30;

  this.fixDef = new b2FixtureDef;
  this.fixDef.density = 1.0;
  this.fixDef.friction = 0.5;
  this.fixDef.restitution = 0.2;

  this.bodyDef = new b2BodyDef;

  //create ground
  this.bodyDef.type = b2Body.b2_staticBody;

  // positions the center of the object (not upper left!)
  this.bodyDef.position.x = 1024 / 2 / SCALE;
  this.bodyDef.position.y = 768 / SCALE;

  this.fixDef.shape = new b2PolygonShape;

  // half width, half height. eg actual height here is 1 unit
  this.fixDef.shape.SetAsBox((1000 / SCALE) / 2, (10/SCALE) / 2);
  this.world.CreateBody(this.bodyDef).CreateFixture(this.fixDef);
}

bTest.prototype.update = function() {
  var start = Date.now();
  var stepRate = (this.adaptive) ? (now - this.lastTimestamp) / 1000 : (1 / this.intervalRate);
  this.world.Step(
         stepRate   //frame-rate
      ,  10       //velocity iterations
      ,  10       //position iterations
   );
   this.world.ClearForces();
   return (Date.now() - start);
}

bTest.prototype.getState = function() {
  var state = {};
  for (var b = this.world.GetBodyList(); b; b = b.m_next) {
    if (b.IsActive() && typeof b.GetUserData() !== 'undefined' && b.GetUserData() != null) {
        state[b.GetUserData()] = {x: b.GetPosition().x, y: b.GetPosition().y, a: b.GetAngle()};
    }
  }
  return state;
}

bTest.prototype.setBodies = function(bodyEntities) {
    this.bodyDef.type = b2Body.b2_dynamicBody;
    for(var id in bodyEntities) {
        var entity = bodyEntities[id];
        if (entity.radius) {
            this.fixDef.shape = new b2CircleShape(entity.radius);
        } else {
            this.fixDef.shape = new b2PolygonShape;
            this.fixDef.shape.SetAsBox(entity.halfWidth, entity.halfHeight);
        }
       this.bodyDef.position.x = entity.x;
       this.bodyDef.position.y = entity.y;
       this.bodyDef.userData = entity.id;
       this.world.CreateBody(this.bodyDef).CreateFixture(this.fixDef);
    }
    this.ready = true;
}