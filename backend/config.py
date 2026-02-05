import os
from dotenv import load_dotenv

class AppConfig:
    """Application Configuration loaded from environment variables."""
    MODEL_SCOPE_API_KEY: str
    SERPHOUSE_API_KEY: str
    MODEL_SCOPE_URL: str = "https://api-inference.modelscope.cn/v1"
    SERPHOUSE_SEARCH_URL: str = "https://api.serphouse.com/serp/live"
    MODEL_NAME: str = "Qwen/Qwen2.5-72B-Instruct"

app_config = None

def load_config():
    global app_config
    if app_config:
        return app_config
    
    load_dotenv()
    config = AppConfig()
    config.MODEL_SCOPE_API_KEY = os.getenv("MODEL_SCOPE_API_KEY")
    config.SERPHOUSE_API_KEY = os.getenv("SERPHOUSE_API_KEY")
    app_config = config
    return config