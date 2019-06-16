#Specify a base image
FROM node:alpine

# Specify your work directory
WORKDIR /usr/app

# Copy everything from current directory into the current directory of the container
# Here is some tricks, we copy the packages first and then run npm install
# before copying all the files into the work directory
# by doing so, everytime we make a change to the source code (as long as we are not changing the packages needed), we will not have to reinstall the package and npm again
COPY ./package.json ./
RUN npm install
COPY ./ ./

# Install dependencies
RUN npm install

# Default command
CMD ["npm", "start"]
