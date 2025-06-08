import os

class Config:
    SECRET_KEY = os.environ.get("SECRET_KEY", "supersecretkey")
    MYSQL_HOST = os.environ.get("MYSQL_HOST", "localhost")
    MYSQL_USER = os.environ.get("MYSQL_USER", "root")
    MYSQL_PASSWORD = os.environ.get("MYSQL_PASSWORD", "HashDrop@2000")
    MYSQL_DB = os.environ.get("MYSQL_DB", "employee_portal_1")
    MAIL_SERVER = "smtp.gmail.com"
    MAIL_PORT = 587
    MAIL_USE_TLS = True
    MAIL_USERNAME = os.environ.get("MAIL_USERNAME","hashdropco@gmail.com")
    MAIL_PASSWORD = os.environ.get("MAIL_PASSWORD","hyhc chtl zzzo auvn")
    GOOGLE_SHEETS_CREDENTIALS = "credentials.json"
    BASEDIR = os.path.abspath(os.path.dirname(__file__))
    UPLOAD_FOLDER = os.path.join(BASEDIR, 'uploads')