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
- to destroy all the containers that are not active
```
docker system prune -a

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


## Move to prod
We will use nignx for example of multi step build process- essentially build two images, one for **Build Phase** and one for **Run Phase**. The first phase to generate the build contents ready for production and the second phase is to copy the `build` folder and place it in nignx
- Multi step build process. Refer to Dockerfile
- then build and start the container
```
docker build . # by default, use Dockerfile
docker run -p 8080:80 <id> # map nginx default port 80 to local 8080
```
- Great! nginx is 100% production appropriate!


## Onto Travis
- go to travis site and activate your repo!
- get the unittest run on Travis
- refer to .travis.yml
- Note! there is a problem with npm run test. After running all the tests it goes into watch mode and it just hangs. The was fixed by setting the value to "test": "CI=true react-scripts test" in packages.json

## Deploy to AWS!
We are going to use Elastic Beanstalk
- Log into AWS and search for Elastic Beanstalk. Follow the steps to:
- create new application -> create environment -> web server environment -> base configuration -> platform -> Docker -> create environment
  - Elastic Beanstalk uses a loadbalancer and creates virtual machines(instances) as needed. Each virtual machine contains a docker container that has your app.
- now we will configure travis CI to deploy to AWS
- refer to the .travis.yml file for deploy
- note you need to get the API key by going into AWS, use IAM(identification and Access Management)
  - go into `user` tab
  - create new user
  - select programaic access
  - go to next, and select "Attach existing policies directly"
  - search for beanstalk and select the one that says "provide full access". This will grant access for travis to deploy service to AWS
 - now, once you have your API key and secret key, go to the travis site and your service. 
  - click on "more options"
  - go to "settings"
  - find env variables"
    - set env variables for your API key and Secret Key
  - now you will be able to use those env variables in your travis file
- Cool! At the point we should be good to go. Once you push the changes to the master it should be deployed into AWS Elastic Beanstalk

## Build Multi-Container Application
First, we are building an application that's quite complex, the app will have:
  - A website(react app) that allows user to enter fibonacci index
  - A server API that takes the index and send to two places
    - redis 
	- postgres db
Refer to the repo ```coplex_example```
- we will create a Dockerfile.dev (for development) for each one - client, server, worker
- notice that for server and worker we will use "nodeomn" whcih has the commandline tool to automatically reload your entire project where there is a change to your source code. We will set up the volume (to reference your local files) so nodemon will be able to detect the changes. In react this is already taken care of.
### Workflow design
We are going to have a lof of containers! Here we build the images for react app, express server, worker ourselves. Essentially all these 5 commponents are individual containers.
```
Input data in web broswer
--> Nginx 
   --> React Server
         |
         V
   --> Express Server
        --> Redis <---> Worker
        
        --> Prostgres
