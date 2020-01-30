# replay-to-mp4-bot
Automatically takes a replay file from a game and converts it to a mp4 file

You provide the game replay files and the bot will record the game files in a seperate folder.
It will automatically rename all the mp4 files to the appropriate names to match the original 
files as well after the recording is done.

Features:
- Reads any songs with mods and adjusts the songs length
- Can display all song lengths / mod types
- Renames files
- Records and converts gameplay to mp4

this file is not the full bot script as I want it private but here is a snippet for
some sort of reference for myself and others viewing.

--
It's also worth noting that due to complications, a valid connection to the games api is 
required. No public resources developed by other developers were able to accurately return
the correct song length for each song.

Due to this, I created my own scripts to manage the total song length along with acquiring
the mods that alter the song length.

p.s: I'm purposely not exposing what game this is for because I do not want this repository
visible through certain keywords from google. If you are browsing this page, it is because
I linked my github on my portfolio website.
