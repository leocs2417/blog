#!/usr/bin/python3
"""Serve blog releases at the root and redirect the former /blog prefix."""
from functools import partial
from http import HTTPStatus
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import urlsplit, urlunsplit


class BlogHandler(SimpleHTTPRequestHandler):
    def send_head(self):
        request = urlsplit(self.path)
        if request.path == "/blog" or request.path.startswith("/blog/"):
            path = "/" + request.path[5:].lstrip("/\\")
            self.send_response(HTTPStatus.MOVED_PERMANENTLY)
            self.send_header("Location", urlunsplit(("", "", path, request.query, "")))
            self.send_header("Content-Length", "0")
            self.end_headers()
            return None
        return super().send_head()


if __name__ == "__main__":
    handler = partial(BlogHandler, directory="/srv/blog/current/blog")
    with ThreadingHTTPServer(("0.0.0.0", 8089), handler) as server:
        server.serve_forever()
