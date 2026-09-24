# Spelling Quest Adventure

Build a polished, child-friendly spelling practice game called "Spelling Quest".

The core experience is:

SEE → HEAR → SPELL → FEEDBACK

The most important requirement is:

NEVER show the written word to the player before they successfully spell it or exhaust 3 attempts.

The player should identify the word from the image and pronunciation and then type the spelling.

1. Stage Selection

Create a simple home screen:

SPELLING QUEST

Subtitle:

Look. Listen. Spell!

Show 5 large stage cards:

Stage 1

3-letter words

Stage 2

4-letter words

Stage 3

5-letter words

Stage 4

6-letter words

Stage 5

7-letter words

All stages can be selectable in V1.

Each stage must contain exactly 100 unique words.

That means the initial application must contain:

500 unique words total.

2. Word Difficulty

Strictly enforce:

Stage 1 → exactly 3-letter words

Stage 2 → exactly 4-letter words

Stage 3 → exactly 5-letter words

Stage 4 → exactly 6-letter words

Stage 5 → exactly 7-letter words

Do not use a word in more than one stage.

All 500 words must be unique across the entire application.

Use common, recognizable vocabulary suitable for children.

3. Word Categories

Create a broad vocabulary across the 500 words.

Include categories such as:

Animals

cat, dog, lion, tiger, rabbit, monkey, etc.

Birds

owl, crow, duck, eagle, parrot, penguin, etc.

Fruits

apple, mango, banana, orange, cherry, coconut, strawberry, etc.

Vegetables

pea, corn, onion, carrot, potato, tomato, spinach, pumpkin, etc.

Household Items

cup, bed, lamp, chair, table, mirror, bottle, bucket, pillow, etc.

Kitchen Items

plate, spoon, fork, kettle, toaster, blender, etc.

Furniture

chair, table, sofa, cabinet, drawer, cupboard, etc.

School Items

pen, book, ruler, pencil, eraser, notebook, backpack, etc.

Clothing

hat, shoe, shirt, socks, jacket, sweater, trousers, etc.

Vehicles

car, bus, van, train, bicycle, scooter, airplane, tractor, etc.

Nature

sun, moon, cloud, rain, river, mountain, forest, rainbow, etc.

Flowers and Plants

rose, lily, grass, tree, flower, cactus, etc.

Shapes

oval, star, circle, square, triangle, rectangle, etc.

Symbols

heart, plus, arrow, cross, etc.

Toys

ball, doll, blocks, puzzle, robot, balloon, etc.

Musical Instruments

drum, piano, guitar, violin, trumpet, etc.

Sports

ball, tennis, soccer, cricket, hockey, etc.

Tools

hammer, brush, shovel, wrench, ladder, etc.

Everyday Objects

phone, clock, camera, wallet, key, umbrella, etc.

Use categories to ensure vocabulary variety.

Do not make one stage consist primarily of one category.

Mix categories throughout each stage.

4. Game Screen

After selecting a stage, start the spelling game.

The screen should contain:

Back button

Stage name

Progress indicator

Large centered image

Audio/replay button

Large letter input boxes

Feedback area

Example:

← Back                 Stage 2
                       17 / 100


                       [ IMAGE ]


                       🔊


                  [ _ ][ _ ][ _ ][ _ ]


                     Hear Again


The written word must NOT appear anywhere on this screen before the answer is revealed.

5. Start of Each Word

When a new word begins:

Select the next word.

Display its image prominently.

Automatically pronounce the word using browser Text-to-Speech.

Create the correct number of input boxes based on the word length.

Focus the first input box.

Example:

If the target word is "GUITAR":

Show:

             [ guitar image ]

                    🔊

        [ _ ] [ _ ] [ _ ] [ _ ] [ _ ] [ _ ]

                 Hear Again


Do NOT display:

Guitar

G U I T A R

Any letters from the answer

Any spelling hints

The player must determine the spelling independently.

6. Input Boxes

The number of boxes must automatically match the target word length.

Examples:

3 letters:

[ _ ] [ _ ] [ _ ]

4 letters:

