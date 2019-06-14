# docker
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
- now you started redis server, let's try redis cli. Notice, this is effectively starting another program within the container. The command you need is:
```
docker exec -it <container id> <command>  # -it allows you to provide input to the container
```
- so the actual command will be like this:
```
docker exec -it 7d09ca9a4daf redis-cli
```
now you can use redis!!

### Go into the container and operate on linux
- this will allow you to operate the linux in the container
```
docker exec -it <container id> sh
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
```
#### you can also mannally create your custom iamge based off of yyour existing container
- though you probally rarely have to do this, it is possible
```
# take your container id and do
docker commit -c 'CMD["redis-server"]' <container id>
```
- this will generate another hash id for the image. You can then docker run <new id> to start this container
