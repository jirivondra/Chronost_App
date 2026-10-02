import http.server
import os

PORT = 3000
DIRECTORY = os.path.dirname(os.path.abspath(__file__))


class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def send_error(self, code, message=None, explain=None):
        not_found = os.path.join(DIRECTORY, "404.html")
        if code == 404 and os.path.exists(not_found):
            self.send_response(code)
            self.send_header("Content-Type", "text/html; charset=utf-8")
            self.end_headers()
            with open(not_found, "rb") as f:
                self.wfile.write(f.read())
            return
        super().send_error(code, message, explain)


if __name__ == "__main__":
    with http.server.ThreadingHTTPServer(("", PORT), Handler) as httpd:
        print(f"Serving {DIRECTORY} on http://localhost:{PORT}")
        httpd.serve_forever()
