![logo](logo.png)

# Mirror HTTP Server [![Build Status](https://travis-ci.org/eexit/mirror-http-server.svg)](https://travis-ci.org/eexit/mirror-http-server) [![DockerHub](https://img.shields.io/badge/docker-hub-brightgreen.svg?style=flat)](https://hub.docker.com/r/eexit/mirror-http-server/) [![Greenkeeper badge](https://badges.greenkeeper.io/eexit/mirror-http-server.svg)](https://greenkeeper.io/)

*A dummy HTTP server that responds whatever you told him to.*

Build to play with HTTP or test your API. Make a HTTP call to the dummy server with the specified headers you want the server responds with.

## Usage

Pull the [Docker](https://www.docker.com) container:

    $ docker pull eexit/mirror-http-server

Start the container:

    $ docker run -itp 80:80 eexit/mirror-http-server
    2015-11-05T20:59:57.353Z]  INFO: mirror-http-server/17 on ccc867df5980: Listening on http://0.0.0.0:80

For this README examples, I use the great [HTTPie](https://github.com/jkbrzt/httpie) tool.

Send request againt it:

    http :80

```http
HTTP/1.1 200 OK
Connection: keep-alive
Content-Length: 0
Date: Wed, 13 Mar 2019 12:38:07 GMT
X-Powered-By: Express
```

You can use any [HTTP verbs](https://en.wikipedia.org/wiki/Hypertext_Transfer_Protocol#Request_methods) with any path, any request body and any header.

### Server behavioural request headers

You can change the server response code and body by setting specific `X-Mirror-*` headers to your request.

### `X-Mirror-Code`

Change the server response [status code](https://en.wikipedia.org/wiki/List_of_HTTP_status_codes).
Here, simulate a server error:

    $ http :80 X-Mirror-Code:503

```http
HTTP/1.1 503 Service Unavailable
Connection: keep-alive
Content-Length: 0
Date: Wed, 13 Mar 2019 12:38:39 GMT
X-Powered-By: Express
```

Here, simulates a `301` redirection and a `Content-Type` change:

    http :80 \
        X-Mirror-Code:301 \
        X-Mirror-Location:http://www.eexit.net \
        X-Mirror-Content-Type:"text/plain; charset=ISO-8859-1"

```http
HTTP/1.1 301 Moved Permanently
Connection: keep-alive
Content-Length: 0
Content-Type: text/plain; charset=ISO-8859-1
Date: Wed, 13 Mar 2019 12:41:35 GMT
Location: http://www.eexit.net
X-Powered-By: Express
```

If you add the `--follow` option, it will output my website HTML source.

If you check the container logs:

```json
[2019-03-13T12:41:35.567Z]  INFO: mirror-http-server/18 on f9c1a773d75a:
    request: {
      "ip": "172.17.0.1",
      "ips": [],
      "method": "GET",
      "url": "/",
      "headers": {
        "host": "localhost",
        "user-agent": "HTTPie/1.0.2",
        "accept-encoding": "gzip, deflate",
        "accept": "*/*",
        "connection": "keep-alive",
        "x-mirror-code": "301",
        "x-mirror-location": "http://www.eexit.net",
        "x-mirror-content-type": "text/plain; charset=ISO-8859-1"
      },
      "body": {}
    }
```

### `X-Mirror-Request`

If you can't access to the container log or want to exploit what's logged under the hood, set the `X-Mirror-Request` to receive the logged entry (as JSON):

    $ http POST :80/resource \
        X-Mirror-Code:201 \
        X-Mirror-Request:true \
        key1=value1 key2=value2

```http
HTTP/1.1 201 Created
Connection: keep-alive
Content-Length: 371
Content-Type: application/json; charset=utf-8
Date: Wed, 13 Mar 2019 12:43:02 GMT
ETag: W/"173-rgXpQ/N7aKeAq+URc1y3vQypNZk"
X-Powered-By: Express

{
    "request": {
        "body": {
            "key1": "value1",
            "key2": "value2"
        },
        "headers": {
            "accept": "application/json, */*",
            "accept-encoding": "gzip, deflate",
            "connection": "keep-alive",
            "content-length": "36",
            "content-type": "application/json",
            "host": "localhost",
            "user-agent": "HTTPie/1.0.2",
            "x-mirror-code": "201",
            "x-mirror-request": "true"
        },
        "ip": "172.17.0.1",
        "ips": [],
        "method": "POST",
        "url": "/resource"
    }
}
```

Note: if you don't specify the `true` value for the header, it'll ignored.

### `X-Mirror-Body`

Instead, if you wish the dummy server to return you the body you sent to it, set the `X-Mirror-Body` header.

Note: the `X-Mirror-Request` header will override `X-Mirror-Body` header.

    $ http PUT :80/resource \
        X-Mirror-Code:400 \
        X-Mirror-Body:true \
        key1=value1 key2=value2

```http
HTTP/1.1 400 Bad Request
Connection: keep-alive
Content-Length: 33
Content-Type: application/json; charset=utf-8
Date: Wed, 13 Mar 2019 12:43:45 GMT
ETag: W/"21-SWsq4vawbQc/koBuf3CC1L6ssws"
X-Powered-By: Express

{
    "key1": "value1",
    "key2": "value2"
}
```
Note: if you don't specify the `true` value for the header, it'll ignored.

### Works for all headers

Aside to the previous three special headers, you can set your wanted response header by prepending your header name by `X-Mirror-`.

In the request:

```http
Content-Type: application/json
X-Mirror-Content-Type: text/html
```

You'll get in your response:

```http
Content-Type: text/html
```

You can even override Express headers or any other default header:

```http
X-Mirror-X-Powered-By: eexit-engine
X-Mirror-Date: some date
```

Will turn into:

```http
X-Powered-By: eexit-engine
Date: some date
```

## Todo

 - Functional testing
