FROM node:20
RUN apt-get update && apt-get install -y --no-install-recommends openssh-client
RUN apt-get install screen -y
RUN mkdir -p /root/.ssh
COPY personal-site-docker-github /root/.ssh/personal-site-docker-github
RUN chmod 400 /root/.ssh/personal-site-docker-github
COPY githubhostkeys.txt /root/.ssh/known_hosts
WORKDIR /usr/app

RUN GIT_SSH_COMMAND="ssh -i /root/.ssh/personal-site-docker-github" git clone git@github.com:posisme/personalwebsite.git /usr/app
RUN git checkout main
RUN ls /usr/app


EXPOSE 3000
EXPOSE 6125


RUN chmod +x /usr/app/startupscript.sh
 
CMD /usr/app/startupscript.sh && tail -f /dev/null
