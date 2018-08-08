# Dockerfile # Plots2
# https://github.com/publiclab/plots2

FROM ruby:2.4.1-stretch

LABEL description="This image deploys Plots2."

# Set correct environment variables.
RUN mkdir -p /app
ENV PHANTOMJS_VERSION 2.1.1

#RUN echo \
#   'deb ftp://ftp.us.debian.org/debian/ jessie main\n \
#    deb ftp://ftp.us.debian.org/debian/ jessie-updates main\n \
#    deb http://security.debian.org jessie/updates main\n' \
#    > /etc/apt/sources.list

# Install dependencies
RUN curl -sL https://deb.nodesource.com/setup_8.x | bash -
RUN apt-get update -qq && apt-get install -y build-essential bundler libmariadbclient-dev ruby-rmagick libfreeimage3 wget curl procps cron make nodejs
RUN wget https://github.com/Medium/phantomjs/releases/download/v$PHANTOMJS_VERSION/phantomjs-$PHANTOMJS_VERSION-linux-x86_64.tar.bz2 -O /tmp/phantomjs-$PHANTOMJS_VERSION-linux-x86_64.tar.bz2; tar -xvf /tmp/phantomjs-$PHANTOMJS_VERSION-linux-x86_64.tar.bz2 -C /opt ; cp /opt/phantomjs-$PHANTOMJS_VERSION-linux-x86_64/bin/* /usr/local/bin/
RUN npm install -g bower

RUN echo "umask 0002" >> /etc/bash.bashrc

# Install bundle of gems
WORKDIR /tmp
COPY Gemfile /tmp/Gemfile
COPY Gemfile.lock /tmp/Gemfile.lock
ADD . /app
RUN mkdir -p /app/public
RUN chmod a+w /tmp /app/public -R

# Add unprivileged user
RUN adduser --disabled-password --gecos '' plots
USER plots

RUN bundle install --jobs 4

WORKDIR /app

RUN bower install
