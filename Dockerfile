FROM node:latest

MAINTAINER scalpo "hardusvdberg@gmail.com"

#RUN apt-get update \
#    && apt-get install -y git-core node-minimatch

#containerised flag for server
#ENV vas_osName "Docker"

WORKDIR /root/ifektri/

RUN curl https://repl.it/@scalpo/ifektri.zip -o ifektri.zip
RUN unzip ifektri.zip -d .
RUN rm -f ifektri.zip

#RUN npm install
#RUN npm run setup

EXPOSE 5000

CMD ["node", "console.log('hi')"] 
#"index.js"]