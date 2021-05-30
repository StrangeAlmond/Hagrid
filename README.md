# Hagrid
Hagrid is a hybrid RP/Video Game bot developed for discord to simulate the Hogwarts experience. It was created in anticipation of the **Harry Potter: Wizards Unite** AR mobile game released in 2019. With Hagrid you start your journey in Diagon Alley before being whisked away to Hogwarts where you'll study and adventure your way from First to Seventh Year. Gain  experience as you interact with other students, journey through mazes and dungeons, fight together to take down ferocious beasts, brew potions, and a whole lot more. For more information you can view the wiki [here](https://hagrid.fandom.com/wiki/Hagrid_Wiki).

Hagrid is only designed to be used in the [offical discord server](https://discord.gg/PWKYMct). As such, any forks of this repo may require knowledge of programming in order to customize the bot to your discord server.

---
## Installing
1. Install Node.js and NPM
2. Clone this project with git: `git clone https://github.com/StrangeAlmond/Hagrid.git`. This will clone the code into a subdirectory named Hagrid.
3. Note: Follow the appropiate pre-requisites for your OS at https://enmap.evie.dev/install before continuing. Once you have performed the appropiate steps for your operating system of choice, open a terminal/command prompt in the directory created in step 2 and install dependencies with `npm install`.
4. Create a `botconfig.json` file in the src/ directory.
5. Add the following contents to the botconfig.json file, replacing the values with your preferences:
    ```
        {
            "token": "TOKEN-HERE",
            "prefix": "!",
            "ownerId": "356172624684122113",
            "timezone": "America/Los_Angeles"
        }
    ```
6. Start the bot with `npm start`.