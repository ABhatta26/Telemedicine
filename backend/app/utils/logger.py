import logging
import logging.config
import yaml
import os

def setup_logger(config_path="logging.yaml"):
    """
    Load logging configuration from YAML file.
    Ensures logs directory exists before initializing handlers.
    """
    os.makedirs("logs", exist_ok=True)

    with open(config_path, "r") as f:
        config = yaml.safe_load(f.read())
        logging.config.dictConfig(config)

    return logging.getLogger("my_app")
