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

