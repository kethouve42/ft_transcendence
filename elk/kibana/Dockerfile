FROM docker.elastic.co/kibana/kibana:8.13.4

USER root

COPY ./entrypoint.sh /usr/share/kibana/entrypoint.sh
COPY ./dashboard.ndjson /usr/share/kibana/dashboard.ndjson

RUN chmod +x /usr/share/kibana/entrypoint.sh

USER kibana

ENTRYPOINT ["/usr/share/kibana/entrypoint.sh"]