[ _ ] [ _ ] [ _ ] [ _ ]

7 letters:

[ _ ] [ _ ] [ _ ] [ _ ] [ _ ] [ _ ] [ _ ]

Requirements:

Large boxes

Child-friendly design

Automatically move focus to the next box

Only alphabetic characters

Convert lowercase to uppercase

Support keyboard input

Support mobile/tablet keyboards

Backspace should work naturally

Do not allow more characters than the word length

Validate automatically once all boxes are filled

Do not show partial correctness while the player is typing.

For example, do NOT turn individual boxes green/red.

Only evaluate the complete spelling.

7. Correct Answer

If the entered spelling is correct:

Show:

GOOD! 🎉

Then reveal the spelling.

For example:

              🎉 GOOD!

              G U I T A R

                 Guitar

                   🔊


The correct spelling should only become visible AFTER the user has successfully entered it.

Pronounce the word again.

Then move to the next word.

A short positive animation is encouraged.

For example:

Letters appear one at a time.

Small celebration animation.

Star animation.

Keep it fast and not distracting.

8. Wrong Answer — Attempts 1 and 2

If the spelling is incorrect:

Show:

WRONG ❌

Then:

Clear every input box.

Reset focus to the first box.

Pronounce the target word again.

Allow another attempt.

Do NOT reveal:

Correct spelling

Correct letters

Number of correct letters

Position of incorrect letters

The child should try again using the image and pronunciation.

Example:

             ❌ WRONG

              [ image ]

                 🔊

        [ _ ] [ _ ] [ _ ] [ _ ]

             Try Again


After clearing the boxes, automatically pronounce the word again.

9. Third Unsuccessful Attempt

Each word has a maximum of 3 unsuccessful attempts.

If the third attempt is also incorrect:

Show:

WRONG ❌

Then reveal the correct spelling.

Example:

             ❌ WRONG

                 🐢

            T U R T L E

               Turtle

                 🔊


Pronounce the correct word again.

Then automatically continue to the next word.

The third failed attempt should NOT allow another retry.

Move to the next word.

10. Important Attempt Logic

For every word:

attemptCount = 0

User submits answer

If correct:
    Show GOOD
    Reveal correct spelling
    Pronounce word
    Move to next word

If incorrect:
    attemptCount++

    If attemptCount < 3:
        Show WRONG
        Clear input
        Pronounce word again
        Allow retry

    If attemptCount === 3:
        Show WRONG
        Reveal correct spelling
        Pronounce word
        Move to next word


Reset attemptCount to 0 whenever a new word starts.

11. Progress

Each stage contains 100 words.

Display progress clearly:

17 / 100


or:

Word 17 of 100


Also show a simple progress bar.

Do not overwhelm the screen with statistics.

12. Stage Completion

After all 100 words have been attempted:

Show:

STAGE COMPLETE! 🎉

Example:

        🎉 STAGE COMPLETE!

             100 / 100

              ⭐⭐⭐⭐⭐

        Great spelling practice!

        [ PLAY AGAIN ]

        [ NEXT STAGE ]


If the user completes Stage 5:

Show:

[ PLAY AGAIN ]

[ BACK TO STAGES ]

13. Scoring

Track attempts for each word.

Use a simple star system:

Correct on first attempt → 3 stars

Correct on second attempt → 2 stars

Correct on third attempt → 1 star

Failed all 3 attempts → 0 stars

The score should encourage learning, not punish the child.

Show the final stage score after all 100 words.

14. Word Selection

Each stage contains 100 words.

When starting a stage:

Randomize the 100 words.

Do not repeat a word during that session.

Each word appears exactly once during the session.

Do not randomly pick a word that could cause duplicates.

Create a shuffled list at the beginning of the stage and progress through that list.

15. Word Database

Keep the vocabulary completely data-driven.

Use a structure similar to:

{
  id: "unique-id",
  word: "guitar",
  stage: 4,
  category: "musical-instrument",
  image: "/assets/words/guitar.png"
}


The game must derive the following automatically from the word:

Number of input boxes

Correct answer

Image

