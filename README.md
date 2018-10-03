# About
Image based subreddits has a lot of nice content but makes it really hard to browse through because you have to open each link in a new tab. The focus of my web app was to browse the images with a minimum of text while having the image as large as possible. The web app should be a place where you can experience and enjoy pictures that you love rather than a place where you quickly browse through many images without really having a look at any of them (reddit!).

It found it boring that image browsers often are linear. You start in one end (left) and work you way to the other (right). To counter this I made an image wall you are able to scroll around in whatever direction you would like to.

To keep focus on one image at a time, the image had to be fullscreen, but while images are often not the same aspect ratio as the screen I had to come up with something to cover the background. White or another coloured background would simply be too boring so I reused the same image zoomed in as background, just a little blurred and toned down.

This was my first time using React or any other javascript framework.

# Features
- Scroll in any direction.
- Save your favorites by clicking on an image
- Return to your favorite by clicking the image in the left sidebar
- Go to the reddit post by clicking the authors name in the left sidebar
- Enter any valid subreddit like: aww cats crappydesign sneakers

# To do
- User database to save favourites?
- More smooth loading of images (Pre load images before reaching edge)
- Hide images not being rendered for better performance. Something like KD-trees 
