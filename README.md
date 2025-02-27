# CodeFiddle

Ever used sites like CodeSandbox, or codedamn? Wondered how they've built their code editors to be so customisable while integrating personalised features like open collaboration? This project is a take on how a site like this could be built.

The basic layout provides a VS Code experience, wherein a user can navigate between his available files from the file manager. The user also has a shell available that is hooked to a container that has been spun up for him, thus allowing for a full developer workflow, similar to the way you would work offline.

Integrated with this is also an iframe providing realtime feedback to changes you may make in your project. The various components in this project, like the Code Editor, and the Browser Previews are freely resizable, so you can set them to a size that provides the most optimal working environment for you.

## Authors

- [@rajatmaheshwari2512](https://www.github.com/rajatmaheshwari2512)

## Contributing

Contributions are always welcome!

- In case you find a bug, please open an issue, the title of which must begin with 'BUG'.
- Detail the steps to reproduce the bug, and the expected outcome as well.
- In case you're fixing a bug, please open a PR, and detail the bug that you have fixed.
- To request a feature, please open an issue, the title of which must begin with 'FEATURE REQUEST'.

## Features

- Built in React, Node, Express, and Docker.
- Uses websockets to transmit changes and other events to and from the client to the server.
- Uses xterm.js to provide a shell to the Docker container.
- Uses Monaco editor to provide a VS Code like experience while working in the browser.
- Recursively hydrates the file structure so as to handle files and folders at any depth, i.e., nested structure.
- Uses zustand as the global state management library.
- Uses icon packs to help identify the types of files in the project.

## Run Locally

Note: The project was built in a Linux based environment, and is untested on Windows, and macOS

Clone the project

```bash
git clone https://github.com/rajatmaheshwari2512/CodeFiddle
```

Switch to the frontend and install dependencies

```
cd frontend
npm install
```

Switch to the backend and install dependencies

```
cd backend
npm install
```

Build the docker image

```
docker build -t oyster_base .
```

In the frontend, create a .env file and add the following

```
VITE_BACKEND_URL=http://localhost:3000
```

In the backend, create a .env file and add the following

```
DOCKER_USERNAME=your_dockerhub_username
DOCKER_PASSWORD=your_dockerhub_password
```

Run the frontend and backend

```
cd frontend
npm run dev
cd backend
npm start
```

## Screenshots

![The Editor Window](https://i.imgur.com/Mghmoeh.png)

![Resized Browser](https://i.imgur.com/vmn8gkh.png)
