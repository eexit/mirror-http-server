![logo](logo.png)

# Mirror HTTP Server [![DockerHub](https://img.shields.io/docker/image-size/eexit/mirror-http-server?color=brightgreen)](https://hub.docker.com/r/eexit/mirror-http-server/) [![Firebase function](https://img.shields.io/badge/firebase-function-brightgreen)](https://mirror-http-server.web.app)

*A dummy HTTP server that responds whatever you told it to.*

Testing URL: <https://mirror-http-server.web.app>

Built to play with HTTP or test your API. Make a HTTP call to the dummy server with the specified headers you want the server responds with.

## Usage

Pull the [Docker container](https://hub.docker.com/repository/docker/eexit/mirror-http-server):

    docker pull eexit/mirror-http-server

Start the container:

    $ docker run -itp 8080:8080 eexit/mirror-http-server
    2015-11-05T20:59:57.353Z]  INFO: mirror-http-server/17 on ccc867df5980: Listening on http://0.0.0.0:8080

For this README examples, I use the great [HTTPie](https://github.com/jkbrzt/httpie) tool.

Send request against it:

    http :8080

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

Examples that simulates a `301` redirection and a `Content-Type` change:

    http :8080 \
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

### `X-Mirror-Delay`

If you need to test timeouts or errors handling like `503` HTTP responses, you can pass the
`X-Mirror-Delay` header with a number in milliseconds before the server responds.

```bash
time http :8080 X-Mirror-Code:503 X-Mirror-Delay:2000
HTTP/1.1 503 Service Unavailable
Connection: keep-alive
Content-Length: 0
Date: Fri, 20 May 2022 09:52:04 GMT
Keep-Alive: timeout=5
X-Powered-By: Express



http :8080 X-Mirror-Code:503 X-Mirror-Delay:2000  0.12s user 0.03s system 7% cpu 2.163 total
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

### Works with any headers

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

## Development

You can either use Docker to run the server locally or emulate the function using Firebase CLI:

In one terminal, run this command:

```
cd functions
yarn
firebase emulators:start --only functions
```

In another terminal, test it:

```
http http://localhost:5001/mirror-http-server/us-central1/mirror X-Mirror-Body:true message="Hello world\!"
HTTP/1.1 200 OK
connection: keep-alive
content-length: 26
content-type: application/json; charset=utf-8
date: Sun, 06 Nov 2022 10:56:21 GMT
etag: W/"1a-T7vCLEZV7pLSyUzkr9XBdG32YU8"
keep-alive: timeout=5
x-powered-by: Express

{
    "message": "Hello world!"
}
```

## Deployment

This service is host as [Google Clound Platform Cloud Function](https://firebase.google.com/docs/functions).

```
firebase deploy --only functions
```

## Todo

- Functional testing
