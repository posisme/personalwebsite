FROM node:20
RUN apt-get update && apt-get install -y --no-install-recommends openssh-client nginx screen openssh-server

# RUN apt-get install screen -y
RUN mkdir -p /root/.ssh
COPY personal-site-docker-github /root/.ssh/personal-site-docker-github
COPY personal-site-docker-github.pub /root/.ssh/authorized_keys

RUN chmod 400 /root/.ssh/personal-site-docker-github
RUN chmod 600 /root/.ssh/authorized_keys
RUN chown root:root /root/.ssh /root/.ssh/authorized_keys

COPY githubhostkeys.txt /root/.ssh/known_hosts
WORKDIR /usr/app

RUN GIT_SSH_COMMAND="ssh -i /root/.ssh/personal-site-docker-github" git clone git@github.com:posisme/personalwebsite.git /usr/app
RUN git checkout feature/pick-person-interface
RUN cp nginx.conf /etc/nginx/sites-available/reverse-proxy
RUN ls /usr/app

EXPOSE 80
EXPOSE 22
# EXPOSE 3000
# EXPOSE 6125


RUN chmod +x /usr/app/startupscript.sh
 
CMD ["/bin/bash", "-c", "/usr/app/startupscript.sh && tail -f /dev/null"]