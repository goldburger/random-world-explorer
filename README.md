# team15-term-project

###Disclaimer
I am far from being done with the shooting functionality, so please don't be insulted by the inadequacies of this project! I am pushing it to github right now, prematurely, for everyone's peace of mind that we are making some progress in the right direction!

# Shooting
-First mouse click enables aim. 
-Subsequent mouse clicks shoot a sphere. 

There are random floating spheres we see in the distance when it starts. They are there because I am testing collision detection, and it seems to work! When you shoot a cannonball and it collides with one of these spheres, it disappears momentarily! Then it reappears somewhere else on the screen. 

Currently the sphere has a texture similar to the cannon itself. Please feel free to change it. I haven't yet had a chance to give the cannonball a good texture but it will be great if someone wants to give that a shot!

# Shape superclass
The most difficult thing I have had to do, along with TA Garett's help, is to implement the Shape superclass, of which sphere is a child class. Shape takes as arguments four things - vertices, normals, indices, indexed - and does the drawing etc. 

This basically gives us the ability to plot anything as long as we have the four given parameters! 

If someone wants to find a cool target object (like a house or something), which should not be terribly difficult on the internet, please send me the four aforementioned attributes of it. Thanks! I plan to do the same myself when I get through this as well. 


