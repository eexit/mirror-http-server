![logo](logo.png)

# Mirror HTTP Server [![Build Status](https://travis-ci.org/eexit/mirror-http-server.svg)](https://travis-ci.org/eexit/mirror-http-server)

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

    http $(docker-machine ip default)

```http
HTTP/1.1 200 OK
Connection: keep-alive
Content-Length: 0
Date: Thu, 05 Nov 2015 21:33:20 GMT
X-Powered-By: Express
```

You can use any [HTTP verbs](https://en.wikipedia.org/wiki/Hypertext_Transfer_Protocol#Request_methods) with any path, any request body and any header.

### Behavioural request headers

You can change the server response code and body by setting specific `X-Mirror-*` headers to your request.

### `X-Mirror-Code`

Change the server response [status code](https://en.wikipedia.org/wiki/List_of_HTTP_status_codes).
Here, simulate a server error:

    $ http $(docker-machine ip default) X-Mirror-Code:503

```http
HTTP/1.1 503 Service Unavailable
Connection: keep-alive
Content-Length: 0
Date: Thu, 05 Nov 2015 22:30:11 GMT
X-Powered-By: Express
```

Here, simulate a `301` redirection:

    http $(docker-machine ip default) \
        X-Mirror-Code:301 \
        X-Mirror-Location:http://www.eexit.net \
        X-Mirror-Content-Type:"text/plain; charset=ISO-8859-1"

```http
HTTP/1.1 301 Moved Permanently
Connection: keep-alive
Content-Length: 0
Content-Type: text/plain; charset=ISO-8859-1
Date: Thu, 05 Nov 2015 22:40:02 GMT
Location: http://www.eexit.net
X-Powered-By: Express
```

If you add the `--follow` option, it will output my website HTML source.

If you check the container logs:

```json
[2015-11-05T22:48:59.564Z]  INFO: mirror-server/18 on 6cb74ed853b0:
    request: {
      "ip": "192.168.99.1",
      "ips": [],
      "method": "GET",
      "url": "/",
      "headers": {
        "host": "192.168.99.100",
        "x-mirror-code": "301",
        "accept-encoding": "gzip, deflate",
        "x-mirror-location": "http://www.eexit.net",
        "accept": "*/*",
        "user-agent": "HTTPie/0.9.2",
        "connection": "keep-alive",
        "x-mirror-content-type": "text/plain; charset=ISO-8859-1"
      },
      "body": {}
    }
```

### `X-Mirror-Request`

If you access to the server logs or want to exploit the what's logged, set the `X-Mirror-Request` to receive what's logged in a JSON format:

    $ http POST $(docker-machine ip default)/resource \
        X-Mirror-Code:201 \
        X-Mirror-Request:true \
        key1=value1 key2=value2

```http
HTTP/1.1 201 Created
Connection: keep-alive
Content-Length: 373
Content-Type: application/json; charset=utf-8
Date: Thu, 05 Nov 2015 22:57:17 GMT
ETag: W/"175-3rxm7gM5Zwu88cZOABP92A"
X-Powered-By: Express

{
    "request": {
        "body": {
            "key1": "value1",
            "key2": "value2"
        },
        "headers": {
            "accept": "application/json",
            "accept-encoding": "gzip, deflate",
            "connection": "keep-alive",
            "content-length": "36",
            "content-type": "application/json",
            "host": "192.168.99.100",
            "user-agent": "HTTPie/0.9.2",
            "x-mirror-code": "201",
            "x-mirror-request": "true"
        },
        "ip": "192.168.99.1",
        "ips": [],
        "method": "POST",
        "url": "/resource"
    }
}
```

### `X-Mirror-Body`

Instead, if you with the dummy server to return you the same body you requested to it, set the `X-Mirror-Body` header.

Note: the `X-Mirror-Request` header will override `X-Mirror-Body` header.

    $ http PUT $(docker-machine ip default)/resource \
        X-Mirror-Code:400 \
        X-Mirror-Body:true \
        key1=value1 key2=value2

```http
HTTP/1.1 400 Bad Request
Connection: keep-alive
Content-Length: 33
Content-Type: application/json; charset=utf-8
Date: Thu, 05 Nov 2015 23:52:34 GMT
ETag: W/"21-/0XMODUWUwfvQUwjyixvZw"
X-Powered-By: Express

{
    "key1": "value1",
    "key2": "value2"
}
```

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
