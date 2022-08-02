FROM node:12.13.0

RUN apt-get update
RUN apt-get install -y bash git openssh-client \
  python-pip python-dev build-essential
RUN apt-get upgrade -y openssh-client
RUN pip install --upgrade pip
RUN pip install --upgrade virtualenv

# Install awscli
RUN pip install awscli --upgrade --user
RUN pip install s3cmd
RUN pip install python-magic
ENV PATH=${PATH}:/root/.local/bin

# Install serverless
RUN npm i -g serverless

# Check that everything was installed
RUN aws --version
RUN s3cmd --version
RUN serverless --version

WORKDIR /app
CMD ["node", "--help"]
VOLUME  /app
EXPOSE 3000 80
