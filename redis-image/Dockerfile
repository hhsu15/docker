# Use an existing docker image as a base 
# btw alpine is an operating system with apk preinstalled
# and this is an image available from docker hub
FROM alpine 

# Download and install a dependency
RUN apk add --update redis
RUN apk add --update gcc

# Tell the image what to do when it starts as a container
CMD ["redis-server"]
