# reelr

## What is this?

reelr is a lightweight, dynamic interface for a movie server. 

## Wow, that's great. How do I use this?

There are a few steps before we can start installing reelr.

1. Clone the project

    ```
    git clone https://github.com/elklein96/reelr
    git clone https://github.com/elklein96/reelr-api
    ```

2. Install some dependencies

    ```
    cd reelr
    npm i
    cd ../reelr-api
    npm i
    ```

3. A note on local development:

    - `npm run start` transpiles the source to ES2015 and spins up an Express server
    - `npm run lint` runs ESLint
    - `npm run test` runs Mocha

And that's it! Have fun!
