from spyne import Application, Fault, Float, ServiceBase, rpc
from spyne.protocol.soap import Soap11
from spyne.server.wsgi import WsgiApplication
from wsgiref.simple_server import make_server


class CalculatorService(ServiceBase):
    @rpc(Float, Float, _returns=Float)
    def Add(ctx, a, b):
        return a + b

    @rpc(Float, Float, _returns=Float)
    def Subtract(ctx, a, b):
        return a - b

    @rpc(Float, Float, _returns=Float)
    def Multiply(ctx, a, b):
        return a * b

    @rpc(Float, Float, _returns=Float)
    def Divide(ctx, a, b):
        if b == 0:
            raise Fault(faultcode="Client", faultstring="Division by zero is not allowed")
        return a / b


application = Application(
    [CalculatorService],
    tns="chronos.calculator",
    in_protocol=Soap11(validator="lxml"),
    out_protocol=Soap11(),
)


def _cors(app):
    """Add CORS headers so the browser frontend can call the SOAP service."""

    def wrapped(environ, start_response):
        if environ["REQUEST_METHOD"] == "OPTIONS":
            start_response(
                "200 OK",
                [
                    ("Content-Type", "text/plain"),
                    ("Access-Control-Allow-Origin", "http://localhost:3000"),
                    ("Access-Control-Allow-Methods", "POST, GET, OPTIONS"),
                    ("Access-Control-Allow-Headers", "Content-Type, SOAPAction"),
                ],
            )
            return [b""]

        def _start(status, headers, exc_info=None):
            headers.append(("Access-Control-Allow-Origin", "http://localhost:3000"))
            return start_response(status, headers, exc_info)

        return app(environ, _start)

    return wrapped


wsgi_app = _cors(WsgiApplication(application))

if __name__ == "__main__":
    server = make_server("0.0.0.0", 8001, wsgi_app)
    print("SOAP Calculator → http://localhost:8001")
    print("WSDL            → http://localhost:8001/?wsdl")
    server.serve_forever()
