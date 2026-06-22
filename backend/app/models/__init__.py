# Import models here so Alembic can detect them during migration autogeneration.
from app.models.user import User
from app.models.device import Device
from app.models.telemetry import Telemetry
from app.models.alert import Alert