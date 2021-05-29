FROM alpine:3.8

WORKDIR /

ARG FRP_VERSION=0.36.2
ARG FRP_TIMEZONE=Europe/London

RUN set -xe && \
    apk add tzdata && \
    cp /usr/share/zoneinfo/${FRP_TIMEZONE} /etc/localtime && \
    echo ${FRP_TIMEZONE} > /etc/timezone && \
    apk del tzdata

RUN set -x && \
    wget --no-check-certificate https://github.com/fatedier/frp/releases/download/v${FRP_VERSION}/frp_${FRP_VERSION}_linux_amd64.tar.gz && \
    tar xzf frp_${FRP_VERSION}_linux_amd64.tar.gz && \
    cd frp_${FRP_VERSION}_linux_amd64 && \
    mkdir /app && \
    mv frps /app && \
    cd .. && \
    rm -rf *.tar.gz frp_${FRP_VERSION}_linux_amd64

CMD /app/frps -c /app/config/frps.ini
