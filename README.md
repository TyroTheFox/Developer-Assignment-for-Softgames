# Developer Assignment for Softgames
### By Kieran Clare

Made in about a week.

There are some small tweaks and alterations based on the directive that the flare I present each scenario with would also be taken into account alongside my technical prowess I display. I did take the small liberty to alter some of the materials provided in order to better accomplish what makes sense to me and fixing deliberate mistakes. Flare and style were criteria in each task.

## Engine
- Built within around a week
- Built in PIXI.js v8
- Uses a simple mechanism imagined around 'Stages' and 'Scenes' where a single stage can hoast a particular scene. So, a UI would be a scene on a UI stage while the game would be another stage.
- Data Driven wherever possible to shove as much into JSON as can be. No magic numbers if avoidable, all derrived from the JSON settings data.
- Uses gsap pretty extensively
- Incorperates PIXI UI as usable actors

### "Ace of Shadows" Card Example
- Created a 'Dealer' and 'Player' characters which trade cards around from different parts of the screen.
- Created a 'Puppeteer' class to handle the Dealer and the Player's animations through data.
- Animated the Dealer's hand assets throwing cards around.

### "Magic Words" Dialogue Example
- The Neighbour doesn't have an avatar because they're supposedly off-screen but can still trigger Emoji because they're apparently still a character
- Added 'Affirmative' and 'Win' Emoji
- Altered all the emoji to ensure they're closer to their intended emotion as well as altered their backgrounds to ensure they all visually stand out
- Fixed the Sad emoji which didn't look very sad
- Added Puppet versions of Penny, Sheldon and Leondard to the screen alongside the expected avatars to fill out more of the screen. Also, because it looks a little goofier.
- Added a local backup of all remote assets just in-case Dice Bear suddenly implodes.
- Did spot the error where Sheldon's URL includes a port number where it doesn't need it, but now can show off the redundancy at work.

### 'Pheonix Flame' Particle Emitter Example
- A straightforward interpretation of the prompt with a neat image I made
- Uses the new Particle Container with gsap handling manipulation of particles (primarily because the Particle Container for v8 is still a WIP).
- The particle emitter should be hovering around 9 sprites at a time, with a single Sprite for the Phoenix to sell the idea a little better.

### Alternative 'Pheonix Flame' Particle Emitter Example
- I was uncertain if I would be going overboard for adding more than 10 Sprites to the whole scene but already had the work done so I included this too.
- The particle emitter uses only 10 Sprites at any time. Buuuut, dressed it up with a few extra ones to make it look more like a Magic attack.
- Got this Sprite from FictionFight87 on DeviantArt: https://www.deviantart.com/fictionfight87/art/Sora-Sprite-Sheet-1-1075285701
- The rest is all me.
- Uses the new Particle Container with gsap handling manipulation of particles (primarily because the Particle Container for v8 is still a WIP).