# Developing Kibana Plugins with a Docker Development Environment

## Templates

There are two files that you will need to create that may have specific content in them for your local environment

### `.env.template` -> `.env`

- Any environment variables that you want to supply to the Docker image

### `configure.sh.template` -> `configure.sh`

- Any commands that you would need to run before Kibana builds in the image, such as setting proxies, etc.

## Develop

At this point, you are ready to build the development environment:

    docker-compose up

This will pull all the docker dependencies, and the kibana source code from GitHub, and build the `kibana-dev`
image that can be used locally to develop the plugins.  You can create a new plugin under the root folder of
this repository in a similar structure to the other plugins.

Once this completes, you will have an Elasticsearch and Kibana container running, and you can remote into the
Kibana container from this folder:

    docker-compose exec kibana bash

Once inside the container, you can run kibana with the following:

    ./start-dev.sh

This will download all dependencies, build all the dependent libraries, and run Kibana in development mode
with the new plugins available.
