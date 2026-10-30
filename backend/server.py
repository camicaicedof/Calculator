"""Start Flask for the local assessment demo."""

import os

from app import create_app


if __name__ == "__main__":
    create_app().run(host="0.0.0.0", port=int(os.environ.get("PORT", "8080")),
                     debug=False, use_reloader=False)