```
- we will make a docker-compose file to make this happen easily! Refer to the repo.
- Then, for the Nginx, we will have a config file for the purpose of routing, i.e, 
  - if coming to '/' send to client upstream
  - if coming to '/api' send to server upstream
- create a dockerfile for nginx to hookup the default.conf
### Travis to build and push to docker hub
- long story short, we will set up the travis CI to build these images
- we will use trais to push these images to docker hub repositories 
- then move on to AWS elastic beanstalk

### Onto AWS
In order for AWS Elasticbean to run multiple containers, we will create a `Dockerrun.aws.json` file. The purpose is similiar to the `docker-compose.yml` in that we give the instructions what we want to run. Unlike the `docker-compos.yml` though, we don't have to build those images because we already have them available in docker hub.
- once the Dockerrun.aws.json is done, go to AWS and create a new applicaiton.
- In the basic configuration -> Preconfigured platform -> select Muti-container Docker and then create environment

### AWS deployment architecture
Now, for AWS deployment, we will change the architecture (a lot). Essentially, we will have the four services(nginx, client, server and worker) hosted in Elastic Beanstalk as the `dockerrun.aws.json` describes, and, as best practice, we will host host the Redis using `AWS Elastic Cache`- pro grade Redis setting,  and Postgres in `AWS Relational Database Service(RDS)`.
- go ahead and create a app for:
  - EB
    - make sure you select multi docker containers
  - EC
    - selct Redis
	  - for the node type, make sure to select cache.t2.micro (cheapest)
	  - make replica 0

  - RDS for postgres
    - select postgres
	- in Settings:
	  - make sure you record the username, password and db name which you will use in Travis

- by default these services don't talk to each other, so we will have to wire them out first. We have to do the following
  - VPC(virtual private cloud) is your own network to host your instances. For each available zone, there is a default VPC that's given to you. We will leverage VPC to connect our services.
  - Security Group (Firewall Rules) for your VPC. We will set up the security group to allow any other AWS services that has this same security group -> for Elastic Beanstalk, Elastic Cache, and RDS.
    - for each service, find the Modify which you can change the VPC security group
      For EB, go to Configuration -> instances -> modify
- Set the environment variables for EB (refer to docker-compose file to see all the env variables). Go to Configuration -> Modify Software
  - for REDIS_HOST and POSTGRESHOST, go to EC and RDS and retrieve the primary endpoint. For other postgres variables (such as db name), refer to the memo. 
- Go to IAM to create new API key and Secret key
- Update the `.travis.yml` file to include the AWD deployment
- now push the change to github and if everything goes well it will be deployed into AWS with multi containers. Congrats!

## Kubernetes
Finally, Kubernetes. Basically, in order to scale up our application, for example the previous fib example, we might only need to increase the "worker", as opposed to the entire container that has client, server, nginx (which EB offers). Kubernete will allow you to make this happen.
- Kubernete cluster: a master with multiple nodes(machines). Each node can run many different containers. So imagine we have one node that runs the container that has nginx, client, server, and many other nodes that run worker image
### Installation
- install kubectl
```
brew install kubectl
which kubectl
```
- then make sure you have virtualbox
- install minikube
```
brew cask install minikube
```
- then run
```
minikube start # will start the virtualbox. This creates a virtual machine to run your "Node"
minikube status # to make sure everything is set up and correctly configured
kubectl cluster-info # make sure it's working
```
### Configuration
- To use Kubernete, we basically need two configuration files:
  - config file describing the containers we want. In Kubernete's world, we are not making a container. We are making an "object". The config files will produce the objects. There are several kinds of objects: Pod, Service, StatefulSet, ReplicaController. Pod is used to run a container. Service is to set up networking etc.
#### Pod
- Runs one or more closely related containers
- In the world of Kubernetes, there is no such thing as running one single container. The smallest thing you can create is is a "Pod" which has container(s). A Pod hosts a group of containers which serve similar purpose.
#### Service
- Sets up networking in a Kubernetes Cluster
  - ClusterIP: expose a set of pods to other objects, such as Ingress,  in cluster (more restrict than NodePort, only objects in the cluster can, not the outside world!)
  - NodePort: expose a set of pods to the outside world (only for dev purpose)
  - LoadBalancer
  - Ingress: responsible to connect to the node from the outside world 

#### Feed the config into Kubenetes cluster
```bash
# kubectl apply -f <filepath>
kubectl apply -f client-pod.yaml
kubectl apply -f client-node-port.yaml

