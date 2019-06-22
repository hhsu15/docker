# docke/
## Set up docker
- go to **docker.com** and download docker
- verify installation
```
docker version
```

## Get started
- hello world 
```
docker run hello-world  
# this is going to say can't find the image locally for hello-world
# and will go out to docker hub to find it
# it will download that image and cache it to the image cache in your PC
# now it will create a container for hello-world
```
By install docker, you actually install linux operating system which allows namespacing and control group to sector out the resources for a container.

- supply override command
- use busybox image
```
docker run busybox echo "hi there" # will print hi there
docker run busybox ls # will list the directories for the program busy box which has ls command executable
```
- show running containers
```
# to test, run docker 
docker run busybox ping google.com
docker ps
# to show all containers that have been created
docker ps --all
```

- in practice, docker run = docker create + docker start
```
docker create hello-world # will return an id
docker start -a {id} # will start the container. -a means attach. It will output to the console. If you don't put -a, it will only print the id to the console but still runing in the background
```
- to destroy all the containers
```
docker system prune

```
- to see logs emmitted from a container
```
docker logs {id}
```
-stop running the program
```
docker stop {id} # this will allow the container to properly stop
docker kill {id} # force docker to stop
```

### Interact with Redis using docker
- run redis using docker
```
docker run redis
```
- now you started redis server, let's try redis cli. Notice, this is effectively starting another program within the running container. The command you need is:
```
docker exec -it <container id> <command>  # -it allows you to provide input to the running container
```
- so the actual command will be like this:
```
docker exec -it 7d09ca9a4daf redis-cli
```
now you can use redis!!

### Go into the container and operate on linux
- this will allow you to operate the linux in the container
```
docker exec -it <container id> sh  # notice it has to be id. It won't work for a image tag
```
- sh is a commen shell, like bash, which allows you to execute commands.
- run control + d to get out of the container. Or you can type exit
you can also start your container with `-it` and poke into that container using `sh` directly. if you are not running any program. Mostly you would just use docker exec -it <id> sh though.
```
docker run -it busybox sh
```
## Create our own image
- create a docker file to:
  - specify a base image
  - run some commands to install additional programs
  - specify a command to run on container startup
- see example in redis-image for Dockerfile
- once the file is ready, to build the image, run:
```
docker build . # the last one is the path to the director
```
- this will generate an id, take that id and run
```
docker run <id>  # will start the container
```
### Assgin tag for your image
- convention for you tag
```
docker build -t <dockerid>/<imagename>:<version> .
docker run <dockerid>/<imagename>
```
#### you can also mannally create your custom iamge based off of yyour existing container
- though you probally rarely have to do this, it is possible
```
# take your container id and do
docker commit -c 'CMD["redis-server"]' <container id>
```
- this will generate another hash id for the image. You can then docker run <new id> to start this container


## Create a small web and run on docker
- To find the base image you need, go on ```hub.docker.com```
- for the example of ```simpleweb```, we use the ```node``` image
- refer to ```simpleweb``` Dockerfile to see how image is created
- run below to build an image and start your container
```
docker build -t hhsu15/smallweb .
# to be able to direct the port from the container to your local machine. Below we are saying redirect the request to local 5000 to 8080 in the container
docker run -p 5000:8080 hhsu15/smallweb 
```

## Create a webserver to track traffic
In this execise, we will create two containers, one for node.js webserver and another one using redis (redis is like an in memory database)
- see ```visits``` for example code but basically two things here:
  - create an image for your node js program which uses redis, run this in container
  - create another container for redis. This is simply ```docker run redis```
  - now the gotcha here is these two containers don't talk to each other so you need to create the network. To do so, we will use ```docker compose```
### docker compose
Basically a wrapper of docker cli to make the commands easier to do more complex things
- this is going to be done via a ```docker-compose.yml```. Refer to the file
- by specifying the services in the yml file, docker will create a network for those services 
- and those services can be refered by the name (e.g., redis-sever) as the host
- the commands to run docker-compose.yml file will be:
```
docker-compose up  # to start the docker compose
docker-compose up --build  # if you make changes to the code you will need to run this to rebuild
```
- more on docker compose
```
# run docker-compose in the background
docker-compose up -d

# stop containers
docker-compose down
```
- Notice that in the docker-compose.yml, you can use the `restart` key to specify in what situation you want to restart your server.
- same as `docker ps`, you can use
```
docker-compose ps

```

## Create a production grade workflow
- In the example we use react to create an app, put
a `Dockerfile.dev` for development build. 
```
docker build -t hhsu15/frontend -f Dockerfile.dev .
docker run -p 3000:3000 hhsu15/frontend
```
## Use docker volumes to create reference outside of container
You can create a reference for files outside of a container when running a container. This is helpful when you want to reflect the changes in the code (say if you use react) to the container without having to rebuild.
- the syntax looks like this:
```
docker run -p 3000:3000 -v /app/node_modules -v $(pwd):/app ce17d837210e
```
The second volume switch (-v) says map everything in current local directory to /app in the container, while the first volumn switch says use the /app/node_modules in the containerrather than mapping it to anything - since we deleted the node_modules in our local because it was already built in the container 
- this can also be achieved by using docker-compose (preferred). Refer to `docker-compose.yml` in `frontend` 
- To run test in the container, essentially you are starting the container and overriding the commend here:
```
docker build -t hhsu15/frontend -f Dockerfile.dev .
docker run -it hhsu15/frontend npm run test # provide the override command (use -it so you can see the I/O inside of the container)
```
- now, in order for the container to be able to realtime detect the changes without us rebuilding the image, there are two options:
  - go into the running container built via docker-compose and run the command, this way, the files are all being referenced to your local files
```
  docker exec -it <container id> npm run test
```
  - use docker-compose. Basically create two services/containers, one for the webserver and one for the test. refer to docker-compose.yml

```
## Move to prod
We will use nignx for example of multi step build process- essentially build two images, one for **Build Phase** and one for **Run Phase**. The first phase to generate the build contents ready for pproduction and the second phase is to copy the `build` folder and place it in nignx
- Multi step build process. Refer to Dockerfile
- then build and start the container
```
docker build . # by default, use Dockerfile
docker run -p 8080:80 <id> # map nginx default port 80 to local 8080
```
- Great! nginx is 100% production appropriate!


