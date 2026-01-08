FROM node:23
RUN apt-get update && apt-get install -y --no-install-recommends openssh-client nginx screen openssh-server

# RUN apt-get install screen -y
RUN mkdir -p /root/.ssh
COPY personal-site-docker-github /root/.ssh/personal-site-docker-github
RUN ssh-keygen -y -f /root/.ssh/personal-site-docker-github > /root/.ssh/authorized_keys

RUN chmod 400 /root/.ssh/personal-site-docker-github
RUN chmod 600 /root/.ssh/authorized_keys
RUN chown root:root /root/.ssh /root/.ssh/authorized_keys

COPY githubhostkeys.txt /root/.ssh/known_hosts
WORKDIR /usr/app

RUN GIT_SSH_COMMAND="ssh -i /root/.ssh/personal-site-docker-github" git clone git@github.com:posisme/personalwebsite.git /usr/app
RUN git checkout main
RUN mkdir /usr/app/client/src/jsonfiles
RUN echo '{"st":"","et":"","list":{}}' > /usr/app/client/src/jsonfiles/grocerylist.json

# EXPOSE 80
#EXPOSE 22
EXPOSE 3000
EXPOSE 6125


RUN chmod +x /usr/app/startupscript.sh
 
CMD ["/bin/bash", "-c", "/usr/app/startupscript.sh && tail -f /dev/null"]