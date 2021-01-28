FROM 3.8.6-slim-buster

WORKDIR /api

ADD . /api

RUN pip3 install -r requirements.txt

EXPOSE 8080

CMD ["python", "server.py"]