# to check if it's running, do
kubectl get pods
# to delete the object we created via the config file
kubectl delete -f <config file>
```
- to visit the ports inside the vm k8 cluster that minikube created, 
```
# get the ports
minikube ip # will get something like 192.168.99.100
```
  - then paste this into your broswer such that:
    - 192.168.99.100:31515
- get detailed info about an object
```
kubectl describe <object type> <object name>
# you can also do just the object type, such as
kebectl describe pods
```
##/# Other Kubernetes objects
One gotcha here, `Pod` does not allow you to change things other than image.So you want to change something like a port, it will be prohibited. In reality pod is rarely used in production. 
#### Deployment
Deployment is an object that maintains a set of identical pods, ensuring that they have the correct config amd that the right number exists. This is thereal object that we create in production environment.
- refer to the configuration file
- once you run "kubectl apply -f <config file for deloyment>" you should be able to access the localhost:31515 to see the website up
- we can try to rebuild the image in docker hub and make sure kubernetes picks it up:
  - to push new image to docker hub:
  ```
  docker build -t hhsu15/multi-client .  # build the image after you made chagnes to the source file
  docker push hhsu15/multi-client  # push to docker hub
  ```
  - Now, we will have to tag the image with a version number and we push to docker hub and then run a command to explicitly reach out to that version of image (imperative approach). So here we go:
  ```
  docker build -t hhsu15/multi-client:v5 .
  docker push hhsu15/multi-client:v5 
  
  # here is the command to update that image inside of kubernetes
  # kubectl set image <object type>/<object name> <container name>=<new image to use>
  # for example:
  kubectl set image deployment/client-deployment client=hhsu15/multi-client:v5
  ```

  #### Access docker containers inside of VM
  - if you use minikube to start the kubernetes cluster, in order to see all the containers in the VM, 
  ```
  eval $(minikube docker-env)
  docker ps  # now you should see the containers
  ```
  - though if you use docker-for-desktop, automatically you have access to the containers in the vm. Just run `docker ps` you will see the them
#### In to the container to poke around
Normally, you can do this to go into the container
```
docker exec -it <container id> sh
# ls
```
Use kubectl, you can do the same thing:
```
kubectl get pods  # to get the pod id
kubectl logs <pod id>  # to see logs
kubectl exec -it <pod id> sh # to start the shell
```

## Kubernetes for multi containers 
Baiscally like this:
  Node -> Ingress Service -> Deployments(ClusterIP service) -> Pods -> containers
  - For everyone of this we will have config files
  - the shortcut to apply all the config files at the same time
  ```
  # apply the entire fold
  kubectl apply -f k8s
  ```
 - refer to the complex project, basically for each of the component there is a `deployment` config file and `cluster-ip`(service) config file 
### Use Volume with Database
In the case the database (such as postgres) instance gets restarted, the data inside of that container/pod/files system will get lost. Therefore, we will use `volume` to have the data saved outside of the pod/deployment.
#### PVC (Persistent volume claim)
- Volume
  -  the word "volume" in generic container term means a way to allow a container to access a filesystem outside itself. However, for Kubernetes, the word "Volume" is a type of object that allows a contanier to store data at the pod level - so if a container dies another container can still access it. But if the pod dies the volume is lost too - not so ideal.
- Persistent Volume
  - persistent volume lives outside of the deployment which sticks around even if pod dies
- Persistent Volume Claim
  - advertisment for possible database options. PVC is not an actual Kubernetes object but it's a way to tell kubernetes what you want and let kebernetes figure out how to do it. Under the hood, kubernetes is going to get a chunk of your harddrive and allocate the data to it
  - however, when you are ready to deploy to the cloud provider, there is a ton of optios for kubernetes to choose the [storage classes](https://kubernetes.io/docs/concepts/storage/storage-classes/)
#### Apply Persistent Volume Claim
So in our example we put together the config file for PVC. You can run 
```
kubectl get pv  # to see running pv and you can see if it's created by pvc
```
## Set Env variables in Kubernetes
Basically, set those env vairables in those deployment config files. However, for password or any secret keys, we will use another type of kubernetes object - "Secret". And we will apply it via imperative approach, as opposed to putting it in a config file...
- Here is the command:
```
kubectl create secret generic <secret name> --from-literal key=value
kubectl create secret generic pgpassword --from-literal PGPASSWORD=12345
kubectl get secrets
```
## Ingress
Ingress is a type of Service whose purpose is to expose a set of services to the outside world
- Do not confuse with Nginx-Ingress and Kubernetes Ingress - they are different projects!!
We are going to use Niginx-Ingress. Here is the [documentation](github.com/kubernetes/ingress-nginx)
- config -> Ingress Crontroler -> to the ClusterIP services
- we will visist the Nginx-Ingress project github website and go to the documentation to set up, essentially:
```
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/master/deploy/static/mandatory.yaml

minikube addons enable ingress
```
- create the config file and apply the routing rules - this will be same as what we did last time, specifically,
  - Look at the path of the request
    - if request has a path of '/' -> client
	- if request has a path of '/api' -> server
- again, make sure you don't have typos...For the config files to be able to find the Cluster IP services, make sure you type the name correctly..It's so hard to debug!!!

## Kubernete Dashboard
Of course there is a dashboard.
```
minikube dashboard
```

## Google Cloud production deployment
Kubernetes was created by Google
### Get started
- Go to `console.cloud.google.com`
- Create a new project
- Enable billing - (I am using the free credit now!)
- Under `Compute` session and select Kubernetes Engine
- Click `create cluster`
#### Set up travis yaml file
- refer to complex example project
- the travis file will read some credentials from a json file, and we will make that json file encrypted by using Travis CLI. In .travis.yaml, add code to unencrypt the json file and load it into GCloud SDK.
  - first step is go to google cloud console -> IAM & admin -> service account -> create service account
  - role -> Kubernetes Engine Admin
  - create key -> JSON (you will download a json file that has all the credentais. do not expose this file to the outside world)
  - Now, we need to install travis cli. In fact we only need this once, so we can try just using docker to install the image that has Ruby (cause you need Ruby to be able to install it) and instakl travis cli and run the command in the container. Once done. we can throw away that contanier. Sounds fun? Let's get to it!
   ```
   docker run -it -v $(pwd):/app ruby:2.3 sh  # run the image called ruby, excute bash command, use volume to swap the /app directory to local current directoty so we can access the json file in the container
   gem install travis --no-rod --no-ri  # gem is package manager for ruby
   gem install travis
   travis login
   # cooy json file into the volumed directory so we can use it in the container
   travis encrypt-file service-account.json -r hhsu15/complex_example
   ```
   - after you do the travis-encrypt file it will give you a command which you need to copy and paste into the `.travis.yaml`
   - also it will create a file, e.g., service-account.json.enc
   - then, DELETE THE ORIGINAL JSON FILE!
   - the encrpted file will then be ok to push to the github