Category

Stage

Do not hardcode individual word behavior into the game component.

16. Image Requirements

Every word must have an image.

Images should be:

Clear

Simple

Child-friendly

Easy to identify

Visually consistent

The image should make it possible for a child to understand what the target word represents.

Prefer illustrations or clean educational images rather than visually confusing photographs.

Keep image URLs/assets centralized in the word dataset.

Design the application so local images can be used later.

If an image fails to load, show a graceful fallback rather than breaking the game.

17. Audio

Use the browser's Web Speech API / speech synthesis for V1.

When a word starts:

Automatically pronounce it.

Provide a:

🔊 Hear Again

button.

After a wrong attempt:

Automatically pronounce it again.

After a correct answer:

Pronounce it again.

After the third failed attempt:

Reveal the spelling and pronounce it again.

Create the audio functionality as a reusable service/helper so it can later be replaced with recorded audio if desired.

18. Critical UI Rule

The written answer must NEVER be visible before the player completes the spelling attempt.

For example, if the target is:

GUITAR

Before answering, the UI may show:

🎸

🔊

[ _ ] [ _ ] [ _ ] [ _ ] [ _ ] [ _ ]


It must NOT show:

GUITAR


or:

G _ I _ A _


or:

G U _ T _ R


or any other spelling hint.

Only after:

Correct answer, OR

Third unsuccessful attempt

may the correct spelling be displayed.

19. Design

Make the application feel like a polished children's educational game.

Use:

Large rounded cards

Large typography

Large input boxes

Friendly illustrations

Smooth transitions

Simple animations

Clear feedback

Large touch targets

Plenty of whitespace

Avoid:

Dense layouts

Small buttons

Complicated menus

Excessive text

Complex settings

Dashboard-like UI

The main image and spelling boxes should dominate the game screen.

Make it responsive for:

Desktop

Tablet

Mobile

Tablet should be a particularly good experience.

20. Accessibility

Include:

Accessible labels

Keyboard navigation

Visible focus states

Good color contrast

Alt text for images

Accessible audio/replay button

Text-based GOOD/WRONG feedback

Do not rely solely on green/red colors for feedback.

21. V1 Scope

Keep V1 deliberately simple.

Do NOT add:

Authentication

User accounts

Database

Backend

Multiplayer

Ads

Payments

Parent dashboard

Complex analytics

All word data can initially be stored locally.

The primary goal is to make the spelling game interaction excellent.

22. V1 Acceptance Criteria

The app is complete when:

User can select one of 5 stages.

Each stage contains exactly 100 unique words.

There are 500 unique words across all stages.

Stage 1 contains only 3-letter words.

Stage 2 contains only 4-letter words.

Stage 3 contains only 5-letter words.

Stage 4 contains only 6-letter words.

Stage 5 contains only 7-letter words.

Words cover many categories including animals, birds, fruits, vegetables, household items, kitchen items, furniture, school items, clothing, vehicles, nature, shapes, toys, tools, musical instruments, sports and everyday objects.

Every word has an image.

A new word starts by showing only the image.

The application automatically pronounces the word.

The written word is NOT displayed initially.

Input boxes match the word length.

User can enter the spelling.

Correct spelling produces GOOD feedback.

Correct spelling is revealed only after a successful answer.

Incorrect spelling produces WRONG feedback.

First and second incorrect attempts clear the boxes and replay the pronunciation.

The third incorrect attempt reveals the correct spelling.

After the third unsuccessful attempt, the app pronounces the correct word and automatically moves to the next word.

A word can never be attempted more than 3 times.

Words are shuffled within each stage.

No word repeats during a stage session.

Progress out of 100 is displayed.

Stage completion is shown after all 100 words.

The UI is responsive and tablet-friendly.

The word database is data-driven and easy to expand.

Prioritize the core game loop and UX quality over adding extra features.

The essential experience should remain:

IMAGE → PRONOUNCE → USER SPELLS → GOOD / WRONG → RETRY OR REVEAL → NEXT WORD

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/24269fb1-1b31-4223-8139-32ecc162914e).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
