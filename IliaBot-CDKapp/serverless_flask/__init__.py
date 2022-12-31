from flask import Flask, request
import os
import json
import logging


def create_app(config_overrides={}) -> Flask:
    app = Flask("serverless-flask")
    # Apply a JSON config override from env var if exists
    if os.environ.get("JSON_CONFIG_OVERRIDE"):
        app.config.update(json.loads(os.environ.get("JSON_CONFIG_OVERRIDE")))

    if os.environ.get("DEBUG", False):
        app.logger.setLevel(logging.DEBUG)

    app.config.update(config_overrides)

    import serverless_flask.app as App

    app.register_blueprint(App.app)

    app.logger.debug("Config is: %r" % app.config)

    @app.after_request
    def after_request(response):
        response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
        response.headers["Expires"] = 0
        response.headers["Pragma"] = "no-cache"
        response.headers["X-Frame-Options"] = "SAMEORIGIN"
        response.headers["Content-Security-Policy"] = "frame-ancestors self"
        app.logger.info(
            "[from:%s|%s %s]+[%s]=>[%d|%dbytes]"
            % (
                request.remote_addr,
                request.method,
                request.url,
                request.data,
                response.status_code,
                response.content_length,
            )
        )
        return response

    return app
